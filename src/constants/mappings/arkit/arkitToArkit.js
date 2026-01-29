/**
 * ARKit to ARKit (Passthrough) Mapping
 * 
 * Use this when your 3D model already has ARKit-named blendshapes.
 * This is a 1:1 passthrough mapping.
 * 
 * Common use cases:
 * - Models exported from ARKit/Face Tracking apps
 * - Apple Vision Pro avatars
 * - Models already using Apple's ARKit blendshape naming convention
 * 
 * @example
 * import { ARKIT_TO_ARKIT } from './constants/mappings';
 * 
 * useArkitLipsync({
 *   convaiClient,
 *   characterRef,
 *   scene,
 *   mapping: ARKIT_TO_ARKIT
 * });
 */

import { ARKIT_BLENDSHAPES } from './index';

/**
 * Generate passthrough mapping (each blendshape maps to itself)
 */
export const ARKIT_TO_ARKIT = ARKIT_BLENDSHAPES.reduce((acc, name) => {
  acc[name] = name;
  return acc;
}, {});
