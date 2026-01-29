# Blendshape Mappings

A modular and reusable system for mapping facial blendshapes from different source formats to different target formats.

## 📁 Directory Structure

```
mappings/
├── arkit/                      - ARKit-based mappings
│   ├── index.js               - ARKit source format definition
│   ├── arkitToCC4Extended.js  - ARKit → Character Creator 4
│   ├── arkitToRPM.js          - ARKit → Ready Player Me
│   └── arkitToArkit.js        - ARKit → ARKit (passthrough)
├── metahuman/                 - MetaHuman-based mappings
│   ├── index.js               - MetaHuman format definition
│   └── metahumanToCC5.js      - MetaHuman → Character Creator 5
├── bones/                     - Bone configuration presets
│   └── index.js               - Bone naming conventions for different rigs
├── utils.js                   - Mapping utility functions
└── index.js                   - Main exports and preset collections
```

## 🚀 Quick Start

### Import a Mapping

```javascript
// New modular approach (recommended)
import { ARKIT_TO_CC4_EXTENDED } from './constants/mappings';

// Or import from the main constants
import { ARKIT_TO_CC4_EXTENDED } from './constants';
```

### Use in Component

```javascript
import { useArkitLipsync } from '../../hooks/useArkitLipsync';
import { ARKIT_TO_CC4_EXTENDED } from '../../constants/mappings';

const MyCharacter = ({ convaiClient, characterRef }) => {
  useArkitLipsync({
    convaiClient,
    characterRef,
    scene,
    mapping: ARKIT_TO_CC4_EXTENDED,
  });
  
  // ... rest of component
};
```

### Create Custom Mapping

```javascript
import { ARKIT_TO_CC4_EXTENDED, createMapping } from './constants/mappings';

const customMapping = createMapping(ARKIT_TO_CC4_EXTENDED, {
  // Override specific blendshapes
  'mouthSmileLeft': 'My_Custom_Smile_L',
  'mouthSmileRight': 'My_Custom_Smile_R',
  
  // Map one-to-many
  'browInnerUp': ['Brow_Inner_L', 'Brow_Inner_R', 'Forehead_Raise'],
});
```

## 📚 Available Mappings

### ARKit-Based Mappings

| Mapping | Source | Target | Use Case |
|---------|--------|--------|----------|
| `ARKIT_TO_CC4_EXTENDED` | ARKit 52 | Character Creator 4 Extended | CC4+ models with extended morph sets |
| `ARKIT_TO_RPM` | ARKit 52 | Ready Player Me | RPM avatars |
| `ARKIT_TO_ARKIT` | ARKit 52 | ARKit 52 | Models already using ARKit names |

### MetaHuman-Based Mappings

| Mapping | Source | Target | Use Case |
|---------|--------|--------|----------|
| `METAHUMAN_TO_CC5` | MetaHuman Extended | Character Creator 5 | Complex combination mapping |

## 🔧 Utilities

### Validate Mapping

```javascript
import { validateMapping } from './constants/mappings';

const validation = validateMapping(myMapping);
console.log(`Coverage: ${validation.coverage}%`);
console.log('Missing blendshapes:', validation.missing);
```

### Merge Mappings

```javascript
import { mergeMappings } from './constants/mappings';

const merged = mergeMappings(
  baseMapping,
  customOverrides,
  finalTweaks
);
```

### Filter by Category

```javascript
import { filterMappingByCategory } from './constants/mappings';

// Only map mouth and jaw
const mouthOnly = filterMappingByCategory(fullMapping, ['mouth', 'jaw']);
```

### Get Mapping Stats

```javascript
import { getMappingStats } from './constants/mappings';

const stats = getMappingStats(myMapping);
console.log(`One-to-one: ${stats.oneToOne}`);
console.log(`One-to-many: ${stats.oneToMany}`);
console.log(`Bone controlled: ${stats.boneControlled}`);
```

## 🎨 Creating New Mappings

### 1. Create Mapping File

Create a new file in `mappings/arkit/` or `mappings/metahuman/`:

```javascript
// mappings/arkit/arkitToMyTarget.js

/**
 * ARKit to My Custom Target Mapping
 * Description of your target format
 */

export const ARKIT_TO_MY_TARGET = {
  // Eyes
  "eyeBlinkLeft": "MyTarget_Eye_Blink_L",
  "eyeBlinkRight": "MyTarget_Eye_Blink_R",
  
  // Jaw (bone-controlled)
  "jawOpen": null, // Uses MyTarget_Jaw_Bone
  
  // Mouth (one-to-many)
  "mouthFunnel": [
    "MyTarget_Mouth_Funnel_Upper",
    "MyTarget_Mouth_Funnel_Lower"
  ],
  
  // ... map all 52 ARKit blendshapes
};
```

### 2. Add Bone Configuration

Add to `mappings/bones/index.js`:

```javascript
export const MY_TARGET_BONES = {
  JAW: "MyTarget_Jaw_Bone",
  TONGUE_01: "MyTarget_Tongue_01",
  TONGUE_02: "MyTarget_Tongue_02",
  HEAD: "MyTarget_Head",
  NECK: "MyTarget_Neck",
};

// Add to BONE_PRESETS
export const BONE_PRESETS = {
  // ... existing presets
  MY_TARGET: MY_TARGET_BONES,
};
```

### 3. Export from Index

Add to `mappings/index.js`:

```javascript
export {
  ARKIT_TO_MY_TARGET,
} from './arkit/arkitToMyTarget';
```

### 4. Use Your Mapping

```javascript
import { ARKIT_TO_MY_TARGET } from './constants/mappings';

useArkitLipsync({
  convaiClient,
  characterRef,
  scene,
  mapping: ARKIT_TO_MY_TARGET,
  bonePreset: 'MY_TARGET',
});
```

## 📖 Mapping Format Guide

### Simple One-to-One

```javascript
"eyeBlinkLeft": "Target_Eye_Blink_L"
```

### One-to-Many (Array)

```javascript
"browInnerUp": ["Target_Brow_L", "Target_Brow_R"]
```
The same value is applied to all targets.

### Bone-Controlled

```javascript
"jawOpen": null
```
Set to `null` when controlled by bone rotation instead of morph target.

## 🔍 ARKit Source Format

The incoming data is a 52-element array in this order:

```javascript
[
  eyeBlinkLeft,        // 0
  eyeLookDownLeft,     // 1
  eyeLookInLeft,       // 2
  // ... 49 more
  tongueOut,           // 51
]
```

See `mappings/arkit/index.js` for the complete list and categories.

## 🦴 Bone Presets

Bone presets define which bones control jaw and tongue movements:

- **CC_EXTENDED** / **CC5**: Character Creator models
- **RPM**: Ready Player Me avatars
- **ARKIT**: ARKit models (typically morph-only)

```javascript
import { getBonePreset } from './constants/mappings';

const bones = getBonePreset('CC_EXTENDED');
// {
//   JAW: "CC_Base_JawRoot",
//   TONGUE_01: "CC_Base_Tongue01",
//   TONGUE_02: "CC_Base_Tongue02",
//   HEAD: "CC_Base_Head",
//   NECK: "CC_Base_NeckTwist01"
// }
```

## 🔄 Backward Compatibility

Old imports still work:

```javascript
// Still works (uses backward compatibility layer)
import { ARKIT_TO_CC_EXTENDED } from './constants/blendshapeMappingPresets';
import { PRESETS } from './constants/blendshapeMappingPresets';
```

But new code should use:

```javascript
// Recommended
import { ARKIT_TO_CC4_EXTENDED } from './constants/mappings';
```

## 📝 Best Practices

1. **Always validate** new mappings using `validateMapping()`
2. **Use descriptive names** for custom mappings
3. **Document** one-to-many mappings and why they're needed
4. **Test thoroughly** with actual character models
5. **Keep mappings focused** - one file per target format
6. **Use categories** to group related blendshapes

## 🐛 Debugging

### Check Coverage

```javascript
const validation = validateMapping(myMapping);
if (validation.coverage < 100) {
  console.warn('Incomplete mapping!', validation.missing);
}
```

### View Stats

```javascript
const stats = getMappingStats(myMapping);
console.log(stats);
// { total: 52, oneToOne: 45, oneToMany: 5, boneControlled: 2 }
```

### Format for Logging

```javascript
import { formatMapping } from './constants/mappings';
console.log(formatMapping(myMapping, 20));
```

## 🎯 Examples

See the `examples/` directory for complete usage examples with different character types.
