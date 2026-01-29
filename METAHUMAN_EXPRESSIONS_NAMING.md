# MetaHuman CTRL_expressions Naming Convention

## Your MetaHuman Model Uses This Pattern

Based on the console output, your Mike model uses the `CTRL_expressions_` prefix for all control morphs.

### Eye Gaze Control Morphs

```javascript
// Left Eye
CTRL_expressions_eyeLookUpL       [32]  // Look up
CTRL_expressions_eyeLookDownL     [26]  // Look down  
CTRL_expressions_eyeLookLeftL     [28]  // Look left (outward)
CTRL_expressions_eyeLookRightL    [30]  // Look right (inward)

// Right Eye  
CTRL_expressions_eyeLookUpR       [33]  // Look up
CTRL_expressions_eyeLookDownR     [27]  // Look down
CTRL_expressions_eyeLookLeftR     [29]  // Look left (inward)
CTRL_expressions_eyeLookRightR    [31]  // Look right (outward)
```

## Pattern Breakdown

```
CTRL_expressions_{feature}{Action}{Side}

CTRL_expressions = Prefix (all control morphs)
eye              = Feature (eye control)
Look             = Action type
Up/Down/Left/Right = Direction
L/R              = Side (Left/Right)
```

## Other Eye-Related Morphs Available

Your model also has these eye control morphs:

```javascript
// Blinking
CTRL_expressions_eyeBlinkL        [10]
CTRL_expressions_eyeBlinkR        [11]

// Eyelids
CTRL_expressions_eyeLidPressL     [24]
CTRL_expressions_eyeLidPressR     [25]
CTRL_expressions_eyeLowerLidDownL [34]
CTRL_expressions_eyeLowerLidDownR [35]
CTRL_expressions_eyeLowerLidUpL   [36]
CTRL_expressions_eyeLowerLidUpR   [37]
CTRL_expressions_eyeUpperLidUpL   [47]
CTRL_expressions_eyeUpperLidUpR   [48]

// Eye Shape
CTRL_expressions_eyeWidenL        [49]
CTRL_expressions_eyeWidenR        [50]
CTRL_expressions_eyeRelaxL        [43]
CTRL_expressions_eyeRelaxR        [44]
CTRL_expressions_eyeSquintInnerL  [45]
CTRL_expressions_eyeSquintInnerR  [46]

// Pupils
CTRL_expressions_eyePupilNarrowL  [39]
CTRL_expressions_eyePupilNarrowR  [40]
CTRL_expressions_eyePupilWideL    [41]
CTRL_expressions_eyePupilWideR    [42]

// Cheeks (affects eyes)
CTRL_expressions_eyeCheekRaiseL   [12]
CTRL_expressions_eyeCheekRaiseR   [13]
CTRL_expressions_eyeFaceScrunchL  [14]
CTRL_expressions_eyeFaceScrunchR  [15]

// Special
CTRL_expressions_eyeParallelLookDirection [38]

// Eyelashes
CTRL_expressions_eyelashesDownINL  [16]
CTRL_expressions_eyelashesDownINR  [17]
CTRL_expressions_eyelashesDownOUTL [18]
CTRL_expressions_eyelashesDownOUTR [19]
CTRL_expressions_eyelashesUpINL    [20]
CTRL_expressions_eyelashesUpINR    [21]
CTRL_expressions_eyelashesUpOUTL   [22]
CTRL_expressions_eyelashesUpOUTR   [23]
```

## Updated System Configuration

The `usePupilTracking` hook has been updated to support this naming convention:

```javascript
// Primary: CTRL_expressions pattern (your model)
"CTRL_expressions_eyeLookUpL"

// Alternative: CTRL_L/R pattern (some other MetaHumans)
"CTRL_L_eye_lookUp"

// Legacy: Direct naming
"eyeLookUp_L"

// ARKit: Apple face tracking
"A06_Eye_Look_Up_Left"
```

The system will try all patterns automatically and use whichever is found first.

## Testing

After the update, you should see in console:

```
✓ Camera tracking: Found MetaHuman CTRL eye morphs: 
  [
    "CTRL_expressions_eyeLookDownL",
    "CTRL_expressions_eyeLookDownR",
    "CTRL_expressions_eyeLookLeftL",
    "CTRL_expressions_eyeLookLeftR",
    "CTRL_expressions_eyeLookRightL",
    "CTRL_expressions_eyeLookRightR",
    "CTRL_expressions_eyeLookUpL",
    "CTRL_expressions_eyeLookUpR"
  ]
```

And when you move the camera:

```
🎯 Active Morph Targets (filtered: eye_look)
  CTRL_expressions_eyeLookLeftR   [29]: 0.352
  CTRL_expressions_eyeLookLeftL   [28]: 0.289
  CTRL_expressions_eyeLookUpR     [33]: 0.156
  CTRL_expressions_eyeLookUpL     [32]: 0.143
```

## Usage in Code

```javascript
// Direct access (if needed)
const mesh = scene.getObjectByName('Mesh019');
const dict = mesh.morphTargetDictionary;
const influences = mesh.morphTargetInfluences;

// Set right eye to look up 50%
const index = dict['CTRL_expressions_eyeLookUpR'];
influences[index] = 0.5;

// Or use the hook (recommended - handles everything automatically)
usePupilTracking(faceMeshRef, skeletonRoot, {
  trackCamera: true,
  enabled: true,
  lerpSpeed: 0.15,
});
```

## Summary

✅ Your MetaHuman uses `CTRL_expressions_eyeLook{Direction}{Side}` naming  
✅ The hook has been updated to support this pattern  
✅ System will automatically detect and use the correct naming  
✅ Camera tracking will now work with your specific MetaHuman model  

**Refresh your browser to see the updated system in action!**
