/**
 * Mapping Utilities
 * 
 * Utility functions for working with blendshape mappings:
 * - Creating custom mappings
 * - Validating mappings
 * - Merging presets with overrides
 * - Listing available presets
 */

import { ARKIT_BLENDSHAPES } from './arkit/index';

/**
 * Create a custom mapping by merging a preset with overrides
 * 
 * @param {Object} preset - Base mapping preset
 * @param {Object} overrides - Custom mappings to override the preset
 * @returns {Object} Merged mapping object
 * 
 * @example
 * import { ARKIT_TO_CC4_EXTENDED } from './mappings';
 * 
 * const customMapping = createMapping(ARKIT_TO_CC4_EXTENDED, {
 *   'jawOpen': 'My_Custom_Jaw_Open',
 *   'mouthSmileLeft': ['Smile_L_Upper', 'Smile_L_Lower'],
 * });
 */
export function createMapping(preset, overrides = {}) {
  if (!preset) {
    console.warn('[MappingUtils] No preset provided, using overrides only');
    return overrides;
  }
  
  return {
    ...preset,
    ...overrides,
  };
}

/**
 * Validate a mapping against the ARKit blendshape list
 * Checks for missing or extra blendshape mappings
 * 
 * @param {Object} mapping - Mapping object to validate
 * @returns {{ valid: boolean, missing: string[], extra: string[], coverage: number }}
 * 
 * @example
 * const validation = validateMapping(myMapping);
 * if (!validation.valid) {
 *   console.warn('Missing blendshapes:', validation.missing);
 * }
 */
export function validateMapping(mapping) {
  const mappingKeys = Object.keys(mapping);
  
  const missing = ARKIT_BLENDSHAPES.filter(name => !mappingKeys.includes(name));
  const extra = mappingKeys.filter(name => !ARKIT_BLENDSHAPES.includes(name));
  
  const coverage = ((ARKIT_BLENDSHAPES.length - missing.length) / ARKIT_BLENDSHAPES.length) * 100;
  
  return {
    valid: missing.length === 0,
    missing,
    extra,
    coverage: Math.round(coverage),
    totalExpected: ARKIT_BLENDSHAPES.length,
    totalProvided: mappingKeys.length,
  };
}

/**
 * Merge multiple mappings together (later mappings override earlier ones)
 * 
 * @param {...Object} mappings - Mapping objects to merge
 * @returns {Object} Merged mapping
 * 
 * @example
 * const merged = mergeMappings(baseMapping, customOverrides, finalTweaks);
 */
export function mergeMappings(...mappings) {
  return Object.assign({}, ...mappings);
}

/**
 * Filter mapping to only include specific blendshape categories
 * 
 * @param {Object} mapping - Source mapping
 * @param {string[]} categories - Categories to include (e.g., ['mouth', 'jaw'])
 * @returns {Object} Filtered mapping
 * 
 * @example
 * // Only map mouth and jaw blendshapes
 * const mouthOnly = filterMappingByCategory(fullMapping, ['mouth', 'jaw']);
 */
export function filterMappingByCategory(mapping, categories) {
  const { ARKIT_CATEGORIES } = require('./arkit/index');
  
  const allowedBlendshapes = new Set(
    categories.flatMap(cat => ARKIT_CATEGORIES[cat] || [])
  );
  
  return Object.keys(mapping)
    .filter(key => allowedBlendshapes.has(key))
    .reduce((acc, key) => {
      acc[key] = mapping[key];
      return acc;
    }, {});
}

/**
 * Invert a simple 1:1 mapping (swap keys and values)
 * Note: Only works for mappings without array values
 * 
 * @param {Object} mapping - Mapping to invert
 * @returns {Object} Inverted mapping
 */
export function invertMapping(mapping) {
  const inverted = {};
  
  for (const [key, value] of Object.entries(mapping)) {
    if (Array.isArray(value)) {
      console.warn(`[MappingUtils] Cannot invert array mapping for ${key}`);
      continue;
    }
    if (value === null) {
      continue;
    }
    inverted[value] = key;
  }
  
  return inverted;
}

/**
 * Get statistics about a mapping
 * 
 * @param {Object} mapping - Mapping to analyze
 * @returns {Object} Statistics object
 */
export function getMappingStats(mapping) {
  let oneToOne = 0;
  let oneToMany = 0;
  let boneControlled = 0;
  
  for (const value of Object.values(mapping)) {
    if (value === null) {
      boneControlled++;
    } else if (Array.isArray(value)) {
      oneToMany++;
    } else {
      oneToOne++;
    }
  }
  
  return {
    total: Object.keys(mapping).length,
    oneToOne,
    oneToMany,
    boneControlled,
  };
}

/**
 * Create a debug-friendly string representation of a mapping
 * 
 * @param {Object} mapping - Mapping to format
 * @param {number} maxEntries - Maximum entries to show (default: 10)
 * @returns {string} Formatted string
 */
export function formatMapping(mapping, maxEntries = 10) {
  const entries = Object.entries(mapping).slice(0, maxEntries);
  const lines = entries.map(([key, value]) => {
    if (value === null) {
      return `  ${key} → [BONE CONTROLLED]`;
    } else if (Array.isArray(value)) {
      return `  ${key} → [${value.join(', ')}]`;
    } else {
      return `  ${key} → ${value}`;
    }
  });
  
  const hasMore = Object.keys(mapping).length > maxEntries;
  if (hasMore) {
    lines.push(`  ... and ${Object.keys(mapping).length - maxEntries} more`);
  }
  
  return lines.join('\n');
}
