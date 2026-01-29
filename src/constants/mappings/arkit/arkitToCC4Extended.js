/**
 * ARKit to Character Creator 4 Extended (CC4 Extended) Mapping
 * 
 * Used for CC4 characters with extended blendshape sets.
 * This is compatible with Character Creator 4 models exported with
 * extended facial expressions and high-quality morph targets.
 * 
 * Features:
 * - One-to-one mappings for most blendshapes
 * - One-to-many mappings for complex expressions (e.g., mouthFunnel, mouthPucker)
 * - Bone-controlled jaw and tongue (set to null)
 * 
 * @example
 * import { ARKIT_TO_CC4_EXTENDED } from './constants/mappings';
 * 
 * useArkitLipsync({
 *   convaiClient,
 *   characterRef,
 *   scene,
 *   mapping: ARKIT_TO_CC4_EXTENDED
 * });
 */

export const ARKIT_TO_CC4_EXTENDED = {
  // ============================================================================
  // BROWS
  // ============================================================================
  "browDownLeft": "Brow_Drop_L",
  "browDownRight": "Brow_Drop_R",
  "browInnerUp": ["Brow_Raise_Inner_L", "Brow_Raise_Inner_R"],
  "browOuterUpLeft": "Brow_Raise_Outer_L",
  "browOuterUpRight": "Brow_Raise_Outer_R",
  
  // ============================================================================
  // CHEEKS
  // ============================================================================
  "cheekPuff": ["Cheek_Puff_L", "Cheek_Puff_R"],
  "cheekSquintLeft": "Cheek_Raise_L",
  "cheekSquintRight": "Cheek_Raise_R",
  
  // ============================================================================
  // EYES
  // ============================================================================
  "eyeBlinkLeft": "Eye_Blink_L",
  "eyeBlinkRight": "Eye_Blink_R",
  "eyeLookDownLeft": "Eye_L_Look_Down",
  "eyeLookDownRight": "Eye_R_Look_Down",
  "eyeLookInLeft": "Eye_L_Look_R",
  "eyeLookInRight": "Eye_R_Look_L",
  "eyeLookOutLeft": "Eye_L_Look_L",
  "eyeLookOutRight": "Eye_R_Look_R",
  "eyeLookUpLeft": "Eye_L_Look_Up",
  "eyeLookUpRight": "Eye_R_Look_Up",
  "eyeSquintLeft": "Eye_Squint_L",
  "eyeSquintRight": "Eye_Squint_R",
  "eyeWideLeft": "Eye_Wide_L",
  "eyeWideRight": "Eye_Wide_R",
  
  // ============================================================================
  // JAW
  // ============================================================================
  "jawForward": "Jaw_Forward",
  "jawLeft": "Jaw_L",
  "jawOpen": null, // Controlled by CC_Base_JawRoot bone
  "jawRight": "Jaw_R",
  
  // ============================================================================
  // MOUTH
  // ============================================================================
  "mouthClose": "Mouth_Close",
  "mouthDimpleLeft": "Mouth_Dimple_L",
  "mouthDimpleRight": "Mouth_Dimple_R",
  "mouthFrownLeft": "Mouth_Frown_L",
  "mouthFrownRight": "Mouth_Frown_R",
  "mouthFunnel": [
    "Mouth_Funnel_Up_L",
    "Mouth_Funnel_Up_R",
    "Mouth_Funnel_Down_L",
    "Mouth_Funnel_Down_R"
  ],
  "mouthLeft": "Mouth_L",
  "mouthLowerDownLeft": "Mouth_Down_Lower_L",
  "mouthLowerDownRight": "Mouth_Down_Lower_R",
  "mouthPressLeft": "Mouth_Press_L",
  "mouthPressRight": "Mouth_Press_R",
  "mouthPucker": [
    "Mouth_Pucker_Up_L",
    "Mouth_Pucker_Up_R",
    "Mouth_Pucker_Down_L",
    "Mouth_Pucker_Down_R"
  ],
  "mouthRight": "Mouth_R",
  "mouthRollLower": [
    "Mouth_Roll_In_Lower_L",
    "Mouth_Roll_In_Lower_R"
  ],
  "mouthRollUpper": [
    "Mouth_Roll_In_Upper_L",
    "Mouth_Roll_In_Upper_R"
  ],
  "mouthShrugLower": "Mouth_Shrug_Lower",
  "mouthShrugUpper": "Mouth_Shrug_Upper",
  "mouthSmileLeft": "Mouth_Smile_L",
  "mouthSmileRight": "Mouth_Smile_R",
  "mouthStretchLeft": "Mouth_Stretch_L",
  "mouthStretchRight": "Mouth_Stretch_R",
  "mouthUpperUpLeft": "Mouth_Up_Upper_L",
  "mouthUpperUpRight": "Mouth_Up_Upper_R",
  
  // ============================================================================
  // NOSE
  // ============================================================================
  "noseSneerLeft": "Nose_Sneer_L",
  "noseSneerRight": "Nose_Sneer_R",
  
  // ============================================================================
  // TONGUE
  // ============================================================================
  "tongueOut": null, // Controlled by CC_Base_Tongue01 and CC_Base_Tongue02 bones
};

// Alias for backward compatibility
export const ARKIT_TO_CC_EXTENDED = ARKIT_TO_CC4_EXTENDED;
