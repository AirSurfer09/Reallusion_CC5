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
  convertMetaHumanToCC5,
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
  METAHUMAN_DIRECT: {
    mapping: null, // Direct MetaHuman blendshapes, no conversion
    sourceFormat: "metahuman_direct",
    bonePreset: "METAHUMAN",
  },
};

/**
 * ARKit/MetaHuman Lipsync Hook
 *
 * @param {Object} options
 * @param {Object} options.convaiClient - Convai client instance
 * @param {Object} options.characterRef - Ref to character group
 * @param {Object} options.scene - Three.js scene
 * @param {string} options.mappingPreset - Preset name: 'ARKIT_TO_CC_EXTENDED' | 'ARKIT_TO_RPM' | 'ARKIT_TO_ARKIT' | 'METAHUMAN_TO_CC5' | 'METAHUMAN_DIRECT'
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
 * // MetaHuman to CC5 (with corrective combinations)
 * useArkitLipsync({ convaiClient, characterRef, scene, mappingPreset: 'METAHUMAN_TO_CC5' });
 *
 * // MetaHuman Direct (no conversion, fastest)
 * useArkitLipsync({ convaiClient, characterRef, scene, mappingPreset: 'METAHUMAN_DIRECT' });
 */
export const useMetahumanLipsync = ({
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
    startTime: 0, // Will be set from world clock (threeState.clock.elapsedTime * 1000)
    currentFrameIndex: 0,
    isDraining: false,
    fadeInWeight: 0,
  });

  // Track current world clock time for event handlers
  const worldClockTimeRef = useRef(0);

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
        state.startTime = worldClockTimeRef.current; // Use world clock time
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
      state.startTime = worldClockTimeRef.current; // Use world clock time
      state.currentFrameIndex = 0;
      state.isDraining = false;
      state.fadeInWeight = 0;
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

    // Find lower teeth bone (CC_Base_Teeth02 or cc_base_teeth02 for lowercase models)
    if (characterRef.current) {
      lowerTeethBoneRef.current =
        characterRef.current.getObjectByName("CC_Base_Teeth02") ||
        characterRef.current.getObjectByName("cc_base_teeth02");
      if (lowerTeethBoneRef.current && lowerTeethBaseYRef.current === null) {
        lowerTeethBaseYRef.current = lowerTeethBoneRef.current.position.y;
        lowerTeethBaseXRef.current = lowerTeethBoneRef.current.position.x;
        console.log(
          "[MetahumanLipsync] Lower teeth bone found:",
          lowerTeethBoneRef.current.name,
          "Base Y:",
          lowerTeethBaseYRef.current,
          "Base X:",
          lowerTeethBaseXRef.current,
        );
      }
    }

    // Find upper teeth bone (CC_Base_Teeth01 or cc_base_teeth01 for lowercase models)
    if (characterRef.current) {
      upperTeethBoneRef.current =
        characterRef.current.getObjectByName("CC_Base_Teeth01") ||
        characterRef.current.getObjectByName("cc_base_teeth01");
      if (upperTeethBoneRef.current && upperTeethBaseYRef.current === null) {
        upperTeethBaseYRef.current = upperTeethBoneRef.current.position.y;
        console.log(
          "[MetahumanLipsync] Upper teeth bone found:",
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
    const currentTime = threeState.clock.elapsedTime * 1000; // World clock in milliseconds

    // Update world clock time ref for event handlers
    worldClockTimeRef.current = currentTime;

    // Always blink, regardless of queue availability
    applyBlinking(morphCache, blinkRef.current, currentTime, delta);

    // Safety check: ensure queue is available for lipsync
    const queue = convaiClient?.blendshapeQueue;
    if (!queue) {
      return;
    }

    // If not playing, reset to neutral (but preserve blink)
    if (!state.isPlaying) {
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

    // Calculate elapsed time since bot started speaking (using world clock)
    const elapsedTimeMs = currentTime - state.startTime;
    const elapsedTimeSec = elapsedTimeMs / 1000;

    // Calculate fade-in weight for smooth lipsync start
    state.fadeInWeight = Math.min(
      1,
      elapsedTimeSec / ANIMATION_CONFIG.LIPSYNC_FADE_IN_DURATION,
    );

    // Calculate target frame index using approximate 60fps
    const exactFramePos = elapsedTimeSec * TARGET_FPS + FRAME_OFFSET;
    const targetFrameIndex = Math.floor(exactFramePos);

    // Use target frame but clamp to available frames
    const frameIndex = Math.min(targetFrameIndex, frames.length - 1);

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

    // Get current frame
    const currentFrame = frames[frameIndex];

    // Verify frame is valid (handle both array and object formats)
    const isValidFrame =
      currentFrame &&
      ((Array.isArray(currentFrame) && currentFrame.length > 0) || // ARKit array format
        (typeof currentFrame === "object" &&
          Object.keys(currentFrame).length > 0)); // MetaHuman object format

    if (!isValidFrame) {
      console.warn("[Lipsync] Invalid frame at index", frameIndex);
      return;
    }

    // Apply blendshapes based on mapping type
    // Smoothing is handled by per-frame lerping via LIPSYNC_LERP_SPEED
    const lipsyncLerpSpeed = ANIMATION_CONFIG.LIPSYNC_LERP_SPEED;
    const jawLerpSpeed = ANIMATION_CONFIG.JAW_LERP_SPEED;

    if (mappingConfig.sourceFormat === "metahuman") {
      // MetaHuman to CC5 - use conversion with corrective combinations
      applyMetaHumanToCC5(
        morphCache,
        smoothedMorphValues.current,
        currentFrame,
        state.fadeInWeight,
        jawBoneRef.current,
        jawBaseRotationZRef.current,
        currentJawRotationRef,
        lipsyncLerpSpeed,
        jawLerpSpeed,
      );
    } else if (mappingConfig.sourceFormat === "metahuman_direct") {
      // MetaHuman Direct - no conversion, apply directly
      applyMetaHumanDirect(
        morphCache,
        smoothedMorphValues.current,
        currentFrame,
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
      );
      applyMetaHumanToCC5(
        morphCache,
        smoothedMorphValues.current,
        currentFrame,
        state.fadeInWeight,
        jawBoneRef.current,
        jawBaseRotationZRef.current,
        currentJawRotationRef,
        lipsyncLerpSpeed,
        jawLerpSpeed,
      );
    } else {
      // ARKit-based mapping (simple 1:1)
      applyArkitMapping(
        morphCache,
        smoothedMorphValues.current,
        resolvedMapping,
        currentFrame,
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

  // Apply blendshapes (skip jaw, tongue, blink, and eye look - controlled separately)
  for (let i = 0; i < maxIndex; i++) {
    const arkitName = ARKIT_ORDER_61[i];
    if (
      arkitName === "jawOpen" ||
      arkitName === "mouthClose" ||
      arkitName === "tongueOut" ||
      arkitName === "eyeBlinkLeft" ||
      arkitName === "eyeBlinkRight" ||
      arkitName === "eyeLookDownLeft" ||
      arkitName === "eyeLookInLeft" ||
      arkitName === "eyeLookOutLeft" ||
      arkitName === "eyeLookUpLeft" ||
      arkitName === "eyeLookDownRight" ||
      arkitName === "eyeLookInRight" ||
      arkitName === "eyeLookOutRight" ||
      arkitName === "eyeLookUpRight"
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
 * Apply MetaHuman to CC5 mapping - COMBINATION mapping (with correctives)
 *
 * Server sends MetaHuman blendshapes as arrays with 251 values per frame.
 * We map these array indices to CTRL_expressions_* names, then use
 * convertMetaHumanToCC5() to get CC5 blendshapes with corrective combinations.
 *
 * Flow: Array[251] → CTRL_expressions_* → convertMetaHumanToCC5() → CC5 combined morphs
 *
 * This uses COMBINATION mapping (100+ complex mappings):
 * - Corrective blendshapes: Multiplies multiple sources for combined expressions
 * - Example: C_BlinkL_LookDownL = CTRL_expressions_eyeBlinkL * CTRL_expressions_eyeLookDownL
 * - More accurate facial expressions but slower than direct mapping
 *
 * JAW BONE ROTATION:
 * - Morphs with "JawOpen" in the name are SKIPPED (not applied as morphs)
 * - Instead, CTRL_expressions_jawOpen is used for jaw bone rotation (CC_Base_JawRoot)
 * - This matches the behavior of CC4_EXTENDED where jawOpen uses bone rotation
 *
 * Example: Array index 0 → CTRL_expressions_eyeBlinkL → C_BlinkL (and many combinations)
 */
function applyMetaHumanToCC5(
  morphCache,
  smoothedMorphValues,
  currentFrame,
  fadeInWeight,
  jawBone,
  jawBaseRotationZ,
  currentJawRotationRef,
  lipsyncLerpSpeed,
  jawLerpSpeed,
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

      // Skip eye blink morphs - handled by automatic blinking system
      if (
        ctrlName === "CTRL_expressions_eyeBlinkL" ||
        ctrlName === "CTRL_expressions_eyeBlinkR"
      ) {
        return;
      }

      // Skip eye look morphs - handled by pupil tracking system
      if (
        ctrlName === "CTRL_expressions_eyeLookDownL" ||
        ctrlName === "CTRL_expressions_eyeLookDownR" ||
        ctrlName === "CTRL_expressions_eyeLookLeftL" ||
        ctrlName === "CTRL_expressions_eyeLookLeftR" ||
        ctrlName === "CTRL_expressions_eyeLookRightL" ||
        ctrlName === "CTRL_expressions_eyeLookRightR" ||
        ctrlName === "CTRL_expressions_eyeLookUpL" ||
        ctrlName === "CTRL_expressions_eyeLookUpR"
      ) {
        return;
      }

      // Apply fade-in weight for smooth start
      metahumanBlendshapes[ctrlName] = value * fadeInWeight;
    }
  });

  // Use the convertMetaHumanToCC5 function for combination mapping with correctives
  // This uses the complex mapping system with 100+ corrective combinations
  // Input: CTRL_expressions_* object
  // Output: C_* blendshapes with combined/corrective expressions (C_BlinkL_LookDownL, etc.)
  const cc5Values = convertMetaHumanToCC5(metahumanBlendshapes);

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

    // Apply with smooth lerping
    applyMorphValueSmooth(
      morphCache,
      smoothedMorphValues,
      morphName,
      value,
      lipsyncLerpSpeed,
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
}

/**
 * Apply MetaHuman blendshapes directly (no conversion to CC5)
 *
 * Server sends MetaHuman blendshapes as arrays with 251 values per frame.
 * This function applies them directly to CTRL_expressions_* morph targets
 * without any conversion or corrective combinations.
 *
 * Flow: Array[251] → CTRL_expressions_* morph targets (direct 1:1)
 *
 * This is the simplest and fastest approach for pure MetaHuman models.
 * No corrective combinations means less accurate facial expressions but
 * better performance and no conversion overhead.
 *
 * JAW HANDLING:
 * - If jawBone exists: CTRL_expressions_jawOpen controls bone rotation (skipped as morph)
 * - If jawBone is null: CTRL_expressions_jawOpen applied as morph target
 *
 * TEETH OFFSET:
 * - Lower teeth: Move down (Y) and back (X) based on jaw opening to hide teeth
 * - Upper teeth: Move up (Y) slightly based on jaw opening
 *
 * INTENSITY ADJUSTMENTS:
 * - Upper face morphs (eyes, brows, nose, cheek squints): 0.7x multiplier
 * - Mouth/jaw morphs: Full intensity (1.0x)
 */
function applyMetaHumanDirect(
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
) {
  // Server sends MetaHuman blendshapes as array with 251 values
  // Map array indices directly to MetaHuman CTRL_expressions_* morph targets

  // Define CTRL expressions that should be limited to 0.5 max value
  // These are from the "Limit" mode mappings in metahumanToCC5.js
  const limitedCTRLExpressions = new Set([
    "CTRL_expressions_eyeLidPressL",
    "CTRL_expressions_eyeLidPressR",
    "CTRL_expressions_noseWrinkleUpperL",
    "CTRL_expressions_noseWrinkleUpperR",
    "CTRL_expressions_mouthStretchLipsCloseL",
    "CTRL_expressions_mouthStretchLipsCloseR",
    "CTRL_expressions_jawOpenExtreme",
    "CTRL_expressions_mouthLipsTogetherUL",
    "CTRL_expressions_mouthLipsTogetherUR",
    "CTRL_expressions_mouthLipsTogetherDL",
    "CTRL_expressions_mouthLipsTogetherDR",
  ]);

  // Only process non-zero values for performance
  METAHUMAN_ORDER_251.forEach((ctrlName, index) => {
    if (index < currentFrame.length) {
      const value = currentFrame[index];

      // Skip if zero or undefined
      if (!value) {
        return;
      }

      // Handle jaw open: skip if using bone rotation, otherwise apply as morph
      if (ctrlName === "CTRL_expressions_jawOpen") {
        if (jawBone) {
          return; // Skip - will be handled by bone rotation
        }
        // No jaw bone - apply as morph target (fall through)
      }

      // Skip eye blink morphs - handled by automatic blinking system
      if (
        ctrlName === "CTRL_expressions_eyeBlinkL" ||
        ctrlName === "CTRL_expressions_eyeBlinkR"
      ) {
        return;
      }

      // Skip eye look morphs - handled by pupil tracking system
      if (
        ctrlName === "CTRL_expressions_eyeLookDownL" ||
        ctrlName === "CTRL_expressions_eyeLookDownR" ||
        ctrlName === "CTRL_expressions_eyeLookLeftL" ||
        ctrlName === "CTRL_expressions_eyeLookLeftR" ||
        ctrlName === "CTRL_expressions_eyeLookRightL" ||
        ctrlName === "CTRL_expressions_eyeLookRightR" ||
        ctrlName === "CTRL_expressions_eyeLookUpL" ||
        ctrlName === "CTRL_expressions_eyeLookUpR"
      ) {
        return;
      }

      // Apply fade-in weight for smooth start
      let weightedValue = value * fadeInWeight;

      // Apply 0.5 max limit for specific CTRL expressions (Limit mode from mapping)
      if (limitedCTRLExpressions.has(ctrlName)) {
        weightedValue = Math.min(weightedValue, 0.5);
      }

      // Reduce intensity for upper face morphs (eyes, brows, etc.) - 0.7x multiplier
      const isUpperFaceMorph =
        ctrlName.toLowerCase().includes("eye") ||
        ctrlName.toLowerCase().includes("brow") ||
        ctrlName.toLowerCase().includes("cheek_squint") ||
        ctrlName.toLowerCase().includes("nose_wrinkle");

      if (isUpperFaceMorph) {
        weightedValue *= 0.7;
      }

      // Apply directly to the CTRL_expressions_* morph target
      applyMorphValueSmooth(
        morphCache,
        smoothedMorphValues,
        ctrlName,
        weightedValue,
        lipsyncLerpSpeed,
      );
    }
  });

  // Apply jaw bone rotation (only if bone exists)
  // Extract jawOpen value from the array (clamped to max 0.7, reduce by 0.1 only when >= 0.3)
  const jawOpenIndex = METAHUMAN_ORDER_251.indexOf("CTRL_expressions_jawOpen");
  const rawJawValue =
    jawOpenIndex >= 0 && jawOpenIndex < currentFrame.length
      ? Math.min((currentFrame[jawOpenIndex] || 0) * fadeInWeight, 0.7)
      : 0;
  const jawValue = rawJawValue < 0.3 ? rawJawValue : rawJawValue - 0.1; // Only subtract 0.1 when >= 0.3

  if (jawBone && jawValue > 0) {
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
 */
function applyMorphValueSmooth(
  morphCache,
  smoothedValues,
  name,
  targetValue,
  lerpSpeed,
) {
  const targets = morphCache.get(name);
  if (!targets) return;

  // Get current smoothed value (or initialize to 0)
  const currentValue = smoothedValues.get(name) || 0;

  // Lerp towards target value every frame (like head tracking does)
  const newValue = currentValue + (targetValue - currentValue) * lerpSpeed;

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

function jawValueToRotation(jawBaseRotationZ, jawValue) {
  // Simple linear mapping: 0 → 90°, 1 → 99.6°
  // jawValue from server is 0-1
  const clampedValue = Math.max(0, Math.min(1, jawValue)); // Clamp to 0-1 range

  // Linear interpolation between 90° (1.5708 rad) and 99.6° (1.7384 rad)
  const rotation =
    JAW_CONFIG.CLOSED_ROTATION + clampedValue * JAW_CONFIG.ROTATION_RANGE;

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
