/**
 * Blendshape Mappings - Main Export
 * 
 * This module provides a modular and reusable system for mapping blendshapes
 * from different source formats to different target formats.
 * 
 * Directory Structure:
 * - mappings/
 *   ├── arkit/           - ARKit source format and ARKit-based mappings
 *   ├── metahuman/       - MetaHuman-based mappings
 *   ├── bones/           - Bone configuration presets
 *   └── utils.js         - Mapping utility functions
 * 
 * Available Mappings:
 * - ARKIT_TO_CC4_EXTENDED - ARKit → Character Creator 4 Extended
 * - ARKIT_TO_RPM          - ARKit → Ready Player Me
 * - ARKIT_TO_ARKIT        - ARKit → ARKit (passthrough)
 * - METAHUMAN_TO_CC5      - MetaHuman → Character Creator 5
 * 
 * @example
 * // Import specific mapping
 * import { ARKIT_TO_CC4_EXTENDED } from './constants/mappings';
 * 
 * // Import utilities
 * import { createMapping, validateMapping } from './constants/mappings';
 * 
 * // Create custom mapping
 * const custom = createMapping(ARKIT_TO_CC4_EXTENDED, {
 *   'mouthSmileLeft': 'My_Custom_Smile'
 * });
 */

// ============================================================================
// ARKIT MAPPINGS
// ============================================================================

export {
  // Source format definition
  ARKIT_BLENDSHAPES,
  ARKIT_61_EXTENDED,
  KEY_LIPSYNC_BLENDSHAPES,
  ARKIT_CATEGORIES,
} from './arkit/index';

export {
  ARKIT_TO_CC4_EXTENDED,
  ARKIT_TO_CC_EXTENDED, // Alias for backward compatibility
} from './arkit/arkitToCC4Extended';

export {
  ARKIT_TO_RPM,
} from './arkit/arkitToRPM';

export {
  ARKIT_TO_ARKIT,
} from './arkit/arkitToArkit';

// Import for internal use in getMapping function
import { 
  ARKIT_TO_CC4_EXTENDED as _ARKIT_TO_CC4_EXTENDED,
  ARKIT_TO_CC_EXTENDED as _ARKIT_TO_CC_EXTENDED,
} from './arkit/arkitToCC4Extended';
import { ARKIT_TO_RPM as _ARKIT_TO_RPM } from './arkit/arkitToRPM';
import { ARKIT_TO_ARKIT as _ARKIT_TO_ARKIT } from './arkit/arkitToArkit';

// ============================================================================
// METAHUMAN MAPPINGS
// ============================================================================

// Combination mapping (correctives)
export {
  METAHUMAN_TO_CC5_MAPPING,
  convertMetaHumanToCC5,
  getMetaHumanChannelNames,
  getCC5ChannelNames,
} from './metahuman/metahumanToCC5';

// Direct mapping (1:1)
export {
  METAHUMAN_TO_CC5_DIRECT_MAPPING,
  convertMetaHumanToCC5Direct,
  getMetaHumanChannelNamesDirect,
  getCC5ChannelNamesDirect,
  isMetaHumanBlendshapeSupported,
  getCC5TargetName,
} from './metahuman/metahumanToCC5Direct';

// Import for internal use in getMapping function
import { METAHUMAN_TO_CC5_MAPPING as _METAHUMAN_TO_CC5_MAPPING } from './metahuman/metahumanToCC5';
import { METAHUMAN_TO_CC5_DIRECT_MAPPING as _METAHUMAN_TO_CC5_DIRECT_MAPPING } from './metahuman/metahumanToCC5Direct';

// ============================================================================
// BONE PRESETS
// ============================================================================

export {
  CC_EXTENDED_BONES,
  CC5_BONES,
  RPM_BONES,
  ARKIT_BONES,
  BONE_PRESETS,
  getBonePreset,
  usesBoneJaw,
  usesBoneTongue,
} from './bones/index';

// ============================================================================
// UTILITIES
// ============================================================================

export {
  createMapping,
  validateMapping,
  mergeMappings,
  filterMappingByCategory,
  invertMapping,
  getMappingStats,
  formatMapping,
} from './utils';

// ============================================================================
// PRESET COLLECTIONS
// ============================================================================

/**
 * Collection of all available ARKit-based mapping presets
 */
export const ARKIT_MAPPING_PRESETS = {
  CC4_EXTENDED: 'ARKIT_TO_CC4_EXTENDED',
  CC_EXTENDED: 'ARKIT_TO_CC_EXTENDED', // Alias
  RPM: 'ARKIT_TO_RPM',
  ARKIT: 'ARKIT_TO_ARKIT',
};

/**
 * Collection of all available MetaHuman-based mapping presets
 */
export const METAHUMAN_MAPPING_PRESETS = {
  CC5: 'METAHUMAN_TO_CC5',
};

/**
 * Get a mapping by preset name
 * 
 * @param {string} presetName - Name of the preset
 * @returns {Object|null} The mapping object or null if not found
 * 
 * @example
 * const mapping = getMapping('ARKIT_TO_CC4_EXTENDED');
 */
export function getMapping(presetName) {
  const mappings = {
    ARKIT_TO_CC4_EXTENDED: _ARKIT_TO_CC4_EXTENDED,
    ARKIT_TO_CC_EXTENDED: _ARKIT_TO_CC_EXTENDED,
    ARKIT_TO_RPM: _ARKIT_TO_RPM,
    ARKIT_TO_ARKIT: _ARKIT_TO_ARKIT,
    METAHUMAN_TO_CC5: _METAHUMAN_TO_CC5_MAPPING,
  };
  
  return mappings[presetName] || null;
}

/**
 * List all available mapping preset names
 * 
 * @returns {string[]} Array of preset names
 */
export function listMappings() {
  return [
    'ARKIT_TO_CC4_EXTENDED',
    'ARKIT_TO_CC_EXTENDED',
    'ARKIT_TO_RPM',
    'ARKIT_TO_ARKIT',
    'METAHUMAN_TO_CC5',
  ];
}

/**
 * Get info about a mapping preset
 * 
 * @param {string} presetName - Name of the preset
 * @returns {Object} Info object with description and metadata
 */
export function getMappingInfo(presetName) {
  const info = {
    'ARKIT_TO_CC4_EXTENDED': {
      name: 'ARKit to Character Creator 4 Extended',
      description: 'Maps ARKit blendshapes to CC4 Extended morph targets',
      sourceFormat: 'ARKit 52',
      targetFormat: 'CC4 Extended',
      bonePreset: 'CC_EXTENDED',
      usesBones: true,
    },
    'ARKIT_TO_CC_EXTENDED': {
      name: 'ARKit to Character Creator Extended (Alias)',
      description: 'Alias for ARKIT_TO_CC4_EXTENDED',
      sourceFormat: 'ARKit 52',
      targetFormat: 'CC Extended',
      bonePreset: 'CC_EXTENDED',
      usesBones: true,
    },
    'ARKIT_TO_RPM': {
      name: 'ARKit to Ready Player Me',
      description: 'Maps ARKit blendshapes to RPM morph targets',
      sourceFormat: 'ARKit 52',
      targetFormat: 'Ready Player Me',
      bonePreset: 'RPM',
      usesBones: false,
    },
    'ARKIT_TO_ARKIT': {
      name: 'ARKit to ARKit (Passthrough)',
      description: 'Direct passthrough mapping for ARKit models',
      sourceFormat: 'ARKit 52',
      targetFormat: 'ARKit 52',
      bonePreset: 'ARKIT',
      usesBones: false,
    },
    'METAHUMAN_TO_CC5': {
      name: 'MetaHuman to Character Creator 5',
      description: 'Complex combination mapping for MetaHuman to CC5',
      sourceFormat: 'MetaHuman Extended',
      targetFormat: 'CC5',
      bonePreset: 'CC5',
      usesBones: true,
    },
  };
  
  return info[presetName] || null;
}
