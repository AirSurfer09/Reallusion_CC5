# MetaHuman to CC5 Mapping Guide

This directory contains two different approaches for mapping MetaHuman blendshapes to CC5 format.

## Two Mapping Approaches

### 1. Direct Mapping (`metahumanToCC5Direct.js`)

**What it is:** Simple 1:1 mapping from MetaHuman `CTRL_expressions_*` to base CC5 blendshapes.

**Use when:**
- You want straightforward blendshape passthrough
- Your CC5 character model doesn't have corrective blendshapes
- You're working with a simple facial rig
- You want predictable, direct control

**Example:**
```javascript
import { convertMetaHumanToCC5Direct } from './constants/mappings/metahuman';

const metahumanData = {
  "CTRL_expressions_eyeBlinkL": 0.8,
  "CTRL_expressions_jawOpen": 0.5
};

const cc5Data = convertMetaHumanToCC5Direct(metahumanData);
// Result: {
//   "Eye_Blink_L": 0.8,
//   "Jaw_Open": 0.5
// }
```

**Characteristics:**
- ✅ Simple and fast
- ✅ One input → one output
- ✅ Easy to debug
- ❌ No corrective blendshapes
- ❌ May look less realistic on complex characters

---

### 2. Combination Mapping (`metahumanToCC5.js`)

**What it is:** Complex mapping that creates corrective combinations by multiplying multiple source blendshapes together.

**Use when:**
- Your CC5 character has corrective blendshapes (e.g., `C_BlinkL_LookDownL`)
- You want high-fidelity facial animation
- You're working with a professional MetaHuman-style rig
- You need realistic combinations (e.g., blink + look down = special corrective shape)

**Example:**
```javascript
import { convertMetaHumanToCC5 } from './constants/mappings/metahuman';

const metahumanData = {
  "CTRL_expressions_eyeBlinkL": 0.8,
  "CTRL_expressions_eyeLookDownL": 0.5,
  "CTRL_expressions_jawOpen": 0.3
};

const cc5Data = convertMetaHumanToCC5(metahumanData);
// Result: {
//   "C_BlinkL": 0.8,                    // Direct pass-through
//   "C_BlinkL_LookDownL": 0.4,          // 0.8 × 0.5 = 0.4 (combination!)
//   "C_JawOpen": 0.3,
//   ... (120+ total blendshapes)
// }
```

**Characteristics:**
- ✅ High-fidelity animation
- ✅ Realistic corrective shapes
- ✅ Matches professional MetaHuman rigs
- ❌ More complex
- ❌ Slightly slower (120+ calculations)
- ❌ Requires corrective blendshapes on your model

---

## Quick Comparison

| Feature | Direct Mapping | Combination Mapping |
|---------|---------------|---------------------|
| **Complexity** | Simple | Complex |
| **Speed** | Fast (~210 direct assignments) | Slower (~120 multiplications) |
| **Output Count** | ~210 blendshapes | ~120 blendshapes |
| **Correctives** | No | Yes |
| **Best For** | Simple rigs | MetaHuman-style rigs |
| **Formula** | `value = source` | `value = source1 × source2 × ...` |

---

## How to Choose

### Use Direct Mapping if:
- ❓ Your model has `Eye_Blink_L` but NOT `C_BlinkL_LookDownL`
- ❓ You're prototyping or testing
- ❓ You want simplicity over fidelity
- ❓ Your character is stylized/cartoon-like

### Use Combination Mapping if:
- ❓ Your model has corrective blendshapes (names like `C_*_*_*`)
- ❓ You're working with a MetaHuman or similar professional rig
- ❓ You need realistic facial deformations
- ❓ You want combinations like "blink while looking down"

---

## Code Examples

### Example 1: Direct Mapping in Animation Loop

```javascript
import { convertMetaHumanToCC5Direct } from './constants/mappings/metahuman';

function updateFacialAnimation(metahumanBlendshapes, mesh) {
  // Convert to CC5 format
  const cc5Values = convertMetaHumanToCC5Direct(metahumanBlendshapes);
  
  // Apply to mesh
  for (const [shapeName, value] of Object.entries(cc5Values)) {
    const morphIndex = mesh.morphTargetDictionary[shapeName];
    if (morphIndex !== undefined) {
      mesh.morphTargetInfluences[morphIndex] = value;
    }
  }
}
```

### Example 2: Combination Mapping in Animation Loop

```javascript
import { convertMetaHumanToCC5 } from './constants/mappings/metahuman';

function updateFacialAnimation(metahumanBlendshapes, mesh) {
  // Convert to CC5 format with correctives
  const cc5Values = convertMetaHumanToCC5(metahumanBlendshapes);
  
  // Apply to mesh
  for (const [shapeName, value] of Object.entries(cc5Values)) {
    const morphIndex = mesh.morphTargetDictionary[shapeName];
    if (morphIndex !== undefined) {
      mesh.morphTargetInfluences[morphIndex] = value;
    }
  }
}
```

### Example 3: Checking if a Blendshape is Supported

```javascript
import { 
  isMetaHumanBlendshapeSupported,
  getCC5TargetName 
} from './constants/mappings/metahuman';

const metahumanName = "CTRL_expressions_eyeBlinkL";

if (isMetaHumanBlendshapeSupported(metahumanName)) {
  const cc5Name = getCC5TargetName(metahumanName);
  console.log(`${metahumanName} → ${cc5Name}`);
  // Output: "CTRL_expressions_eyeBlinkL → Eye_Blink_L"
}
```

---

## Architecture Notes

### Direct Mapping Architecture
```
MetaHuman Data → Direct Lookup → CC5 Blendshapes
                 (O(1) lookup)
```

### Combination Mapping Architecture
```
MetaHuman Data → Multiply Sources → CC5 Correctives
                 (O(n) multiplication)
```

---

## Related Files

- **`metahumanToCC5Direct.js`** - Simple 1:1 mapping (210 entries)
- **`metahumanToCC5.js`** - Complex combination mapping (120 entries with "Add" and "Limit" modes)
- **`index.js`** - Re-exports both approaches

---

## Need Help?

If you're unsure which mapping to use:

1. **Inspect your 3D model** - Check if it has blendshapes with names like:
   - `Eye_Blink_L` = Use Direct Mapping
   - `C_BlinkL_LookDownL` = Use Combination Mapping

2. **Start simple** - Try Direct Mapping first, then upgrade to Combination if needed

3. **Check the logs** - If you see warnings about missing morph targets, you might be using the wrong mapping
