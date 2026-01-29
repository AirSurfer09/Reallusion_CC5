/**
 * Blendshape Mapping Template
 * 
 * Use this template to create new blendshape mappings.
 * 
 * Steps:
 * 1. Copy this file to mappings/arkit/arkitToYourTarget.js
 * 2. Fill in all 52 ARKit blendshapes
 * 3. Add bone configuration to mappings/bones/index.js
 * 4. Export from mappings/index.js
 * 5. Test and validate
 * 
 * Mapping Types:
 * - One-to-one:    "source": "target"
 * - One-to-many:   "source": ["target1", "target2"]
 * - Bone-controlled: "source": null
 */

export const ARKIT_TO_YOUR_TARGET = {
  // ============================================================================
  // EYES (14 blendshapes)
  // ============================================================================
  "eyeBlinkLeft": "YourTarget_Eye_Blink_L",
  "eyeBlinkRight": "YourTarget_Eye_Blink_R",
  "eyeLookDownLeft": "YourTarget_Eye_Look_Down_L",
  "eyeLookDownRight": "YourTarget_Eye_Look_Down_R",
  "eyeLookInLeft": "YourTarget_Eye_Look_In_L",      // Look toward nose
  "eyeLookInRight": "YourTarget_Eye_Look_In_R",     // Look toward nose
  "eyeLookOutLeft": "YourTarget_Eye_Look_Out_L",    // Look away from nose
  "eyeLookOutRight": "YourTarget_Eye_Look_Out_R",   // Look away from nose
  "eyeLookUpLeft": "YourTarget_Eye_Look_Up_L",
  "eyeLookUpRight": "YourTarget_Eye_Look_Up_R",
  "eyeSquintLeft": "YourTarget_Eye_Squint_L",
  "eyeSquintRight": "YourTarget_Eye_Squint_R",
  "eyeWideLeft": "YourTarget_Eye_Wide_L",
  "eyeWideRight": "YourTarget_Eye_Wide_R",
  
  // ============================================================================
  // BROWS (5 blendshapes)
  // ============================================================================
  "browDownLeft": "YourTarget_Brow_Down_L",
  "browDownRight": "YourTarget_Brow_Down_R",
  "browInnerUp": "YourTarget_Brow_Inner_Up",        // Can be array: ["L", "R"]
  "browOuterUpLeft": "YourTarget_Brow_Outer_Up_L",
  "browOuterUpRight": "YourTarget_Brow_Outer_Up_R",
  
  // ============================================================================
  // CHEEKS (3 blendshapes)
  // ============================================================================
  "cheekPuff": "YourTarget_Cheek_Puff",             // Can be array: ["L", "R"]
  "cheekSquintLeft": "YourTarget_Cheek_Squint_L",
  "cheekSquintRight": "YourTarget_Cheek_Squint_R",
  
  // ============================================================================
  // JAW (4 blendshapes)
  // ============================================================================
  "jawForward": "YourTarget_Jaw_Forward",
  "jawLeft": "YourTarget_Jaw_Left",
  "jawOpen": null,                                  // Usually bone-controlled (null)
  "jawRight": "YourTarget_Jaw_Right",
  
  // ============================================================================
  // MOUTH (23 blendshapes) - Most important for lipsync!
  // ============================================================================
  "mouthClose": "YourTarget_Mouth_Close",
  "mouthDimpleLeft": "YourTarget_Mouth_Dimple_L",
  "mouthDimpleRight": "YourTarget_Mouth_Dimple_R",
  "mouthFrownLeft": "YourTarget_Mouth_Frown_L",
  "mouthFrownRight": "YourTarget_Mouth_Frown_R",
  
  // Funnel (O shape) - often needs multiple morphs
  "mouthFunnel": "YourTarget_Mouth_Funnel",         // or ["Funnel_Upper", "Funnel_Lower"]
  
  "mouthLeft": "YourTarget_Mouth_Left",
  "mouthLowerDownLeft": "YourTarget_Mouth_Lower_Down_L",
  "mouthLowerDownRight": "YourTarget_Mouth_Lower_Down_R",
  "mouthPressLeft": "YourTarget_Mouth_Press_L",
  "mouthPressRight": "YourTarget_Mouth_Press_R",
  
  // Pucker (U shape) - often needs multiple morphs
  "mouthPucker": "YourTarget_Mouth_Pucker",         // or ["Pucker_Upper", "Pucker_Lower"]
  
  "mouthRight": "YourTarget_Mouth_Right",
  
  // Roll (lips tucked in)
  "mouthRollLower": "YourTarget_Mouth_Roll_Lower",  // or ["Roll_Lower_L", "Roll_Lower_R"]
  "mouthRollUpper": "YourTarget_Mouth_Roll_Upper",  // or ["Roll_Upper_L", "Roll_Upper_R"]
  
  "mouthShrugLower": "YourTarget_Mouth_Shrug_Lower",
  "mouthShrugUpper": "YourTarget_Mouth_Shrug_Upper",
  
  // Smile - KEY for speech!
  "mouthSmileLeft": "YourTarget_Mouth_Smile_L",
  "mouthSmileRight": "YourTarget_Mouth_Smile_R",
  
  // Stretch - KEY for speech!
  "mouthStretchLeft": "YourTarget_Mouth_Stretch_L",
  "mouthStretchRight": "YourTarget_Mouth_Stretch_R",
  
  "mouthUpperUpLeft": "YourTarget_Mouth_Upper_Up_L",
  "mouthUpperUpRight": "YourTarget_Mouth_Upper_Up_R",
  
  // ============================================================================
  // NOSE (2 blendshapes)
  // ============================================================================
  "noseSneerLeft": "YourTarget_Nose_Sneer_L",
  "noseSneerRight": "YourTarget_Nose_Sneer_R",
  
  // ============================================================================
  // TONGUE (1 blendshape)
  // ============================================================================
  "tongueOut": null,                                // Usually bone-controlled (null)
};

// ============================================================================
// BONE CONFIGURATION
// ============================================================================
// Add this to mappings/bones/index.js:
/*
export const YOUR_TARGET_BONES = {
  JAW: "YourTarget_Jaw_Bone",           // or null if morph-controlled
  TONGUE_01: "YourTarget_Tongue_01",    // or null if no tongue bones
  TONGUE_02: "YourTarget_Tongue_02",    // or null if no tongue bones
  HEAD: "YourTarget_Head",
  NECK: "YourTarget_Neck",
};
*/

// ============================================================================
// VALIDATION
// ============================================================================
// After creating your mapping, validate it:
/*
import { validateMapping } from '../utils';

const validation = validateMapping(ARKIT_TO_YOUR_TARGET);
console.log('Validation:', validation);
// Should have 100% coverage (52/52 blendshapes)
*/

// ============================================================================
// USAGE
// ============================================================================
/*
import { ARKIT_TO_YOUR_TARGET } from './constants/mappings/arkit/arkitToYourTarget';

useArkitLipsync({
  convaiClient,
  characterRef,
  scene,
  mapping: ARKIT_TO_YOUR_TARGET,
  bonePreset: 'YOUR_TARGET', // Use your bone preset name
});
*/
