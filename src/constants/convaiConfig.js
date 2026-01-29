/**
 * Convai Configuration
 * Centralized config for API keys and character settings
 */

export const CONVAI_CONFIG = {
  apiKey: "2c37cc3c56366df491563a87624a0221",
  // characterId: "87d76c6a-efbf-11f0-bcc2-42010a5c0002",
  characterId: "95a276e8-fc83-11f0-852b-42010a5c0004",
  ttsEnabled: true,
  blendshapeProvider: "neurosync",
  blendshapeConfig: {
    format: "mha", // "arkit" or "mha" (Meta Human Animation)
  },
};

/**
 * Animation Settings
 */
export const ANIMATION_CONFIG = {
  FPS: 60, // Blendshape playback framerate (matches Convai server)
  LIPSYNC_LERP_SPEED: 0.8, // Per-frame smoothing for blendshapes (0.1 = very smooth/laggy, 0.5 = responsive, 1.0 = instant/no smoothing)
  JAW_LERP_SPEED: 0.8, // Per-frame smoothing for jaw bone rotation (separate from lip blendshapes for smoother jaw movement)
  FADE_OUT_LERP_SPEED: 0.2, // Per-frame smoothing when fading out to neutral (slower = smoother fade-out)
  BLINK_MIN_INTERVAL: 1000, // Minimum time between blinks (ms)
  BLINK_MAX_INTERVAL: 5000, // Maximum time between blinks (ms)
  BLINK_DURATION: 200, // How long a blink lasts (ms)
  LIPSYNC_FADE_IN_DURATION: 0.3, // How long to fade in lipsync when character starts speaking (seconds)
};

/**
 * Jaw bone rotation settings
 * Adjust these values based on your character's rig
 *
 * NOTE: Reallusion mapping specifies JawOpen ClampMaxValue=0.25
 * This means jaw values are automatically limited to 25% to prevent over-opening
 */
export const JAW_CONFIG = {
  CLOSED_ROTATION_DEG: 90.0, // Jaw closed/rest position in degrees
  MAX_OPEN_ROTATION_DEG: 115.0, // Jaw fully open position in degrees
  CLOSED_ROTATION: 1.5708, // 90 degrees in radians (Math.PI / 2)
  MAX_OPEN_ROTATION: 2.0071, // 115 degrees in radians
  ROTATION_RANGE: 0.4363, // Difference between max and min (115° - 90° = 25° = 0.4363 rad)
};

/**
 * Tongue bone settings
 * Adjust multipliers based on your character's scale
 */
export const TONGUE_CONFIG = {
  ROTATION_MULTIPLIER: 0.5, // How much tongue curls
  ROTATION_BASE: 0.3, // Base rotation offset
  EXTENSION_MULTIPLIER: 0.02, // How far tongue extends forward
  ACTIVE_THRESHOLD: 0.1, // Minimum value to activate tongue movement
};
