/**
 * Bone Configuration Presets
 * 
 * Different character types use different bone naming conventions.
 * These presets define the bone names for jaw, tongue, head, and neck
 * that are used to control non-morph-target animations.
 * 
 * Usage:
 * - CC_EXTENDED / CC5: Character Creator 4/5 models
 * - RPM: Ready Player Me avatars
 * - ARKIT: ARKit-based models (typically use morph targets only)
 */

/**
 * Character Creator Extended (CC4) Bone Configuration
 * Used for Character Creator 4+ models with extended rigging
 */
export const CC_EXTENDED_BONES = {
  JAW: "CC_Base_JawRoot",
  TONGUE_01: "CC_Base_Tongue01",
  TONGUE_02: "CC_Base_Tongue02",
  HEAD: "CC_Base_Head",
  NECK: "CC_Base_NeckTwist01",
};

/**
 * Character Creator 5 (CC5) Bone Configuration
 * Similar to CC_EXTENDED, compatible with CC5 models
 */
export const CC5_BONES = {
  JAW: "CC_Base_JawRoot",
  TONGUE_01: "CC_Base_Tongue01",
  TONGUE_02: "CC_Base_Tongue02",
  HEAD: "CC_Base_Head",
  NECK: "CC_Base_NeckTwist01",
};

/**
 * Ready Player Me (RPM) Bone Configuration
 * RPM avatars have simpler naming conventions
 */
export const RPM_BONES = {
  JAW: "Jaw",
  TONGUE_01: null, // RPM typically doesn't have tongue bones
  TONGUE_02: null,
  HEAD: "Head",
  NECK: "Neck",
};

/**
 * ARKit Standard Bone Configuration
 * Most ARKit models use morph targets instead of bone-based jaw animation
 */
export const ARKIT_BONES = {
  JAW: null, // Uses jawOpen morph target
  TONGUE_01: null,
  TONGUE_02: null,
  HEAD: "Head",
  NECK: "Neck",
};

/**
 * Collection of all bone presets
 */
export const BONE_PRESETS = {
  CC_EXTENDED: CC_EXTENDED_BONES,
  CC5: CC5_BONES,
  RPM: RPM_BONES,
  ARKIT: ARKIT_BONES,
};

/**
 * Get bone preset by name
 * 
 * @param {string} presetName - Name of the preset (CC_EXTENDED, CC5, RPM, ARKIT)
 * @returns {Object} Bone configuration object
 * 
 * @example
 * const bones = getBonePreset('CC_EXTENDED');
 * console.log(bones.JAW); // "CC_Base_JawRoot"
 */
export function getBonePreset(presetName) {
  return BONE_PRESETS[presetName] || BONE_PRESETS.CC_EXTENDED;
}

/**
 * Check if a preset uses bone-based jaw animation
 * 
 * @param {string} presetName - Name of the preset
 * @returns {boolean} True if jaw is controlled by a bone
 */
export function usesBoneJaw(presetName) {
  const preset = getBonePreset(presetName);
  return preset.JAW !== null;
}

/**
 * Check if a preset uses bone-based tongue animation
 * 
 * @param {string} presetName - Name of the preset
 * @returns {boolean} True if tongue is controlled by bones
 */
export function usesBoneTongue(presetName) {
  const preset = getBonePreset(presetName);
  return preset.TONGUE_01 !== null && preset.TONGUE_02 !== null;
}
