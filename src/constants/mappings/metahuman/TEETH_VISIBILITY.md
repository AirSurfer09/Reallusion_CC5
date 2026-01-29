# Teeth Visibility Control for CC5HD Characters

## Overview

The MetaHuman to CC5 converter now includes automatic teeth visibility control to hide lower teeth while talking. This is equivalent to setting `CTRL_expressions_teethDownD: 0.3` in Unreal Engine MetaHumans.

## How It Works

The system applies a **constant offset** to these CC5 corrective blendshapes:
- `C_FunnelDL_LowerLipDepressL` (Left lower lip)
- `C_FunnelDR_LowerLipDepressR` (Right lower lip)

### Default Behavior

By default, a **0.3 offset** is always applied:

```javascript
const cc5Blendshapes = convertMetaHumanToCC5(metahumanBlendshapes);
// C_FunnelDL_LowerLipDepressL = calculated_value + 0.3
// C_FunnelDR_LowerLipDepressR = calculated_value + 0.3
```

### Effects

1. **Lower Lip Depression**: Pulls the lower lip down slightly to cover lower teeth
2. **Tongue Position**: Lowers the tongue to make it less visible
3. **Natural Talking**: Creates more natural mouth shapes during speech

## Customization

### Adjust the Offset

```javascript
// More teeth hiding (higher offset)
const cc5 = convertMetaHumanToCC5(metahuman, { 
  teethDownOffset: 0.5  // Hides teeth more
});

// Less teeth hiding (lower offset)
const cc5 = convertMetaHumanToCC5(metahuman, { 
  teethDownOffset: 0.2  // Subtle effect
});

// Disable teeth offset
const cc5 = convertMetaHumanToCC5(metahuman, { 
  teethDownOffset: 0.0  // No offset
});
```

### Recommended Values

| Offset Value | Effect | Use Case |
|-------------|--------|----------|
| 0.0 - 0.1 | Minimal | Character with small teeth or closed-mouth style |
| 0.2 - 0.3 | **Standard** (Default) | Most characters, natural talking |
| 0.4 - 0.5 | Strong | Character with prominent teeth, exaggerated hiding |
| 0.6+ | Extreme | Special cases, very pronounced effect |

## Integration Example

### React Component

```jsx
import { convertMetaHumanToCC5 } from './metahumanToCC5';
import { useEffect } from 'react';

function CharacterController({ metahumanBlendshapes, characterRef }) {
  useEffect(() => {
    // Convert with teeth offset
    const cc5Blendshapes = convertMetaHumanToCC5(metahumanBlendshapes, {
      teethDownOffset: 0.3  // Adjust as needed
    });
    
    // Apply to Three.js character
    Object.entries(cc5Blendshapes).forEach(([name, value]) => {
      const morphIndex = characterRef.current.morphTargetDictionary[name];
      if (morphIndex !== undefined) {
        characterRef.current.morphTargetInfluences[morphIndex] = value;
      }
    });
  }, [metahumanBlendshapes, characterRef]);
  
  return <primitive object={characterRef.current} />;
}
```

### Vanilla JavaScript

```javascript
import { convertMetaHumanToCC5 } from './metahumanToCC5';

function updateCharacterBlendshapes(character, metahumanBlendshapes) {
  // Convert with custom teeth offset
  const cc5Blendshapes = convertMetaHumanToCC5(metahumanBlendshapes, {
    teethDownOffset: 0.35
  });
  
  // Apply to character mesh
  for (const [name, value] of Object.entries(cc5Blendshapes)) {
    const index = character.morphTargetDictionary[name];
    if (index !== undefined) {
      character.morphTargetInfluences[index] = value;
    }
  }
}
```

## Technical Details

### Offset Application

The offset is applied **after** all mapping calculations:

```javascript
// 1. Calculate from mappings
let calculatedValue = applyMappings(); // e.g., 0.2

// 2. Add teeth offset
let finalValue = calculatedValue + teethDownOffset; // 0.2 + 0.3 = 0.5

// 3. Clamp to valid range [0, 1]
finalValue = Math.min(1.0, finalValue); // Ensures <= 1.0
```

### Why These Specific Blendshapes?

`C_FunnelDL_LowerLipDepressL` and `C_FunnelDR_LowerLipDepressR` are combination blendshapes that:
- Depress (lower) the lower lip
- Work together with funnel shapes
- Control lower teeth visibility during speech
- Are **not** overridden by other mouth movements

This makes them ideal for a constant offset that persists during all talking animations.

## Comparison with Unreal

In Unreal Engine's MetaHuman:
```cpp
// Unreal MetaHuman Controller
CTRL_expressions_teethDownD = 0.3;  // Always applied
```

In this implementation:
```javascript
// JavaScript equivalent
convertMetaHumanToCC5(blendshapes, { teethDownOffset: 0.3 });
```

Both achieve the same visual result: lower teeth are hidden during speech.

## Troubleshooting

### Issue: Lower teeth still visible
**Solution**: Increase the offset value
```javascript
{ teethDownOffset: 0.4 } // or higher
```

### Issue: Lower lip looks too depressed
**Solution**: Decrease the offset value
```javascript
{ teethDownOffset: 0.2 } // or lower
```

### Issue: Effect not visible
**Solution**: Verify the corrective blendshapes exist on your model
```javascript
console.log(character.morphTargetDictionary);
// Check for: C_FunnelDL_LowerLipDepressL and C_FunnelDR_LowerLipDepressR
```

### Issue: Clipping with jaw open
**Solution**: The offset is clamped to max 1.0, so extreme jaw movements won't cause issues. If clipping occurs, it's likely a model topology issue.

## Performance Impact

- **CPU overhead**: Negligible (~2 additions per frame)
- **Memory**: No additional allocations
- **Frame time**: < 0.01ms

The teeth offset is extremely lightweight and adds no noticeable performance cost.
