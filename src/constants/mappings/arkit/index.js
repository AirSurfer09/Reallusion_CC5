/**
 * ARKit 61 Blendshape Format Definition
 * 
 * This is the standard format sent by Convai's blendshape provider.
 * The server sends blendshape data in this specific order (52 elements, indices 0-51).
 * 
 * Note: The full ARKit 61 format includes 9 additional values for head/eye rotations (indices 52-60),
 * but those are typically handled separately in the animation system.
 */

/**
 * ARKit 61 blendshape names (Convai's custom order)
 * These correspond to Apple's ARKit facial blendshapes
 */
export const ARKIT_BLENDSHAPES = [
  "eyeBlinkLeft",           // 0
  "eyeLookDownLeft",        // 1
  "eyeLookInLeft",          // 2
  "eyeLookOutLeft",         // 3
  "eyeLookUpLeft",          // 4
  "eyeSquintLeft",          // 5
  "eyeWideLeft",            // 6
  "eyeBlinkRight",          // 7
  "eyeLookDownRight",       // 8
  "eyeLookInRight",         // 9
  "eyeLookOutRight",        // 10
  "eyeLookUpRight",         // 11
  "eyeSquintRight",         // 12
  "eyeWideRight",           // 13
  "jawForward",             // 14
  "jawRight",               // 15
  "jawLeft",                // 16
  "jawOpen",                // 17 - 🔑 KEY for mouth opening
  "mouthClose",             // 18 - 🔑 KEY for mouth closing
  "mouthFunnel",            // 19 - 🔑 KEY for "O" sounds
  "mouthPucker",            // 20 - 🔑 KEY for "U" sounds
  "mouthRight",             // 21
  "mouthLeft",              // 22
  "mouthSmileLeft",         // 23 - 🔑 KEY for "ee" sounds
  "mouthSmileRight",        // 24 - 🔑 KEY for "ee" sounds
  "mouthFrownLeft",         // 25
  "mouthFrownRight",        // 26
  "mouthDimpleLeft",        // 27
  "mouthDimpleRight",       // 28
  "mouthStretchLeft",       // 29 - 🔑 KEY for wide mouth
  "mouthStretchRight",      // 30 - 🔑 KEY for wide mouth
  "mouthRollLower",         // 31
  "mouthRollUpper",         // 32
  "mouthShrugLower",        // 33
  "mouthShrugUpper",        // 34
  "mouthPressLeft",         // 35
  "mouthPressRight",        // 36
  "mouthLowerDownLeft",     // 37
  "mouthLowerDownRight",    // 38
  "mouthUpperUpLeft",       // 39
  "mouthUpperUpRight",      // 40
  "browDownLeft",           // 41
  "browDownRight",          // 42
  "browInnerUp",            // 43
  "browOuterUpLeft",        // 44
  "browOuterUpRight",       // 45
  "cheekPuff",              // 46
  "cheekSquintLeft",        // 47
  "cheekSquintRight",       // 48
  "noseSneerLeft",          // 49
  "noseSneerRight",         // 50
  "tongueOut",              // 51 - 🔑 KEY for "th" sounds
];

/**
 * ARKit 61 extended format (includes head and eye rotations)
 * Indices 52-60 contain rotation data
 */
export const ARKIT_61_EXTENDED = [
  ...ARKIT_BLENDSHAPES,
  "headYaw",                // 52 - Head rotation left/right
  "headPitch",              // 53 - Head rotation up/down
  "headRoll",               // 54 - Head rotation tilt
  "leftEyeYaw",             // 55 - Left eye rotation left/right
  "leftEyePitch",           // 56 - Left eye rotation up/down
  "leftEyeRoll",            // 57 - Left eye rotation roll
  "rightEyeYaw",            // 58 - Right eye rotation left/right
  "rightEyePitch",          // 59 - Right eye rotation up/down
  "rightEyeRoll",           // 60 - Right eye rotation roll
];

/**
 * Key blendshapes for lip-sync (most important for speech)
 */
export const KEY_LIPSYNC_BLENDSHAPES = {
  JAW_OPEN: 17,
  MOUTH_CLOSE: 18,
  MOUTH_FUNNEL: 19,
  MOUTH_PUCKER: 20,
  MOUTH_SMILE_LEFT: 23,
  MOUTH_SMILE_RIGHT: 24,
  MOUTH_STRETCH_LEFT: 29,
  MOUTH_STRETCH_RIGHT: 30,
  TONGUE_OUT: 51,
};

/**
 * Blendshape categories for easier filtering/processing
 */
export const ARKIT_CATEGORIES = {
  eyes: [
    "eyeBlinkLeft", "eyeBlinkRight",
    "eyeLookDownLeft", "eyeLookDownRight",
    "eyeLookInLeft", "eyeLookInRight",
    "eyeLookOutLeft", "eyeLookOutRight",
    "eyeLookUpLeft", "eyeLookUpRight",
    "eyeSquintLeft", "eyeSquintRight",
    "eyeWideLeft", "eyeWideRight",
  ],
  brows: [
    "browDownLeft", "browDownRight",
    "browInnerUp",
    "browOuterUpLeft", "browOuterUpRight",
  ],
  jaw: [
    "jawForward", "jawLeft", "jawOpen", "jawRight",
  ],
  mouth: [
    "mouthClose", "mouthDimpleLeft", "mouthDimpleRight",
    "mouthFrownLeft", "mouthFrownRight", "mouthFunnel",
    "mouthLeft", "mouthLowerDownLeft", "mouthLowerDownRight",
    "mouthPressLeft", "mouthPressRight", "mouthPucker",
    "mouthRight", "mouthRollLower", "mouthRollUpper",
    "mouthShrugLower", "mouthShrugUpper",
    "mouthSmileLeft", "mouthSmileRight",
    "mouthStretchLeft", "mouthStretchRight",
    "mouthUpperUpLeft", "mouthUpperUpRight",
  ],
  cheeks: [
    "cheekPuff", "cheekSquintLeft", "cheekSquintRight",
  ],
  nose: [
    "noseSneerLeft", "noseSneerRight",
  ],
  tongue: [
    "tongueOut",
  ],
};
