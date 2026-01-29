/**
 * ARKit Blendshape Mappings
 * Maps Convai's ARKit blendshape names to your 3D model's morph target names
 * 
 * MODULAR MAPPING SYSTEM:
 * You can use presets or create custom mappings. See blendshapeMappingPresets.js for:
 * - PRESETS.ARKIT_TO_CC_EXTENDED (Character Creator Extended)
 * - PRESETS.ARKIT_TO_RPM (Ready Player Me)
 * - PRESETS.ARKIT_TO_MIXAMO (Mixamo characters)
 * - createMapping(preset, overrides) - Create custom mapping from preset
 * 
 * Example using preset:
 * import { PRESETS, createMapping } from './blendshapeMappingPresets';
 * const mapping = PRESETS.ARKIT_TO_CC_EXTENDED;
 * // Or with overrides:
 * const mapping = createMapping('CC_EXTENDED', { jawOpen: 'My_Custom_Jaw' });
 */

// Ariana model blendshape mapping (CC Extended format with custom overrides)
export const CONVAI_TO_MODEL_MAPPING = {
  // Brows
  "browDownLeft": "Brow_Drop_L",
  "browDownRight": "Brow_Drop_R",
  "browInnerUp": ["Brow_Raise_Inner_L", "Brow_Raise_Inner_R"],
  "browOuterUpLeft": "Brow_Raise_Outer_L",
  "browOuterUpRight": "Brow_Raise_Outer_R",
  
  // Cheeks
  "cheekPuff": ["Cheek_Puff_L", "Cheek_Puff_R"],
  "cheekSquintLeft": "Cheek_Raise_L",
  "cheekSquintRight": "Cheek_Raise_R",
  
  // Eyes
  "eyeBlinkLeft": "Eye_Blink_L",
  "eyeBlinkRight": "Eye_Blink_R",
  "eyeLookDownLeft": "Eye_L_Look_Down",
  "eyeLookDownRight": "Eye_R_Look_Down",
  "eyeLookInLeft": "Eye_L_Look_R",  // Looking in (toward nose) means looking right for left eye
  "eyeLookInRight": "Eye_R_Look_L", // Looking in (toward nose) means looking left for right eye
  "eyeLookOutLeft": "Eye_L_Look_L",
  "eyeLookOutRight": "Eye_R_Look_R",
  "eyeLookUpLeft": "Eye_L_Look_Up",
  "eyeLookUpRight": "Eye_R_Look_Up",
  "eyeSquintLeft": "Eye_Squint_L",
  "eyeSquintRight": "Eye_Squint_R",
  "eyeWideLeft": "Eye_Wide_L",
  "eyeWideRight": "Eye_Wide_R",
  
  // Jaw
  "jawForward": "Jaw_Forward",
  "jawLeft": "Jaw_L",
  "jawOpen": null, // NEVER use morph - controlled by CC_Base_JawRoot bone only
  "jawRight": "Jaw_R",
  
  // Mouth
  "mouthClose": "Mouth_Close",
  "mouthDimpleLeft": "Mouth_Dimple_L",
  "mouthDimpleRight": "Mouth_Dimple_R",
  "mouthFrownLeft": "Mouth_Frown_L",
  "mouthFrownRight": "Mouth_Frown_R",
  "mouthFunnel": ["Mouth_Funnel_Up_L", "Mouth_Funnel_Up_R", "Mouth_Funnel_Down_L", "Mouth_Funnel_Down_R"],
  "mouthLeft": "Mouth_L",
  "mouthLowerDownLeft": "Mouth_Down_Lower_L",
  "mouthLowerDownRight": "Mouth_Down_Lower_R",
  "mouthPressLeft": "Mouth_Press_L",
  "mouthPressRight": "Mouth_Press_R",
  "mouthPucker": ["Mouth_Pucker_Up_L", "Mouth_Pucker_Up_R", "Mouth_Pucker_Down_L", "Mouth_Pucker_Down_R"],
  "mouthRight": "Mouth_R",
  "mouthRollLower": ["Mouth_Roll_In_Lower_L", "Mouth_Roll_In_Lower_R"],
  "mouthRollUpper": ["Mouth_Roll_In_Upper_L", "Mouth_Roll_In_Upper_R"],
  "mouthShrugLower": "Mouth_Shrug_Lower",
  "mouthShrugUpper": "Mouth_Shrug_Upper",
  "mouthSmileLeft": "Mouth_Smile_L",
  "mouthSmileRight": "Mouth_Smile_R",
  "mouthStretchLeft": "Mouth_Stretch_L",
  "mouthStretchRight": "Mouth_Stretch_R",
  "mouthUpperUpLeft": "Mouth_Up_Upper_L",
  "mouthUpperUpRight": "Mouth_Up_Upper_R",
  
  // Nose
  "noseSneerLeft": "Nose_Sneer_L",
  "noseSneerRight": "Nose_Sneer_R",
  
  // Tongue
  "tongueOut": null, // Controlled by bones, not morphs
};

/**
 * Bone names in the character rig
 * Update these to match your character's bone hierarchy
 */
export const BONE_NAMES = {
  JAW: "CC_Base_JawRoot",
  TONGUE_01: "CC_Base_Tongue01", // Rotation control
  TONGUE_02: "CC_Base_Tongue02", // Position control
};

/**
 * Default morph target names for blinking
 * Override if your model uses different names
 */
export const BLINK_MORPHS = {
  LEFT: "Eye_Blink_L",
  RIGHT: "Eye_Blink_R",
};

