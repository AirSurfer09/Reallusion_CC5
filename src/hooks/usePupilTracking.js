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

// ARKit blend shape names for eye gaze
const MORPH_TARGETS = {
  lookUpLeft: "A06_Eye_Look_Up_Left",
  lookUpRight: "A07_Eye_Look_Up_Right",
  lookDownLeft: "A08_Eye_Look_Down_Left",
  lookDownRight: "A09_Eye_Look_Down_Right",
  lookOutLeft: "A10_Eye_Look_Out_Left",
  lookInLeft: "A11_Eye_Look_In_Left",
  lookInRight: "A12_Eye_Look_In_Right",
  lookOutRight: "A13_Eye_Look_Out_Right",
};

/**
 * Custom hook for pupil tracking by rotating eye bones
 * @param {Object} meshRef - Ref to the skinned mesh (not used but kept for compatibility)
 * @param {Object} skeletonRoot - The root bone to find head and eye bones
 * @param {Object} config - Configuration options
 * @param {boolean} isSpeaking - Whether character is currently speaking (affects tracking strength)
 * @returns {Object} - { setTarget, leftEyeBoneRef, rightEyeBoneRef, headBoneRef, gazeDirection }
 */
export function usePupilTracking(meshRef, skeletonRoot, config = {}, isSpeaking = false) {
  const options = { ...DEFAULT_CONFIG, ...config };

  const headBoneRef = useRef(null);
  const leftEyeBoneRef = useRef(null);
  const rightEyeBoneRef = useRef(null);
  const customTarget = useRef(null);

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

  // Find head and eye bones
  useEffect(() => {
    if (!skeletonRoot) return;

    skeletonRoot.traverse((child) => {
      if (child.isBone) {
        if (child.name === "CC_Base_Head") {
          headBoneRef.current = child;
        } else if (child.name === "CC_Base_L_Eye") {
          leftEyeBoneRef.current = child;
          restPose.current.leftEye.copy(child.quaternion);
        } else if (child.name === "CC_Base_R_Eye") {
          rightEyeBoneRef.current = child;
          restPose.current.rightEye.copy(child.quaternion);
        }
      }
    });
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
    let leftTargetH = 0, leftTargetV = 0;
    let rightTargetH = 0, rightTargetV = 0;

    if (isInView) {
      // LEFT EYE
      const leftHorizComp = leftDirToTarget.dot(headRight);
      const leftForwardComp = Math.max(0.1, leftDirToTarget.dot(headForward));
      const leftHorizAngle = Math.atan2(leftHorizComp, leftForwardComp);
      const leftVertComp = leftDirToTarget.dot(headUp);
      const leftVertAngle = Math.atan2(leftVertComp, leftForwardComp);

      leftTargetH = Math.max(-1, Math.min(1, leftHorizAngle / options.maxHorizontalAngle));
      leftTargetV = Math.max(-1, Math.min(1, leftVertAngle / options.maxVerticalAngle));

      // RIGHT EYE
      const rightHorizComp = rightDirToTarget.dot(headRight);
      const rightForwardComp = Math.max(0.1, rightDirToTarget.dot(headForward));
      const rightHorizAngle = Math.atan2(rightHorizComp, rightForwardComp);
      const rightVertComp = rightDirToTarget.dot(headUp);
      const rightVertAngle = Math.atan2(rightVertComp, rightForwardComp);

      rightTargetH = Math.max(-1, Math.min(1, rightHorizAngle / options.maxHorizontalAngle));
      rightTargetV = Math.max(-1, Math.min(1, rightVertAngle / options.maxVerticalAngle));
      
      // Apply vertical offset (shift pupils upward)
      if (options.verticalOffset !== undefined) {
        leftTargetV = Math.max(-1, Math.min(1, leftTargetV + options.verticalOffset));
        rightTargetV = Math.max(-1, Math.min(1, rightTargetV + options.verticalOffset));
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
      (rightTargetH - gazeDirection.current.right.horizontal) * options.lerpSpeed;
    gazeDirection.current.right.vertical +=
      (rightTargetV - gazeDirection.current.right.vertical) * options.lerpSpeed;

    // Keep legacy horizontal/vertical for backward compatibility (average)
    gazeDirection.current.horizontal = (gazeDirection.current.left.horizontal + gazeDirection.current.right.horizontal) / 2;
    gazeDirection.current.vertical = (gazeDirection.current.left.vertical + gazeDirection.current.right.vertical) / 2;

    // === BONE ROTATION - LEFT EYE ===
    const leftH = gazeDirection.current.left.horizontal;
    const leftV = gazeDirection.current.left.vertical;
    const leftYawAngle = leftH * options.maxHorizontalAngle;
    const leftPitchAngle = -leftV * options.maxVerticalAngle;

    const animLeftEyeQuat = leftEye.quaternion.clone();
    const leftLookRotation = tempQuat2.setFromEuler(
      new THREE.Euler(leftPitchAngle, 0, leftYawAngle, "XYZ"),
    );
    const trackingLeftEyeQuat = restPose.current.leftEye.clone().multiply(leftLookRotation);

    // === BONE ROTATION - RIGHT EYE ===
    const rightH = gazeDirection.current.right.horizontal;
    const rightV = gazeDirection.current.right.vertical;
    const rightYawAngle = rightH * options.maxHorizontalAngle;
    const rightPitchAngle = -rightV * options.maxVerticalAngle;

    const animRightEyeQuat = rightEye.quaternion.clone();
    const rightLookRotation = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(rightPitchAngle, 0, rightYawAngle, "XYZ"),
    );
    const trackingRightEyeQuat = restPose.current.rightEye.clone().multiply(rightLookRotation);

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
