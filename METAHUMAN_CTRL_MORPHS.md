# MetaHuman CTRL Morph Target Reference

## Official MetaHuman Eye Control Blend Shapes

MetaHuman characters use the `CTRL_` prefix convention for all control blend shapes.

### Eye Gaze Controls

#### Left Eye
```
CTRL_L_eye_lookUp      → Look upward (0.0 to 1.0)
CTRL_L_eye_lookDown    → Look downward (0.0 to 1.0)
CTRL_L_eye_lookLeft    → Look left/outward (0.0 to 1.0)
CTRL_L_eye_lookRight   → Look right/inward (0.0 to 1.0)
```

#### Right Eye
```
CTRL_R_eye_lookUp      → Look upward (0.0 to 1.0)
CTRL_R_eye_lookDown    → Look downward (0.0 to 1.0)
CTRL_R_eye_lookLeft    → Look left/inward (0.0 to 1.0)
CTRL_R_eye_lookRight   → Look right/outward (0.0 to 1.0)
```

## Fallback Hierarchy

The system tries morph targets in this order:

1. **MetaHuman CTRL names** (e.g., `CTRL_R_eye_lookUp`)
2. **Legacy names** (e.g., `eyeLookUp_R`)
3. **ARKit names** (e.g., `A07_Eye_Look_Up_Right`)

This ensures compatibility across different character rigs.

## Common MetaHuman CTRL Morphs

Here are other common MetaHuman control blend shapes you might use:

### Eyelids
```
CTRL_L_eye_blink       → Blink left eye
CTRL_R_eye_blink       → Blink right eye
CTRL_L_eye_blinkLid    → Blink left eyelid
CTRL_R_eye_blinkLid    → Blink right eyelid
CTRL_L_eye_closeLid    → Close left upper eyelid
CTRL_R_eye_closeLid    → Close right upper eyelid
```

### Eyebrows
```
CTRL_L_brow_down       → Lower left brow
CTRL_R_brow_down       → Lower right brow
CTRL_L_brow_lateral    → Move left brow outward
CTRL_R_brow_lateral    → Move right brow outward
CTRL_L_brow_raiseIn    → Raise inner left brow
CTRL_R_brow_raiseIn    → Raise inner right brow
CTRL_L_brow_raiseOut   → Raise outer left brow
CTRL_R_brow_raiseOut   → Raise outer right brow
```

### Mouth
```
CTRL_L_mouth_cornerPull → Smile left
CTRL_R_mouth_cornerPull → Smile right
CTRL_L_mouth_stretch    → Stretch left mouth corner
CTRL_R_mouth_stretch    → Stretch right mouth corner
CTRL_L_mouth_dimple     → Dimple left
CTRL_R_mouth_dimple     → Dimple right
CTRL_mouth_lipsPurse    → Purse lips
CTRL_mouth_funnel       → Funnel mouth shape
```

### Jaw
```
CTRL_C_jaw_fwdBack     → Move jaw forward/back
CTRL_C_jaw_openExtreme → Open jaw (extreme)
CTRL_L_jaw_clench      → Clench left jaw
CTRL_R_jaw_clench      → Clench right jaw
```

### Nose
```
CTRL_L_nose_wrinkle    → Wrinkle left nostril
CTRL_R_nose_wrinkle    → Wrinkle right nostril
```

### Cheeks
```
CTRL_L_cheek_raise     → Raise left cheek
CTRL_R_cheek_raise     → Raise right cheek
CTRL_L_cheek_suckBlow  → Suck/blow left cheek
CTRL_R_cheek_suckBlow  → Suck/blow right cheek
```

## Naming Convention Pattern

```
CTRL_{Side}_{Region}_{Action}

Side:
  - L = Left
  - R = Right
  - C = Center

Region:
  - eye, brow, mouth, jaw, nose, cheek, etc.

Action:
  - lookUp, lookDown, lookLeft, lookRight
  - blink, close, raise, down
  - etc.
```

## Usage in Code

```javascript
// Access morph targets
const mesh = scene.getObjectByName('FaceMesh');
const dict = mesh.morphTargetDictionary;
const influences = mesh.morphTargetInfluences;

// Set a morph target
const index = dict['CTRL_R_eye_lookUp'];
if (index !== undefined) {
  influences[index] = 0.5; // 50% look up
}

// Lerp for smooth transitions
const current = influences[index];
influences[index] = current + (targetValue - current) * lerpSpeed;
```

## Debugging: List All Available Morphs

Add this to your component to see all available morph targets:

```javascript
React.useEffect(() => {
  if (meshRef.current) {
    const dict = meshRef.current.morphTargetDictionary;
    console.log('Available morph targets:');
    Object.keys(dict).sort().forEach(name => {
      console.log(`  ${name}: ${dict[name]}`);
    });
  }
}, []);
```

## Notes

- All CTRL morphs use a 0.0 to 1.0 range
- Some morphs may have negative values for opposite directions
- Always check if a morph exists before setting it (index !== undefined)
- Use lerping for smooth, natural transitions
- The system automatically tries multiple naming conventions for maximum compatibility

---

**The updated `usePupilTracking` hook now uses the official MetaHuman CTRL naming convention by default!**
