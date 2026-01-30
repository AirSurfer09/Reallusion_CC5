import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Default configuration
const DEFAULT_CONFIG = {
  headOnlyAngle: Math.PI / 3, // 60 degrees each side - head only zone
  maxTrackAngle: Math.PI / 2, // 90 degrees each side (180 total) - beyond this, return to animation
  maxPitchAngle: Math.PI / 4, // 45 degrees - max vertical angle
  lerpSpeed: 0.08, // Smoothing factor for natural movement
  headPitchFactor: 0.7, // How much of pitch goes to head
  neckPitchFactor: 0.3, // How much of pitch goes to neck
  neckYawFactor: 0.7, // How much of extra yaw goes to neck
  speakingWeight: 0.7, // Tracking influence when speaking (0-1, higher = more tracking)
  idleWeight: 0.5, // Tracking influence when idle (0-1, higher = more tracking)
  enabled: true, // Whether tracking is active
};

/**
 * Custom hook for head tracking towards a target (default: camera)
 * @param {Object} skeletonRoot - The root bone of the skeleton (e.g., nodes.RL_BoneRoot)
 * @param {Object} config - Configuration options
 * @param {boolean} isSpeaking - Whether character is currently speaking (affects tracking strength)
 * @returns {Object} - { headBoneRef, neckBone1Ref, neckBone2Ref, setTarget }
 */
export function useMhaHeadTracking(
  skeletonRoot,
  config = {},
  isSpeaking = false,
) {
  const options = { ...DEFAULT_CONFIG, ...config };

  // Bone references
  const headBoneRef = useRef(null);
  const neckBone1Ref = useRef(null);
  const neckBone2Ref = useRef(null);
  const spineBoneRef = useRef(null);

  // Custom target (if not using camera)
  const customTarget = useRef(null);

  // Store REST pose quaternions (captured once when bones are found)
  const restPose = useRef({
    head: new THREE.Quaternion(),
    neck1: new THREE.Quaternion(),
    neck2: new THREE.Quaternion(),
  });

  // Store the character's base forward direction (in world space)
  const characterForward = useRef(new THREE.Vector3(0, 0, 1));

  // Tracking weight: 0 = animation plays, 1 = tracking override
  const trackingWeight = useRef(0);

  // Smoothed ANGLES (we smooth the angles, not quaternions, for stable results)
  const smoothedAngles = useRef({
    headYaw: 0,
    headPitch: 0,
    neckYaw: 0,
    neckPitch: 0,
  });

  const { camera } = useThree();

  // Temp vectors for calculations (avoid GC)
  const tempVec = useMemo(() => new THREE.Vector3(), []);
  const tempVec2 = useMemo(() => new THREE.Vector3(), []);
  const tempQuat = useMemo(() => new THREE.Quaternion(), []);
  const tempQuat2 = useMemo(() => new THREE.Quaternion(), []);

  // Find and store bone references
  useEffect(() => {
    if (!skeletonRoot) return;

    skeletonRoot.traverse((child) => {
      if (child.isBone) {
        const lowerName = child.name.toLowerCase();

        // Match head bone (case-insensitive)
        if (lowerName === "head" || lowerName === "cc_base_head") {
          headBoneRef.current = child;
          // Capture rest pose quaternion
          restPose.current.head.copy(child.quaternion);
        }
        // Match neck twist 1 (case-insensitive)
        else if (
          lowerName === "cc_base_necktwist01" ||
          lowerName === "necktwist01"
        ) {
          neckBone1Ref.current = child;
          restPose.current.neck1.copy(child.quaternion);
        }
        // Match neck twist 2 (case-insensitive)
        else if (
          lowerName === "cc_base_necktwist02" ||
          lowerName === "necktwist02"
        ) {
          neckBone2Ref.current = child;
          restPose.current.neck2.copy(child.quaternion);
        }
        // Match spine bone (case-insensitive)
        else if (lowerName === "cc_base_spine02" || lowerName === "spine02") {
          spineBoneRef.current = child;
        }
      }
    });
  }, [skeletonRoot]);

  // Head tracking update
  useFrame(() => {
    if (!options.enabled || !headBoneRef.current) return;

    const head = headBoneRef.current;
    const neck1 = neckBone1Ref.current;
    const neck2 = neckBone2Ref.current;

    // Get head world position (using parent's world matrix for stability)
    // We need to calculate position based on parent, not current head matrix
    const headWorldPos = tempVec.set(0, 0, 0);
    if (head.parent) {
      head.parent.updateMatrixWorld(true);
      headWorldPos.setFromMatrixPosition(head.parent.matrixWorld);
      // Offset by head's local position
      const localPos = new THREE.Vector3().copy(head.position);
      localPos.applyMatrix4(head.parent.matrixWorld);
      headWorldPos.copy(localPos);
    }

    // Get target position (custom target or camera)
    const targetPos = tempVec2.copy(
      customTarget.current ? customTarget.current : camera.position,
    );

    // Calculate direction from head to target in world space
    const dirToTarget = targetPos.clone().sub(headWorldPos).normalize();

    // Get the character's forward direction in world space from spine
    const spineWorldQuat = tempQuat.set(0, 0, 0, 1);
    if (spineBoneRef.current) {
      spineBoneRef.current.getWorldQuaternion(spineWorldQuat);
    } else if (neck1 && neck1.parent) {
      neck1.parent.getWorldQuaternion(spineWorldQuat);
    }

    // Character's forward is Z-axis transformed by spine's world rotation
    const charForward = characterForward.current
      .set(0, 0, 1)
      .applyQuaternion(spineWorldQuat);

    // Calculate angle between character forward and direction to target
    // Project both onto XZ plane for horizontal angle
    const charForwardFlat = charForward.clone().setY(0).normalize();
    const dirToTargetFlat = dirToTarget.clone().setY(0).normalize();

    // Check if target is within viewable range using dot product
    // dot > 0 means target is in front, dot < 0 means behind
    const dotProduct = charForwardFlat.dot(dirToTargetFlat);

    // Calculate if target is within the max tracking angle
    // Cap maxTrackAngle to 170 degrees (≈2.97 rad) to ensure there's always a blind spot behind
    // This prevents the edge case where maxTrackAngle = PI means tracking never turns off
    const effectiveMaxAngle = Math.min(options.maxTrackAngle, Math.PI * 0.944); // ~170 degrees max
    const maxAngleCos = Math.cos(effectiveMaxAngle);
    const isInTrackingRange = dotProduct >= maxAngleCos;

    let angleToTarget = charForwardFlat.angleTo(dirToTargetFlat);

    // Determine if target is to the left or right (for signed angle)
    const cross = charForwardFlat.clone().cross(dirToTargetFlat);
    const sign = cross.y >= 0 ? 1 : -1;
    angleToTarget *= sign;

    // Calculate vertical angle (pitch)
    const verticalAngle = Math.asin(Math.max(-1, Math.min(1, dirToTarget.y)));

    // Calculate TARGET rotation distribution between head and neck
    let targetHeadYaw = 0;
    let targetNeckYaw = 0;
    let targetHeadPitch = 0;
    let targetNeckPitch = 0;

    if (isInTrackingRange) {
      // Target is within tracking range - track it

      // Clamp angles to max tracking range
      const clampedHorizontal = Math.max(
        -options.maxTrackAngle,
        Math.min(options.maxTrackAngle, angleToTarget),
      );
      const clampedVertical = Math.max(
        -options.maxPitchAngle,
        Math.min(options.maxPitchAngle, verticalAngle),
      );

      const absAngle = Math.abs(clampedHorizontal);

      // Negate pitch because positive X rotation tilts head down, but we want to look up when target is above
      targetHeadPitch = -clampedVertical * options.headPitchFactor;
      targetNeckPitch = -clampedVertical * options.neckPitchFactor;

      if (absAngle <= options.headOnlyAngle) {
        // Within head-only zone: head only
        targetHeadYaw = clampedHorizontal;
        targetNeckYaw = 0;
      } else {
        // Beyond head-only zone: distribute between neck and head
        const extraAngle = absAngle - options.headOnlyAngle;
        targetHeadYaw = options.headOnlyAngle * Math.sign(clampedHorizontal);
        targetNeckYaw =
          extraAngle * Math.sign(clampedHorizontal) * options.neckYawFactor;
      }
    }
    // else: target is outside tracking range, all target angles stay at 0 (look forward)

    // Update tracking weight: lerp towards speakingWeight when speaking / idleWeight when not speaking (if in range), 0 when out
    // Speaking: higher tracking influence (default 0.7 = 70% tracking, 30% animation)
    // Not speaking: moderate tracking influence (default 0.5 = 50% tracking, 50% animation)
    const targetWeight = isInTrackingRange
      ? isSpeaking
        ? options.speakingWeight
        : options.idleWeight
      : 0;
    trackingWeight.current +=
      (targetWeight - trackingWeight.current) * options.lerpSpeed;

    // Smooth the ANGLES (not quaternions) - this gives stable results
    const lerp = options.lerpSpeed;
    smoothedAngles.current.headYaw +=
      (targetHeadYaw - smoothedAngles.current.headYaw) * lerp;
    smoothedAngles.current.headPitch +=
      (targetHeadPitch - smoothedAngles.current.headPitch) * lerp;
    smoothedAngles.current.neckYaw +=
      (targetNeckYaw - smoothedAngles.current.neckYaw) * lerp;
    smoothedAngles.current.neckPitch +=
      (targetNeckPitch - smoothedAngles.current.neckPitch) * lerp;

    // Store animation quaternions BEFORE we modify them
    const animHeadQuat = head.quaternion.clone();
    const animNeck1Quat = neck1 ? neck1.quaternion.clone() : null;
    const animNeck2Quat = neck2 ? neck2.quaternion.clone() : null;

    // Calculate tracking quaternions (rest pose + look rotation)
    // For MetaHuman CC5: X-axis = Yaw (left/right turn), Z-axis = Pitch (up/down)
    // Negate pitch because positive rotation should look up when camera is above
    const headLookRotation = tempQuat2.setFromEuler(
      new THREE.Euler(
        smoothedAngles.current.headYaw,
        0,
        -smoothedAngles.current.headPitch,
        "XYZ",
      ),
    );
    const trackingHeadQuat = restPose.current.head
      .clone()
      .multiply(headLookRotation);

    // Blend between animation and tracking based on weight
    // weight = 0: pure animation, weight = 1: pure tracking
    head.quaternion
      .copy(animHeadQuat)
      .slerp(trackingHeadQuat, trackingWeight.current);

    // Neck2: blend animation with tracking
    if (neck2 && animNeck2Quat) {
      const neck2LookRotation = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
          smoothedAngles.current.neckYaw * 0.5,
          0,
          -smoothedAngles.current.neckPitch * 0.5,
          "XYZ",
        ),
      );
      const trackingNeck2Quat = restPose.current.neck2
        .clone()
        .multiply(neck2LookRotation);
      neck2.quaternion
        .copy(animNeck2Quat)
        .slerp(trackingNeck2Quat, trackingWeight.current);
    }

    // Neck1: blend animation with tracking
    if (neck1 && animNeck1Quat) {
      const neck1LookRotation = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
          smoothedAngles.current.neckYaw * 0.5,
          0,
          -smoothedAngles.current.neckPitch * 0.5,
          "XYZ",
        ),
      );
      const trackingNeck1Quat = restPose.current.neck1
        .clone()
        .multiply(neck1LookRotation);
      neck1.quaternion
        .copy(animNeck1Quat)
        .slerp(trackingNeck1Quat, trackingWeight.current);
    }
  });

  // Function to set a custom target position
  const setTarget = (position) => {
    if (position) {
      if (!customTarget.current) {
        customTarget.current = new THREE.Vector3();
      }
      customTarget.current.copy(position);
    } else {
      customTarget.current = null; // Reset to camera tracking
    }
  };

  return {
    headBoneRef,
    neckBone1Ref,
    neckBone2Ref,
    spineBoneRef,
    setTarget,
  };
}
