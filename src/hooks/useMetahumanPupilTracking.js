import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Default configuration
const DEFAULT_CONFIG = {
  maxHorizontalAngle: Math.PI / 6, // 30 degrees - max eye movement
  maxVerticalAngle: Math.PI / 8, // 22.5 degrees - max vertical movement
  lerpSpeed: 0.2, // Pupils move quickly
  verticalOffset: -0.15, // Offset to make pupils look slightly lower by default
  enabled: true,
};

// MetaHuman CC5 blend shape names for eye gaze
// These correspond to CTRL_expressions_* or similar naming in MetaHuman models
const MORPH_TARGETS = {
  lookUpLeft: "CTRL_expressions_eyeLookUpL",
  lookUpRight: "CTRL_expressions_eyeLookUpR",
  lookDownLeft: "CTRL_expressions_eyeLookDownL",
  lookDownRight: "CTRL_expressions_eyeLookDownR",
  lookOutLeft: "CTRL_expressions_eyeLookOutL",
  lookInLeft: "CTRL_expressions_eyeLookInL",
  lookInRight: "CTRL_expressions_eyeLookInR",
  lookOutRight: "CTRL_expressions_eyeLookOutR",
};

/**
 * Custom hook for MetaHuman CC5 pupil tracking by rotating eye bones
 * @param {Object} meshRef - Ref to the skinned mesh for morph targets
 * @param {Object} skeletonRoot - The root bone to find head and eye bones
 * @param {Object} config - Configuration options
 * @param {boolean} isSpeaking - Whether character is currently speaking (affects tracking strength)
 * @returns {Object} - { setTarget, leftEyeBoneRef, rightEyeBoneRef, headBoneRef, gazeDirection }
 */
export function useMetahumanPupilTracking(
  meshRef,
  skeletonRoot,
  config = {},
  isSpeaking = false,
) {
  const options = { ...DEFAULT_CONFIG, ...config };

  const headBoneRef = useRef(null);
  const leftEyeBoneRef = useRef(null);
  const rightEyeBoneRef = useRef(null);
  const customTarget = useRef(null);

  // Axes helpers for debugging
  const leftEyeAxesHelper = useRef(null);
  const rightEyeAxesHelper = useRef(null);

  // Track if we've verified the mesh setup
  const meshVerified = useRef(false);

  // Store rest pose rotations
  const restPose = useRef({
    leftEye: new THREE.Quaternion(),
    rightEye: new THREE.Quaternion(),
  });

  // Smoothed values for natural movement (exposed for helpers)
  const gazeDirection = useRef({
    horizontal: 0, // -1 (left) to 1 (right)
    vertical: 0, // -1 (down) to 1 (up)
  });

  // Tracking weight (0 = animation, 1 = tracking override)
  const trackingWeight = useRef(0);

  const { camera } = useThree();

  // Temp vectors
  const tempVec = useMemo(() => new THREE.Vector3(), []);
  const tempVec2 = useMemo(() => new THREE.Vector3(), []);
  const tempQuat = useMemo(() => new THREE.Quaternion(), []);
  const tempQuat2 = useMemo(() => new THREE.Quaternion(), []);

  // Find head and eye bones for MetaHuman CC5
  useEffect(() => {
    if (!skeletonRoot) return;

    console.log(
      "[useMetahumanPupilTracking] Searching for eye bones in skeleton root:",
      skeletonRoot.name,
    );

    skeletonRoot.traverse((child) => {
      if (child.isBone) {
        const lowerName = child.name.toLowerCase();

        // Match head bone (case-insensitive)
        if (lowerName === "head" || lowerName === "cc_base_head") {
          console.log("[useMetahumanPupilTracking] Found head bone:", child.name);
          headBoneRef.current = child;
        }
        // Match left eye bone (case-insensitive)
        else if (lowerName === "cc_base_l_eye" || lowerName === "l_eye") {
          console.log(
            "[useMetahumanPupilTracking] Found left eye bone:",
            child.name,
          );
          leftEyeBoneRef.current = child;
          restPose.current.leftEye.copy(child.quaternion);
        }
        // Match right eye bone (case-insensitive)
        else if (lowerName === "cc_base_r_eye" || lowerName === "r_eye") {
          console.log(
            "[useMetahumanPupilTracking] Found right eye bone:",
            child.name,
          );
          rightEyeBoneRef.current = child;
          restPose.current.rightEye.copy(child.quaternion);
        }
      }
    });

    // Log final status
    console.log("[useMetahumanPupilTracking] Bone search complete:", {
      head: headBoneRef.current?.name || "NOT FOUND",
      leftEye: leftEyeBoneRef.current?.name || "NOT FOUND",
      rightEye: rightEyeBoneRef.current?.name || "NOT FOUND",
    });

    // Add axes helpers to eye bones for debugging coordinate system
    if (leftEyeBoneRef.current && !leftEyeAxesHelper.current) {
      // Create axes helper with larger size (25 units) to account for 0.01 character scale
      // Red = X-axis (Yaw/left-right), Green = Y-axis, Blue = Z-axis (Pitch/up-down)
      leftEyeAxesHelper.current = new THREE.AxesHelper(25);
      leftEyeBoneRef.current.add(leftEyeAxesHelper.current);
      console.log("[useMetahumanPupilTracking] ✅ Added axes helper to left eye bone:", leftEyeBoneRef.current.name);
      console.log("[useMetahumanPupilTracking] Left eye axes helper:", leftEyeAxesHelper.current);
    } else if (!leftEyeBoneRef.current) {
      console.warn("[useMetahumanPupilTracking] ❌ Cannot add axes helper - left eye bone not found");
    }

    if (rightEyeBoneRef.current && !rightEyeAxesHelper.current) {
      // Create axes helper with larger size (25 units) to account for 0.01 character scale
      // Red = X-axis (Yaw/left-right), Green = Y-axis, Blue = Z-axis (Pitch/up-down)
      rightEyeAxesHelper.current = new THREE.AxesHelper(25);
      rightEyeBoneRef.current.add(rightEyeAxesHelper.current);
      console.log("[useMetahumanPupilTracking] ✅ Added axes helper to right eye bone:", rightEyeBoneRef.current.name);
      console.log("[useMetahumanPupilTracking] Right eye axes helper:", rightEyeAxesHelper.current);
    } else if (!rightEyeBoneRef.current) {
      console.warn("[useMetahumanPupilTracking] ❌ Cannot add axes helper - right eye bone not found");
    }
  }, [skeletonRoot]);

  useFrame(() => {
    if (!options.enabled) return;
    if (!leftEyeBoneRef.current || !rightEyeBoneRef.current) return;

    const leftEye = leftEyeBoneRef.current;
    const rightEye = rightEyeBoneRef.current;

    // Get mesh for morph targets
    const mesh = meshRef?.current;
    const dict = mesh?.morphTargetDictionary;
    const influences = mesh?.morphTargetInfluences;

    // Get eye position as reference - calculate separately for each eye
    const leftEyePos = new THREE.Vector3();
    const rightEyePos = new THREE.Vector3();
    leftEyeBoneRef.current.getWorldPosition(leftEyePos);
    rightEyeBoneRef.current.getWorldPosition(rightEyePos);

    // Get target position
    const targetPos = tempVec2.copy(
      customTarget.current ? customTarget.current : camera.position,
    );

    // Get head's forward direction for calculating gaze
    const headWorldQuat = tempQuat.set(0, 0, 0, 1);
    if (headBoneRef.current) {
      headBoneRef.current.getWorldQuaternion(headWorldQuat);
    }

    const headForward = new THREE.Vector3(0, 0, 1).applyQuaternion(
      headWorldQuat,
    );
    const headUp = new THREE.Vector3(0, 1, 0).applyQuaternion(headWorldQuat);
    const headRight = new THREE.Vector3(1, 0, 0).applyQuaternion(headWorldQuat);

    // Calculate direction from each eye to target separately (for convergence)
    const leftDirToTarget = targetPos.clone().sub(leftEyePos).normalize();
    const rightDirToTarget = targetPos.clone().sub(rightEyePos).normalize();

    // Check if target is roughly in front (use average of both eyes)
    const leftDot = headForward.dot(leftDirToTarget);
    const rightDot = headForward.dot(rightDirToTarget);
    const avgDot = (leftDot + rightDot) / 2;
    const isInView = avgDot > -0.3;

    // Update tracking weight: 1.0 when speaking (full tracking), 0.5 when not speaking (blend with animation)
    const targetWeight = isInView ? (isSpeaking ? 1.0 : 0.5) : 0;
    trackingWeight.current +=
      (targetWeight - trackingWeight.current) * options.lerpSpeed;

    // Calculate horizontal and vertical angles separately for each eye
    let leftTargetH = 0,
      leftTargetV = 0;
    let rightTargetH = 0,
      rightTargetV = 0;

    if (isInView) {
      // LEFT EYE
      const leftHorizComp = leftDirToTarget.dot(headRight);
      const leftForwardComp = Math.max(0.1, leftDirToTarget.dot(headForward));
      const leftHorizAngle = Math.atan2(leftHorizComp, leftForwardComp);
      const leftVertComp = leftDirToTarget.dot(headUp);
      const leftVertAngle = Math.atan2(leftVertComp, leftForwardComp);

      leftTargetH = Math.max(
        -1,
        Math.min(1, leftHorizAngle / options.maxHorizontalAngle),
      );
      leftTargetV = Math.max(
        -1,
        Math.min(1, leftVertAngle / options.maxVerticalAngle),
      );

      // RIGHT EYE
      const rightHorizComp = rightDirToTarget.dot(headRight);
      const rightForwardComp = Math.max(0.1, rightDirToTarget.dot(headForward));
      const rightHorizAngle = Math.atan2(rightHorizComp, rightForwardComp);
      const rightVertComp = rightDirToTarget.dot(headUp);
      const rightVertAngle = Math.atan2(rightVertComp, rightForwardComp);

      rightTargetH = Math.max(
        -1,
        Math.min(1, rightHorizAngle / options.maxHorizontalAngle),
      );
      rightTargetV = Math.max(
        -1,
        Math.min(1, rightVertAngle / options.maxVerticalAngle),
      );

      // Apply vertical offset (shift pupils upward)
      if (options.verticalOffset !== undefined) {
        leftTargetV = Math.max(
          -1,
          Math.min(1, leftTargetV + options.verticalOffset),
        );
        rightTargetV = Math.max(
          -1,
          Math.min(1, rightTargetV + options.verticalOffset),
        );
      }
    }

    // Store separate gaze directions for each eye
    if (!gazeDirection.current.left) {
      gazeDirection.current.left = { horizontal: 0, vertical: 0 };
    }
    if (!gazeDirection.current.right) {
      gazeDirection.current.right = { horizontal: 0, vertical: 0 };
    }

    // Smooth the gaze direction values for each eye independently
    gazeDirection.current.left.horizontal +=
      (leftTargetH - gazeDirection.current.left.horizontal) * options.lerpSpeed;
    gazeDirection.current.left.vertical +=
      (leftTargetV - gazeDirection.current.left.vertical) * options.lerpSpeed;

    gazeDirection.current.right.horizontal +=
      (rightTargetH - gazeDirection.current.right.horizontal) *
      options.lerpSpeed;
    gazeDirection.current.right.vertical +=
      (rightTargetV - gazeDirection.current.right.vertical) * options.lerpSpeed;

    // Keep legacy horizontal/vertical for backward compatibility (average)
    gazeDirection.current.horizontal =
      (gazeDirection.current.left.horizontal +
        gazeDirection.current.right.horizontal) /
      2;
    gazeDirection.current.vertical =
      (gazeDirection.current.left.vertical +
        gazeDirection.current.right.vertical) /
      2;

    // === BONE ROTATION - LEFT EYE ===
    // Simple approach: Make -Y axis (negative green) point toward camera
    const animLeftEyeQuat = leftEye.quaternion.clone();
    
    // Calculate direction from left eye to target
    const leftEyeWorldPos = new THREE.Vector3();
    leftEye.getWorldPosition(leftEyeWorldPos);
    const leftDirToCamera = targetPos.clone().sub(leftEyeWorldPos).normalize();
    
    // Create quaternion that rotates -Y axis to point at camera
    // Default eye forward is -Y, so we rotate from (0, -1, 0) to the direction
    const leftDefaultForward = new THREE.Vector3(0, -1, 0);
    const trackingLeftEyeQuat = new THREE.Quaternion().setFromUnitVectors(
      leftDefaultForward,
      leftDirToCamera
    );

    // === BONE ROTATION - RIGHT EYE ===
    const animRightEyeQuat = rightEye.quaternion.clone();
    
    // Calculate direction from right eye to target
    const rightEyeWorldPos = new THREE.Vector3();
    rightEye.getWorldPosition(rightEyeWorldPos);
    const rightDirToCamera = targetPos.clone().sub(rightEyeWorldPos).normalize();
    
    // Create quaternion that rotates -Y axis to point at camera
    const rightDefaultForward = new THREE.Vector3(0, -1, 0);
    const trackingRightEyeQuat = new THREE.Quaternion().setFromUnitVectors(
      rightDefaultForward,
      rightDirToCamera
    );

    // Blend between animation and tracking based on weight
    leftEye.quaternion
      .copy(animLeftEyeQuat)
      .slerp(trackingLeftEyeQuat, trackingWeight.current);
    rightEye.quaternion
      .copy(animRightEyeQuat)
      .slerp(trackingRightEyeQuat, trackingWeight.current);

    // === MORPH TARGETS for natural deformation ===
    // Only apply morph targets if mesh is a skinnedMesh with morph targets
    if (mesh?.isSkinnedMesh && dict && influences && mesh.skeleton) {
      // One-time verification
      if (!meshVerified.current) {
        meshVerified.current = true;
      }

      // Verify eye bones are part of the mesh skeleton
      const eyeInSkeleton =
        mesh.skeleton.bones.includes(leftEye) ||
        mesh.skeleton.bones.includes(rightEye);

      if (eyeInSkeleton) {
        const setMorph = (name, value) => {
          const index = dict[name];
          if (index !== undefined) {
            influences[index] = value * trackingWeight.current;
          }
        };

        // Calculate morph target values based on separate gaze directions for each eye
        // LEFT EYE
        const leftLookLeftAmount = Math.max(0, -leftH);
        const leftLookRightAmount = Math.max(0, leftH);
        const leftLookUpAmount = Math.max(0, leftV);
        const leftLookDownAmount = Math.max(0, -leftV);

        // RIGHT EYE
        const rightLookLeftAmount = Math.max(0, -rightH);
        const rightLookRightAmount = Math.max(0, rightH);
        const rightLookUpAmount = Math.max(0, rightV);
        const rightLookDownAmount = Math.max(0, -rightV);

        // Set LEFT eye morph targets
        setMorph(MORPH_TARGETS.lookOutLeft, leftLookLeftAmount);
        setMorph(MORPH_TARGETS.lookInLeft, leftLookRightAmount);
        setMorph(MORPH_TARGETS.lookUpLeft, leftLookUpAmount);
        setMorph(MORPH_TARGETS.lookDownLeft, leftLookDownAmount);

        // Set RIGHT eye morph targets
        setMorph(MORPH_TARGETS.lookInRight, rightLookLeftAmount);
        setMorph(MORPH_TARGETS.lookOutRight, rightLookRightAmount);
        setMorph(MORPH_TARGETS.lookUpRight, rightLookUpAmount);
        setMorph(MORPH_TARGETS.lookDownRight, rightLookDownAmount);
      }
    }
  });

  // Function to set custom target
  const setTarget = (position) => {
    if (position) {
      if (!customTarget.current) {
        customTarget.current = new THREE.Vector3();
      }
      customTarget.current.copy(position);
    } else {
      customTarget.current = null;
    }
  };

  return {
    setTarget,
    leftEyeBoneRef,
    rightEyeBoneRef,
    headBoneRef,
    gazeDirection,
  };
}
