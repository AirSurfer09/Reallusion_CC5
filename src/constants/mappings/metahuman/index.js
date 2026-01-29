/**
 * MetaHuman Blendshape Format Definition
 * 
 * MetaHuman uses a different blendshape system than ARKit. This module provides
 * two different mapping approaches:
 * 
 * 1. **Direct Mapping (metahumanToCC5Direct.js)**
 *    - Simple 1:1 mapping from CTRL_expressions_* to base CC5 blendshapes
 *    - No corrective combinations
 *    - Use for straightforward blendshape passthrough
 * 
 * 2. **Combination Mapping (metahumanToCC5.js)**
 *    - Complex corrective combinations (e.g., C_BlinkL_LookDownL)
 *    - Multiplies multiple source values together
 *    - Use for full MetaHuman facial rig with correctives
 */

// Re-export the MetaHuman to CC5 combination mapping (complex)
export { 
  METAHUMAN_TO_CC5_MAPPING,
  convertMetaHumanToCC5,
  getMetaHumanChannelNames,
  getCC5ChannelNames 
} from './metahumanToCC5';

// Re-export the MetaHuman to CC5 direct mapping (simple 1:1)
export {
  METAHUMAN_TO_CC5_DIRECT_MAPPING,
  convertMetaHumanToCC5Direct,
  getMetaHumanChannelNamesDirect,
  getCC5ChannelNamesDirect,
  isMetaHumanBlendshapeSupported,
  getCC5TargetName
} from './metahumanToCC5Direct';
