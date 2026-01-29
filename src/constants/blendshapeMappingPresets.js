/**
 * Blendshape Mapping Presets (Legacy/Backward Compatibility)
 * 
 * ⚠️ DEPRECATED: This file is maintained for backward compatibility.
 * 
 * NEW RECOMMENDED APPROACH:
 * Import directly from the modular structure:
 * 
 * @example
 * // New way (recommended)
 * import { ARKIT_TO_CC4_EXTENDED, ARKIT_TO_RPM } from './mappings';
 * 
 * // Old way (still works)
 * import { ARKIT_TO_CC_EXTENDED } from './blendshapeMappingPresets';
 * 
 * See: ./mappings/ directory for the new modular structure
 */

// Import for use in PRESETS object below
import {
  ARKIT_TO_CC_EXTENDED as _ARKIT_TO_CC_EXTENDED,
  ARKIT_TO_ARKIT as _ARKIT_TO_ARKIT,
  ARKIT_TO_RPM as _ARKIT_TO_RPM,
} from './mappings';

// Re-export everything from the new modular structure
export {
  // ARKit source format
  ARKIT_BLENDSHAPES,
  ARKIT_61_EXTENDED,
  KEY_LIPSYNC_BLENDSHAPES,
  ARKIT_CATEGORIES,
  
  // ARKit mappings
  ARKIT_TO_CC4_EXTENDED,
  ARKIT_TO_CC_EXTENDED,
  ARKIT_TO_RPM,
  ARKIT_TO_ARKIT,
  
  // MetaHuman mappings
  METAHUMAN_TO_CC5_MAPPING,
  convertMetaHumanToCC5,
  getMetaHumanChannelNames,
  getCC5ChannelNames,
  
  // Bone presets
  CC_EXTENDED_BONES,
  CC5_BONES,
  RPM_BONES,
  ARKIT_BONES,
  BONE_PRESETS,
  getBonePreset,
  usesBoneJaw,
  usesBoneTongue,
  
  // Utilities
  createMapping,
  mergeMappings,
  filterMappingByCategory,
  getMappingStats,
  formatMapping,
  
  // Preset collections
  ARKIT_MAPPING_PRESETS,
  METAHUMAN_MAPPING_PRESETS,
  getMapping,
  listMappings,
  getMappingInfo,
} from './mappings';

// Legacy exports for backward compatibility
// Note: Import with aliases above to use in this object
export const PRESETS = {
  ARKIT_TO_CC_EXTENDED: _ARKIT_TO_CC_EXTENDED,
  ARKIT_TO_ARKIT: _ARKIT_TO_ARKIT,
  ARKIT_TO_RPM: _ARKIT_TO_RPM,
};

export const PRESET_NAMES = {
  CC_EXTENDED: 'ARKIT_TO_CC_EXTENDED',
  ARKIT: 'ARKIT_TO_ARKIT',
  RPM: 'ARKIT_TO_RPM',
};

/**
 * @deprecated Use getMapping() from './mappings' instead
 */
export function getPreset(name) {
  console.warn('[DEPRECATED] getPreset() is deprecated. Use getMapping() from "./mappings" instead.');
  return PRESETS[name] || PRESETS[PRESET_NAMES[name]] || {};
}

/**
 * @deprecated Use listMappings() from './mappings' instead
 */
export function listPresets() {
  console.warn('[DEPRECATED] listPresets() is deprecated. Use listMappings() from "./mappings" instead.');
  return Object.keys(PRESETS);
}

// Maintain the old function signature for backward compatibility
export { validateMapping } from './mappings';
