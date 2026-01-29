/**
 * ARKit to Ready Player Me (RPM) Mapping
 * 
 * Ready Player Me avatars use standard ARKit blendshape names,
 * so this is mostly a passthrough mapping with lowercase names.
 * 
 * RPM avatars typically support the standard 52 ARKit facial blendshapes.
 * 
 * @example
 * import { ARKIT_TO_RPM } from './constants/mappings';
 * 
 * useArkitLipsync({
 *   convaiClient,
 *   characterRef,
 *   scene,
 *   mapping: ARKIT_TO_RPM
 * });
 */

export const ARKIT_TO_RPM = {
  // ============================================================================
  // EYES
  // ============================================================================
  "eyeBlinkLeft": "eyeBlinkLeft",
  "eyeBlinkRight": "eyeBlinkRight",
  "eyeLookDownLeft": "eyeLookDownLeft",
  "eyeLookDownRight": "eyeLookDownRight",
  "eyeLookInLeft": "eyeLookInLeft",
  "eyeLookInRight": "eyeLookInRight",
  "eyeLookOutLeft": "eyeLookOutLeft",
  "eyeLookOutRight": "eyeLookOutRight",
  "eyeLookUpLeft": "eyeLookUpLeft",
  "eyeLookUpRight": "eyeLookUpRight",
  "eyeSquintLeft": "eyeSquintLeft",
  "eyeSquintRight": "eyeSquintRight",
  "eyeWideLeft": "eyeWideLeft",
  "eyeWideRight": "eyeWideRight",
  
  // ============================================================================
  // JAW
  // ============================================================================
  "jawForward": "jawForward",
  "jawLeft": "jawLeft",
  "jawOpen": "jawOpen",
  "jawRight": "jawRight",
  
  // ============================================================================
  // MOUTH
  // ============================================================================
  "mouthClose": "mouthClose",
  "mouthDimpleLeft": "mouthDimpleLeft",
  "mouthDimpleRight": "mouthDimpleRight",
  "mouthFrownLeft": "mouthFrownLeft",
  "mouthFrownRight": "mouthFrownRight",
  "mouthFunnel": "mouthFunnel",
  "mouthLeft": "mouthLeft",
  "mouthLowerDownLeft": "mouthLowerDownLeft",
  "mouthLowerDownRight": "mouthLowerDownRight",
  "mouthPressLeft": "mouthPressLeft",
  "mouthPressRight": "mouthPressRight",
  "mouthPucker": "mouthPucker",
  "mouthRight": "mouthRight",
  "mouthRollLower": "mouthRollLower",
  "mouthRollUpper": "mouthRollUpper",
  "mouthShrugLower": "mouthShrugLower",
  "mouthShrugUpper": "mouthShrugUpper",
  "mouthSmileLeft": "mouthSmileLeft",
  "mouthSmileRight": "mouthSmileRight",
  "mouthStretchLeft": "mouthStretchLeft",
  "mouthStretchRight": "mouthStretchRight",
  "mouthUpperUpLeft": "mouthUpperUpLeft",
  "mouthUpperUpRight": "mouthUpperUpRight",
  
  // ============================================================================
  // BROWS
  // ============================================================================
  "browDownLeft": "browDownLeft",
  "browDownRight": "browDownRight",
  "browInnerUp": "browInnerUp",
  "browOuterUpLeft": "browOuterUpLeft",
  "browOuterUpRight": "browOuterUpRight",
  
  // ============================================================================
  // CHEEKS
  // ============================================================================
  "cheekPuff": "cheekPuff",
  "cheekSquintLeft": "cheekSquintLeft",
  "cheekSquintRight": "cheekSquintRight",
  
  // ============================================================================
  // NOSE
  // ============================================================================
  "noseSneerLeft": "noseSneerLeft",
  "noseSneerRight": "noseSneerRight",
  
  // ============================================================================
  // TONGUE
  // ============================================================================
  "tongueOut": "tongueOut",
};
