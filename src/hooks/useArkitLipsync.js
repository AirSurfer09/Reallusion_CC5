import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import {
  BONE_NAMES,
  BLINK_MORPHS,
  ANIMATION_CONFIG,
  JAW_CONFIG,
  TONGUE_CONFIG,
  ARKIT_BLENDSHAPES,
  ARKIT_TO_CC_EXTENDED,
  ARKIT_TO_RPM,
  ARKIT_TO_ARKIT,
  convertMetaHumanToCC5Direct,
  getBonePreset,
} from "../constants";

// Import MetaHuman format from SDK (use relative path in local example)
import { METAHUMAN_ORDER_251 } from "@convai/web-sdk";

/**
 * Time-Based Lipsync Configuration
 *
 * Blendshapes arrive BEFORE audio playback starts. We buffer them in a queue,
 * then start playback when bot-started-speaking triggers.
 *
 * Time-based matching: elapsed_time * ~60fps = target_frame_index
 *
 * MODULAR MAPPING SYSTEM:
 * Supports different mapping presets:
 * - 'ARKIT_TO_CC_EXTENDED': ARKit → Character Creator Extended (default)
 * - 'ARKIT_TO_RPM': ARKit → Ready Player Me
 * - 'ARKIT_TO_ARKIT': ARKit → ARKit (passthrough)
 * - 'METAHUMAN_TO_CC5': MetaHuman → CC5 (complex combination mapping)
 */
const TARGET_FPS = 60;

// Default ARKit blendshape order
const ARKIT_ORDER_61 = ARKIT_BLENDSHAPES;

const JAW_OPEN_INDEX_61 = 17;
const JAW_OPEN_INDEX_52 = 24;
const TONGUE_OUT_INDEX = 51;
const FRAME_OFFSET = 15;

/**
 * Mapping preset configurations
 */
const MAPPING_PRESETS = {
  ARKIT_TO_CC_EXTENDED: {
    mapping: ARKIT_TO_CC_EXTENDED,
    sourceFormat: "arkit",
    bonePreset: "CC_EXTENDED",
  },
  ARKIT_TO_RPM: {
    mapping: ARKIT_TO_RPM,
    sourceFormat: "arkit",
    bonePreset: "RPM",
  },
  ARKIT_TO_ARKIT: {
    mapping: ARKIT_TO_ARKIT,
    sourceFormat: "arkit",
    bonePreset: "ARKIT",
  },
  METAHUMAN_TO_CC5: {
    mapping: null, // Uses convertMetaHumanToCC5 function
    sourceFormat: "metahuman",
    bonePreset: "CC5",
  },
};

/**
 * ARKit/MetaHuman Lipsync Hook
 *
 * @param {Object} options
 * @param {Object} options.convaiClient - Convai client instance
 * @param {Object} options.characterRef - Ref to character group
 * @param {Object} options.scene - Three.js scene
 * @param {string} options.mappingPreset - Preset name: 'ARKIT_TO_CC_EXTENDED' | 'ARKIT_TO_RPM' | 'ARKIT_TO_ARKIT' | 'METAHUMAN_TO_CC5'
 * @param {Object} options.customMapping - Optional custom mapping to override preset (for ARKit sources)
 * @param {Object} options.boneNames - Optional override for bone names { JAW, TONGUE_01, TONGUE_02 }
 *
 * @example
 * // Using preset
 * useArkitLipsync({ convaiClient, characterRef, scene, mappingPreset: 'ARKIT_TO_CC_EXTENDED' });
 *
 * // Using preset with custom overrides
 * useArkitLipsync({
 *   convaiClient, characterRef, scene,
 *   mappingPreset: 'ARKIT_TO_CC_EXTENDED',
 *   customMapping: { jawOpen: 'My_Custom_Jaw' }
 * });
 *
 * // MetaHuman to CC5
 * useArkitLipsync({ convaiClient, characterRef, scene, mappingPreset: 'METAHUMAN_TO_CC5' });
 */
export const useArkitLipsync = ({
  convaiClient,
  characterRef,
  scene,
  mappingPreset = "ARKIT_TO_CC_EXTENDED",
  customMapping = {},
  boneNames: customBoneNames,
  // Legacy support
  arkitToModelMapping,
}) => {
  // Resolve mapping configuration
  const mappingConfig = useMemo(() => {
    const preset = MAPPING_PRESETS[mappingPreset];

    if (!preset) {
      console.warn(
        `[Lipsync] Unknown preset: ${mappingPreset}, falling back to ARKIT_TO_CC_EXTENDED`,
      );
      return MAPPING_PRESETS.ARKIT_TO_CC_EXTENDED;
    }

    return preset;
  }, [mappingPreset]);

  // Resolve the actual mapping to use
  const resolvedMapping = useMemo(() => {
    // Legacy support: if arkitToModelMapping is provided, use it
    if (arkitToModelMapping && Object.keys(arkitToModelMapping).length > 0) {
      return arkitToModelMapping;
    }

    // For MetaHuman, we don't use a simple mapping object
    if (mappingConfig.sourceFormat === "metahuman") {
      return null;
    }

    // Merge preset mapping with custom overrides
    return {
      ...mappingConfig.mapping,
      ...customMapping,
    };
  }, [mappingConfig, customMapping, arkitToModelMapping]);

  // Resolve bone names
  const boneNames = useMemo(() => {
    if (customBoneNames) {
      return customBoneNames;
    }
    return getBonePreset(mappingConfig.bonePreset);
  }, [customBoneNames, mappingConfig.bonePreset]);

  // Playback state
  const playbackStateRef = useRef({
    isPlaying: false,
    startTime: 0,
    currentFrameIndex: 0,
    isDraining: false,
    fadeInWeight: 0,
  });

  // Listen for blendshapes being added to start playback
  useEffect(() => {
    if (!convaiClient || typeof convaiClient.on !== "function") {
      return;
    }

    const handleBlendshapesAdded = (data) => {
      const queue = convaiClient.blendshapeQueue;
      const state = playbackStateRef.current;

      if (queue?.isConversationActive() && !state.isPlaying) {
        state.isPlaying = true;
        state.startTime = Date.now();
        state.currentFrameIndex = 0;
        state.isDraining = false;
        state.fadeInWeight = 0;
        setIsPlaying(true);
      }
    };

    convaiClient.on("blendshapes", handleBlendshapesAdded);

    return () => {
      convaiClient.off("blendshapes", handleBlendshapesAdded);
    };
  }, [convaiClient]);

  // Listen for bot speaking state changes
  useEffect(() => {
    if (!convaiClient || !convaiClient.state) {
      return;
    }

    const state = playbackStateRef.current;

    if (convaiClient.state.isSpeaking && !state.isPlaying) {
      state.isPlaying = true;
      state.startTime = Date.now();
      state.currentFrameIndex = 0;
      state.isDraining = false;
      state.fadeInWeight = 0;
      state.slowdownAdjustedTime = 0; // Reset slowdown time
      setIsPlaying(true);
    }
  }, [convaiClient?.state?.isSpeaking]);

  // Listen for blendshape stats (marks conversation end)
  useEffect(() => {
    if (!convaiClient || typeof convaiClient.on !== "function") {
      return;
    }

    const handleStatsReceived = (stats) => {
      const state = playbackStateRef.current;
      state.isDraining = true;
    };

    convaiClient.on("blendshapeStatsReceived", handleStatsReceived);

    return () => {
      convaiClient.off("blendshapeStatsReceived", handleStatsReceived);
    };
  }, [convaiClient]);

  // Playback state for UI
  const [isPlaying, setIsPlaying] = useState(false);

  const morphCacheRef = useRef(new Map());
  const jawBoneRef = useRef(null);
  const jawBaseRotationZRef = useRef(null);
  const currentJawRotationRef = useRef(null);
  const tongue01BoneRef = useRef(null);
  const tongue02BoneRef = useRef(null);
  const tongueDefaultPos = useRef({ x: 0, y: 0 });
  const lowerTeethBoneRef = useRef(null); // CC_Base_Teeth02 bone for lower teeth adjustment
  const lowerTeethBaseYRef = useRef(null); // Store original Y position
  const lowerTeethBaseXRef = useRef(null); // Store original X position
  const upperTeethBoneRef = useRef(null); // CC_Base_Teeth01 bone for upper teeth adjustment
  const upperTeethBaseYRef = useRef(null); // Store original Y position

  const blinkRef = useRef({
    isBlinking: false,
    value: 0,
    nextBlinkTime: 0,
  });

  // Smoothed morph target values (for continuous per-frame lerping like head tracking)
  // This creates buttery smooth animation similar to head/pupil tracking
  const smoothedMorphValues = useRef(new Map()); // morphName -> currentSmoothedValue

  // Idle animation blend weight (1.0 = full animation, 0.0 = full lipsync)
  const idleAnimationBlendWeight = useRef(1.0);

  // Initialization - build morph cache and find bones
  useEffect(() => {
    if (!characterRef.current) return;

    // Use configurable bone names
    if (boneNames.JAW) {
      jawBoneRef.current = characterRef.current.getObjectByName(boneNames.JAW);
      if (jawBoneRef.current && jawBaseRotationZRef.current === null) {
        jawBaseRotationZRef.current = jawBoneRef.current.rotation.z;
        currentJawRotationRef.current = jawBoneRef.current.rotation.z;
      }
    }

    if (boneNames.TONGUE_01) {
      tongue01BoneRef.current = characterRef.current.getObjectByName(
        boneNames.TONGUE_01,
      );
    }
    if (boneNames.TONGUE_02) {
      tongue02BoneRef.current = characterRef.current.getObjectByName(
        boneNames.TONGUE_02,
      );
    }

    if (tongue02BoneRef.current) {
      tongueDefaultPos.current.x = tongue02BoneRef.current.position.x;
      tongueDefaultPos.current.y = tongue02BoneRef.current.position.y;
    }

    // Find lower teeth bone (CC_Base_Teeth02)
    if (characterRef.current) {
      lowerTeethBoneRef.current =
        characterRef.current.getObjectByName("CC_Base_Teeth02");
      if (lowerTeethBoneRef.current && lowerTeethBaseYRef.current === null) {
        lowerTeethBaseYRef.current = lowerTeethBoneRef.current.position.y;
        lowerTeethBaseXRef.current = lowerTeethBoneRef.current.position.x;
        console.log(
          "[Lipsync] Lower teeth bone found:",
          lowerTeethBoneRef.current.name,
          "Base Y:",
          lowerTeethBaseYRef.current,
          "Base X:",
          lowerTeethBaseXRef.current,
        );
      }
    }

    // Find upper teeth bone (CC_Base_Teeth01)
    if (characterRef.current) {
      upperTeethBoneRef.current =
        characterRef.current.getObjectByName("CC_Base_Teeth01");
      if (upperTeethBoneRef.current && upperTeethBaseYRef.current === null) {
        upperTeethBaseYRef.current = upperTeethBoneRef.current.position.y;
        console.log(
          "[Lipsync] Upper teeth bone found:",
          upperTeethBoneRef.current.name,
          "Base Y:",
          upperTeethBaseYRef.current,
        );
      }
    }

    if (scene) {
      const cache = new Map();
      scene.traverse((child) => {
        if (
          child.isSkinnedMesh &&
          child.morphTargetDictionary &&
          child.morphTargetInfluences
        ) {
          Object.entries(child.morphTargetDictionary).forEach(
            ([name, index]) => {
              if (!cache.has(name)) cache.set(name, []);
              cache.get(name).push({
                influences: child.morphTargetInfluences,
                index: index,
              });
            },
          );
        }
      });
      morphCacheRef.current = cache;
    }
  }, [characterRef, scene, boneNames]);

  // Animation Loop - Time-based frame playback
  useFrame((threeState, delta) => {
    const state = playbackStateRef.current;
    const morphCache = morphCacheRef.current;
    const currentTime = threeState.clock.elapsedTime * 1000;

    // Always blink, regardless of queue availability
    applyBlinking(morphCache, blinkRef.current, currentTime, delta);

    // Safety check: ensure queue is available for lipsync
    const queue = convaiClient?.blendshapeQueue;
    if (!queue) {
      return;
    }

    // If not playing, reset to neutral (but preserve blink)
    if (!state.isPlaying) {
      // Blend weight back to 1.0 when not speaking (animation takes over)
      const currentBlendWeight = idleAnimationBlendWeight.current;
      idleAnimationBlendWeight.current =
        currentBlendWeight + (1.0 - currentBlendWeight) * 0.15;

      resetToNeutral(
        morphCache,
        smoothedMorphValues.current,
        jawBoneRef.current,
        jawBaseRotationZRef.current,
        currentJawRotationRef,
        tongue01BoneRef.current,
        tongue02BoneRef.current,
        tongueDefaultPos.current,
        ANIMATION_CONFIG.FADE_OUT_LERP_SPEED, // Use slower fade-out speed
        ANIMATION_CONFIG.FADE_OUT_LERP_SPEED, // Use same slow speed for jaw
      );
      return;
    }

    // Get frames from queue
    const frames = queue.getFrames();

    // If no frames available yet, wait
    if (frames.length === 0) {
      if (state.isDraining) {
        state.isPlaying = false;
        state.isDraining = false;
        state.currentFrameIndex = 0;
        queue.reset();
        setIsPlaying(false);
        resetToNeutral(
          morphCache,
          smoothedMorphValues.current,
          jawBoneRef.current,
          jawBaseRotationZRef.current,
          currentJawRotationRef,
          tongue01BoneRef.current,
          tongue02BoneRef.current,
          tongueDefaultPos.current,
          ANIMATION_CONFIG.LIPSYNC_LERP_SPEED,
        );
      }
      return;
    }

    // Calculate elapsed time since bot started speaking
    const elapsedTimeMs = Date.now() - state.startTime;
    const elapsedTimeSec = elapsedTimeMs / 1000;

    // Calculate fade-in weight for smooth lipsync start
    state.fadeInWeight = Math.min(
      1,
      elapsedTimeSec / ANIMATION_CONFIG.LIPSYNC_FADE_IN_DURATION,
    );

    // Smoothly blend between idle animation and lipsync morphs
    // Target: 0.0 when speaking (lipsync takes over completely), 1.0 when idle (animation takes over)
    const targetBlendWeight = 0.0; // 0% animation = 100% lipsync control
    const currentBlendWeight = idleAnimationBlendWeight.current;
    idleAnimationBlendWeight.current =
      currentBlendWeight + (targetBlendWeight - currentBlendWeight) * 0.15;

    // Calculate target frame index using approximate 60fps
    // Slow down playback for the last few frames for smoother mouth close
    const SLOWDOWN_FRAME_COUNT = 10; // Number of frames to slow down
    const SLOWDOWN_SPEED_FACTOR = 0.35; // Speed multiplier for last frames (35% speed)

    let effectiveElapsedTime = elapsedTimeSec;

    // Calculate normal frame position
    const normalFramePos = elapsedTimeSec * TARGET_FPS + FRAME_OFFSET;
    const normalFrameIndex = Math.floor(normalFramePos);

    // Check if we're in the slowdown zone (last N frames)
    const framesFromEnd = frames.length - normalFrameIndex;
    if (framesFromEnd <= SLOWDOWN_FRAME_COUNT && framesFromEnd > 0) {
      // Calculate how far into slowdown zone we are (0 = start of slowdown, 1 = last frame)
      const slowdownProgress = 1 - framesFromEnd / SLOWDOWN_FRAME_COUNT;

      // Apply progressive slowdown (gets slower as we approach the end)
      const currentSpeedFactor =
        1.0 - slowdownProgress * (1.0 - SLOWDOWN_SPEED_FACTOR);
      effectiveElapsedTime = state.slowdownAdjustedTime || elapsedTimeSec;
      effectiveElapsedTime += delta * currentSpeedFactor;
      state.slowdownAdjustedTime = effectiveElapsedTime;
    } else {
      state.slowdownAdjustedTime = elapsedTimeSec;
    }

    const exactFramePos = effectiveElapsedTime * TARGET_FPS + FRAME_OFFSET;
    const targetFrameIndex = Math.floor(exactFramePos);

    // Calculate interpolation factor (fractional part of frame position)
    const frameInterpolation = exactFramePos - targetFrameIndex;

    // Use target frame but clamp to available frames
    const frameIndex = Math.min(targetFrameIndex, frames.length - 1);
    const nextFrameIndex = Math.min(frameIndex + 1, frames.length - 1);

    // Check if we're at the end of available frames
    if (frameIndex >= frames.length - 1) {
      if (state.isDraining) {
        state.isPlaying = false;
        state.isDraining = false;
        state.currentFrameIndex = 0;
        queue.reset();
        setIsPlaying(false);
        // Don't call resetToNeutral here - let the loop handle it
        // The !state.isPlaying check above will handle smooth fade-out
        return;
      }
    }

    // Safety check: ensure frameIndex is valid
    if (frameIndex < 0 || frameIndex >= frames.length) {
      return;
    }

    // Get current and next frames for interpolation
    const currentFrame = frames[frameIndex];
    const nextFrame = frames[nextFrameIndex];

    // Verify current frame is valid
    const isValidCurrentFrame =
      currentFrame &&
      ((Array.isArray(currentFrame) && currentFrame.length > 0) || // ARKit array format
        (typeof currentFrame === "object" &&
          Object.keys(currentFrame).length > 0)); // MetaHuman object format

    if (!isValidCurrentFrame) {
      console.warn("[Lipsync] Invalid frame at index", frameIndex);
      return;
    }

    // Interpolate between current and next frame for smooth transitions
    // TEMPORARILY DISABLED - Testing if interpolation causes stuttering
    let interpolatedFrame = currentFrame;

    /*
    // Only interpolate if we have a valid next frame AND they're different frames
    const shouldInterpolate = 
      nextFrame && 
      frameIndex !== nextFrameIndex &&
      frameInterpolation > 0.001; // Small threshold to avoid unnecessary computation
    
    if (shouldInterpolate) {
      // Create interpolated frame
      if (Array.isArray(currentFrame)) {
        // ARKit array format - interpolate each value
        interpolatedFrame = currentFrame.map((currentValue, index) => {
          const nextValue = nextFrame[index] || 0;
          return currentValue + (nextValue - currentValue) * frameInterpolation;
        });
      } else {
        // MetaHuman object format - interpolate each key
        interpolatedFrame = {};
        // Only iterate through keys that exist in current frame
        for (const key of Object.keys(currentFrame)) {
          const currentValue = currentFrame[key] || 0;
          const nextValue = nextFrame[key] || 0;
          interpolatedFrame[key] = currentValue + (nextValue - currentValue) * frameInterpolation;
        }
      }
    } else {
      // No interpolation needed, use current frame directly
      interpolatedFrame = currentFrame;
    }
    */

    // Apply blendshapes based on mapping type
    // Smoothing is handled by per-frame lerping via LIPSYNC_LERP_SPEED
    const lipsyncLerpSpeed = ANIMATION_CONFIG.LIPSYNC_LERP_SPEED;
    const jawLerpSpeed = ANIMATION_CONFIG.JAW_LERP_SPEED;

    if (mappingConfig.sourceFormat === "metahuman") {
      // MetaHuman to CC5 - use direct mapping with interpolated frame
      applyMetaHumanToCC5(
        morphCache,
        smoothedMorphValues.current,
        interpolatedFrame,
        state.fadeInWeight,
        jawBoneRef.current,
        jawBaseRotationZRef.current,
        currentJawRotationRef,
        lowerTeethBoneRef.current,
        lowerTeethBaseYRef.current,
        lowerTeethBaseXRef.current,
        upperTeethBoneRef.current,
        upperTeethBaseYRef.current,
        lipsyncLerpSpeed,
        jawLerpSpeed,
        idleAnimationBlendWeight.current, // Pass blend weight for animation/lipsync blending
      );
    } else {
      // ARKit-based mapping (simple 1:1) with interpolated frame
      applyArkitMapping(
        morphCache,
        smoothedMorphValues.current,
        resolvedMapping,
        interpolatedFrame,
        state.fadeInWeight,
        jawBoneRef.current,
        jawBaseRotationZRef.current,
        currentJawRotationRef,
        tongue01BoneRef.current,
        tongue02BoneRef.current,
        tongueDefaultPos.current,
        lipsyncLerpSpeed,
        jawLerpSpeed,
      );
    }

    // Update current frame index for tracking
    state.currentFrameIndex = frameIndex;
  });

  return {
    isPlaying,
    totalFrames: convaiClient?.blendshapeQueue?.length || 0,
    mappingPreset,
    sourceFormat: mappingConfig.sourceFormat,
  };
};

// ============================================================================
// APPLY FUNCTIONS
// ============================================================================

/**
 * Apply ARKit-based mapping (simple 1:1 mapping)
 */
function applyArkitMapping(
  morphCache,
  smoothedMorphValues,
  mapping,
  currentFrame,
  fadeInWeight,
  jawBone,
  jawBaseRotationZ,
  currentJawRotationRef,
  tongue01,
  tongue02,
  tongueDefaultPos,
  lipsyncLerpSpeed,
  jawLerpSpeed,
) {
  // Determine format
  const is61Format = currentFrame.length >= 60;
  const jawIndex = is61Format ? JAW_OPEN_INDEX_61 : JAW_OPEN_INDEX_52;
  const maxIndex = Math.min(52, currentFrame.length);

  // Apply blendshapes (skip jaw and tongue - controlled by bones)
  for (let i = 0; i < maxIndex; i++) {
    const arkitName = ARKIT_ORDER_61[i];
    if (
      arkitName === "jawOpen" ||
      arkitName === "mouthClose" ||
      arkitName === "tongueOut"
    )
      continue;

    let value = currentFrame[i] || 0;

    const morphMapping = mapping[arkitName] || arkitName;

    // Skip if mapping is null (morph not available on this model)
    if (morphMapping === null) continue;

    // Apply multiplier to brow morphs (reduce intensity)
    const isBrowMorph = arkitName.toLowerCase().includes("brow");
    if (isBrowMorph) {
      value *= 0.6;
    }

    // Apply fade-in weight for smooth lipsync start
    value *= fadeInWeight;

    // Handle both single morph target (string) and multiple targets (array)
    // Use smooth apply for continuous per-frame lerping (like head tracking)
    if (Array.isArray(morphMapping)) {
      morphMapping.forEach((morphName) => {
        applyMorphValueSmooth(
          morphCache,
          smoothedMorphValues,
          morphName,
          value,
          lipsyncLerpSpeed,
        );
      });
    } else {
      applyMorphValueSmooth(
        morphCache,
        smoothedMorphValues,
        morphMapping,
        value,
        lipsyncLerpSpeed,
      );
    }
  }

  // Apply jaw (bone only - never use morph)
  let jawValue = (currentFrame[jawIndex] || 0) * fadeInWeight;

  if (jawBone) {
    applyJawBoneSmooth(
      jawBone,
      jawBaseRotationZ,
      currentJawRotationRef,
      jawValue,
      jawLerpSpeed,
    );
  }

  // Apply tongue (bone or morph depending on model)
  const tongueValue = (currentFrame[TONGUE_OUT_INDEX] || 0) * fadeInWeight;
  const tongueMorphName = mapping["tongueOut"];

  if (tongueMorphName) {
    applyMorphValueSmooth(
      morphCache,
      smoothedMorphValues,
      tongueMorphName,
      tongueValue,
      lipsyncLerpSpeed,
    );
  } else if (tongue01 || tongue02) {
    applyTongueBone(tongue01, tongue02, tongueDefaultPos, tongueValue);
  }
}

/**
 * Apply MetaHuman to CC5 mapping - DIRECT (1:1) mapping for Zari
 *
 * Server sends MetaHuman blendshapes as arrays with 251 values per frame.
 * We map these array indices to CTRL_expressions_* names, then use
 * convertMetaHumanToCC5Direct() to get direct CC5 blendshapes (no correctives).
 *
 * Flow: Array[251] → CTRL_expressions_* → convertMetaHumanToCC5Direct() → Base CC5 morphs
 *
 * This uses DIRECT 1:1 mapping (210 total mappings):
 * - Simple passthrough: Each CTRL_expressions_* maps to one CC5 blendshape
 * - No corrective combinations
 * - Faster and simpler than combination mapping
 *
 * JAW BONE ROTATION:
 * - Morphs with "JawOpen" in the name are SKIPPED (not applied as morphs)
 * - Instead, CTRL_expressions_jawOpen is used for jaw bone rotation (CC_Base_JawRoot)
 * - This matches the behavior of CC4_EXTENDED where jawOpen uses bone rotation
 *
 * Example: Array index 0 → CTRL_expressions_eyeBlinkL → Eye_Blink_L
 */
function applyMetaHumanToCC5(
  morphCache,
  smoothedMorphValues,
  currentFrame,
  fadeInWeight,
  jawBone,
  jawBaseRotationZ,
  currentJawRotationRef,
  lowerTeethBone,
  lowerTeethBaseY,
  lowerTeethBaseX,
  upperTeethBone,
  upperTeethBaseY,
  lipsyncLerpSpeed,
  jawLerpSpeed,
  animationBlendWeight = 0,
) {
  // Server sends MetaHuman blendshapes as array with 251 values
  // Map array indices to MetaHuman CTRL_expressions_* names using SDK definition
  const metahumanBlendshapes = {};

  // Map array indices to MetaHuman CTRL_expressions_* names
  // Only process non-zero values for performance
  METAHUMAN_ORDER_251.forEach((ctrlName, index) => {
    if (index < currentFrame.length) {
      const value = currentFrame[index];
      // Skip if zero or undefined
      if (!value) {
        return;
      }

      // Apply fade-in weight for smooth start
      metahumanBlendshapes[ctrlName] = value * fadeInWeight;
    }
  });

  // Use the convertMetaHumanToCC5Direct function for simple 1:1 mapping
  // This is optimized for Zari's blendshape setup (no correctives)
  // Input: CTRL_expressions_* object
  // Output: ~210 direct CC5 blendshapes (Eye_Blink_L, Jaw_Open, etc.)
  const cc5Values = convertMetaHumanToCC5Direct(metahumanBlendshapes);

  // Apply CC5 blendshapes to the model
  // NOTE: Skip morphs with "JawOpen" in the name - jaw is controlled by bone rotation
  // Performance optimization: Only apply non-zero values
  for (const [morphName, value] of Object.entries(cc5Values)) {
    // Filter out jaw open morphs - these should use bone rotation instead
    if (morphName.includes("JawOpen") || morphName.includes("Jaw_Open")) {
      continue; // Skip this morph
    }

    // Skip zero/near-zero values for performance (but still lerp down existing values)
    // Check if there's an existing smoothed value that needs to lerp to zero
    const hasExistingValue = smoothedMorphValues.has(morphName);
    if (value < 0.001 && !hasExistingValue) {
      continue; // Skip - no value and nothing to lerp down
    }

    // Apply with smooth lerping (scaling is now handled in the mapping file)
    applyMorphValueSmooth(
      morphCache,
      smoothedMorphValues,
      morphName,
      value,
      lipsyncLerpSpeed,
      animationBlendWeight,
    );
  }

  // Apply jaw bone rotation (CC5 uses same bone structure as CC Extended)
  // Use CTRL_expressions_jawOpen for bone rotation (clamped to max 0.7, reduce by 0.1 only when >= 0.3)
  const rawJawValue = Math.min(
    metahumanBlendshapes["CTRL_expressions_jawOpen"] || 0,
    0.7,
  );
  const jawValue = rawJawValue < 0.3 ? rawJawValue : rawJawValue - 0.1; // Only subtract 0.1 when >= 0.3
  if (jawBone) {
    applyJawBoneSmooth(
      jawBone,
      jawBaseRotationZ,
      currentJawRotationRef,
      jawValue,
      jawLerpSpeed,
    );
  }

  // Apply lower teeth bone adjustment based on jaw opening
  // Use exponential curve: starts low, ramps up quickly at higher jaw values
  // Move down (Y) and back (X) to hide teeth inside the mouth
  if (lowerTeethBone && lowerTeethBaseY !== null && lowerTeethBaseX !== null) {
    // Normalize jaw value to 0-1 range (assuming max jaw open is around 0.7)
    const normalizedJaw = Math.min(jawValue / 0.7, 1.0);
    // Use exponential curve (x^2.5) - stays low at first, ramps up quickly
    const exponentialJaw = Math.pow(normalizedJaw, 2.5);
    const yOffset = THREE.MathUtils.lerp(0.2, 0.5, exponentialJaw); // 0.2 when closed, 0.5 when open
    lowerTeethBone.position.y = lowerTeethBaseY + yOffset;
    // lowerTeethBone.position.x = lowerTeethBaseX - 0.3; // Constant back offset
    lowerTeethBone.updateMatrixWorld(true);
  }

  // Apply upper teeth bone adjustment based on jaw opening
  // Interpolate Y offset from -0.1 (jaw closed) to -0.2 (jaw fully open)
  if (upperTeethBone && upperTeethBaseY !== null) {
    // Normalize jaw value to 0-1 range (assuming max jaw open is around 0.7)
    const normalizedJaw = Math.min(jawValue / 0.7, 1.0);
    const yOffset = THREE.MathUtils.lerp(-0.1, -0.2, normalizedJaw); // -0.1 when closed, -0.2 when open
    upperTeethBone.position.y = upperTeethBaseY + yOffset; // Negative = up
    upperTeethBone.updateMatrixWorld(true);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Apply morph target value with continuous per-frame smoothing (like head tracking)
 * This creates buttery smooth animation by lerping every frame, not just between frames
 *
 * @param {Map} morphCache - Map of morph target names to mesh references
 * @param {Map} smoothedValues - Map of current smoothed values
 * @param {string} name - Morph target name
 * @param {number} targetValue - Target value for the morph (from lipsync)
 * @param {number} lerpSpeed - Lerp speed for smoothing
 * @param {number} animationBlendWeight - Weight of animation (0-1), where 1 = full animation, 0 = full lipsync
 */
function applyMorphValueSmooth(
  morphCache,
  smoothedValues,
  name,
  targetValue,
  lerpSpeed,
  animationBlendWeight = 0,
) {
  const targets = morphCache.get(name);
  if (!targets) return;

  // Performance optimization: Skip animation value reading when blend weight is near zero
  // During speech (blend weight ~0), we don't need to read animation values
  let blendedTarget;

  if (animationBlendWeight < 0.01) {
    // Full lipsync control - no animation blending needed
    blendedTarget = targetValue;
  } else {
    // Read the current animation morph value from the first target
    // (Animation system sets these values directly on the influences array)
    const animationValue = targets[0]?.influences[targets[0].index] || 0;

    // Blend: animation value * weight + lipsync value * (1 - weight)
    blendedTarget =
      animationValue * animationBlendWeight +
      targetValue * (1 - animationBlendWeight);
  }

  // Get current smoothed value (or initialize to 0 when no blend weight)
  const currentValue = smoothedValues.get(name) || 0;

  // Lerp towards blended target value every frame (like head tracking does)
  const newValue = currentValue + (blendedTarget - currentValue) * lerpSpeed;

  // Store smoothed value
  smoothedValues.set(name, newValue);

  // Apply to all morph targets with this name
  for (let i = 0; i < targets.length; i++) {
    targets[i].influences[targets[i].index] = newValue;
  }
}

/**
 * Legacy direct apply function (no smoothing)
 * Used when ENABLE_INTERPOLATION is false
 */
function applyMorphValue(morphCache, name, value) {
  const targets = morphCache.get(name);
  if (!targets) return;
  for (let i = 0; i < targets.length; i++) {
    targets[i].influences[targets[i].index] = value;
  }
}

// Jaw opening curve - matches Unreal MetaHuman configuration
// All jaw-related curves in Unreal use simple linear pass-through (0,0) to (1,1)
// This means no remapping, just smooth lerping
const JAW_OPEN_CURVE = [
  { time: 0, value: 0 },
  { time: 1, value: 1 },
];

/**
 * Evaluate a curve for jaw movement
 * @param {Array<{time: number, value: number}>} keys - Curve keyframes
 * @param {number} inputValue - Input value (0-1)
 * @returns {number} Interpolated output value
 */
function evaluateJawCurve(keys, inputValue) {
  if (!keys || keys.length === 0) {
    return inputValue;
  }

  // Clamp input to valid range
  inputValue = Math.max(0, Math.min(1, inputValue));

  // Find the two keyframes to interpolate between
  let startKey = keys[0];
  let endKey = keys[keys.length - 1];

  // If input is before first key or after last key, clamp to boundary
  if (inputValue <= startKey.time) {
    return startKey.value;
  }
  if (inputValue >= endKey.time) {
    return endKey.value;
  }

  // Find the two keys that bracket the input value
  for (let i = 0; i < keys.length - 1; i++) {
    if (inputValue >= keys[i].time && inputValue <= keys[i + 1].time) {
      startKey = keys[i];
      endKey = keys[i + 1];
      break;
    }
  }

  // Linear interpolation between the two keys
  const timeDelta = endKey.time - startKey.time;
  if (timeDelta === 0) {
    return startKey.value;
  }

  const t = (inputValue - startKey.time) / timeDelta;
  return startKey.value + (endKey.value - startKey.value) * t;
}

function jawValueToRotation(jawBaseRotationZ, jawValue) {
  // Apply curve evaluation for smooth jaw movement (like morphs in metahumanToCC5.js)
  const clampedValue = Math.max(0, Math.min(1, jawValue));

  // Apply the jaw curve for natural movement
  const easedValue = evaluateJawCurve(JAW_OPEN_CURVE, clampedValue);

  // Linear interpolation between 90° (1.5708 rad) and 99.6° (1.7384 rad)
  const rotation =
    JAW_CONFIG.CLOSED_ROTATION + easedValue * JAW_CONFIG.ROTATION_RANGE;

  return rotation;
}

function applyJawBoneSmooth(
  jawBone,
  jawBaseRotationZ,
  currentRotationRef,
  jawValue,
  lerpSpeed,
) {
  if (!jawBone) return;

  const targetRotation = jawValueToRotation(jawBaseRotationZ, jawValue);

  // Get current rotation
  const currentRotation =
    currentRotationRef.current !== null
      ? currentRotationRef.current
      : jawBone.rotation.z;

  // Smooth lerp every frame (like head tracking)
  const newRotation =
    currentRotation + (targetRotation - currentRotation) * lerpSpeed;

  // Apply smoothed rotation
  jawBone.rotation.z = newRotation;
  currentRotationRef.current = newRotation;
}

function applyTongueBone(tongue01, tongue02, defaultPos, tongueValue) {
  if (tongueValue > TONGUE_CONFIG.ACTIVE_THRESHOLD) {
    if (tongue01) {
      tongue01.rotation.z =
        TONGUE_CONFIG.ROTATION_BASE +
        tongueValue * TONGUE_CONFIG.ROTATION_MULTIPLIER;
    }
    if (tongue02) {
      tongue02.position.x =
        defaultPos.x + tongueValue * TONGUE_CONFIG.EXTENSION_MULTIPLIER;
    }
  } else {
    if (tongue01) tongue01.rotation.z = 0;
    if (tongue02) tongue02.position.x = defaultPos.x;
  }
}

function applyBlinking(morphCache, blinkState, currentTime, delta) {
  if (currentTime >= blinkState.nextBlinkTime && !blinkState.isBlinking) {
    blinkState.isBlinking = true;
    blinkState.nextBlinkTime = currentTime + ANIMATION_CONFIG.BLINK_DURATION;
  }

  if (blinkState.isBlinking && currentTime >= blinkState.nextBlinkTime) {
    blinkState.isBlinking = false;
    blinkState.nextBlinkTime =
      currentTime +
      THREE.MathUtils.randInt(
        ANIMATION_CONFIG.BLINK_MIN_INTERVAL,
        ANIMATION_CONFIG.BLINK_MAX_INTERVAL,
      );
  }

  const blinkTarget = blinkState.isBlinking ? 1 : 0;
  blinkState.value +=
    (blinkTarget - blinkState.value) * Math.min(1, delta * 15);

  applyMorphValue(morphCache, BLINK_MORPHS.LEFT, blinkState.value);
  applyMorphValue(morphCache, BLINK_MORPHS.RIGHT, blinkState.value);
}

function resetToNeutral(
  morphCache,
  smoothedMorphValues,
  jawBone,
  jawBaseRotationZ,
  currentJawRotationRef,
  tongue01,
  tongue02,
  tongueDefaultPos,
  lipsyncLerpSpeed,
  jawLerpSpeed,
) {
  // Smoothly lerp all morph targets back to 0 (like head tracking does)
  morphCache.forEach((targets, morphName) => {
    if (morphName === BLINK_MORPHS.LEFT || morphName === BLINK_MORPHS.RIGHT) {
      return;
    }

    // Use the smooth apply function with target value of 0
    applyMorphValueSmooth(
      morphCache,
      smoothedMorphValues,
      morphName,
      0,
      lipsyncLerpSpeed,
    );
  });

  if (jawBone) {
    // Smoothly lerp jaw back to closed position (90 degrees)
    applyJawBoneSmooth(
      jawBone,
      jawBaseRotationZ,
      currentJawRotationRef,
      0,
      jawLerpSpeed,
    );
  }

  if (tongue01) tongue01.rotation.z = 0;
  if (tongue02) tongue02.position.x = tongueDefaultPos.x;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}
