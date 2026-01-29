# Camera-Based Eye Tracking for MetaHuman

This document explains the new camera-based eye tracking system that mimics Unreal Engine's MetaHuman pupil tracking.

## Overview

The updated `usePupilTracking` hook now implements a camera tracking system similar to Unreal Engine's Blueprint system. Instead of relying solely on bone rotations, it calculates eye rotations and maps them to morph targets (blend shapes) for more natural and accurate eye movement.

## How It Works

### The Unreal Engine Approach

The system mimics this Blueprint node flow from Unreal Engine:

1. **Get Socket Locations**: Get positions of eye bones and head
2. **Calculate Look-At Rotation**: Find the rotation needed for each eye to look at the target
3. **Transform to Local Space**: Convert world rotation to head-local space
4. **Apply Rotation Offsets**: Compensate for bone orientation differences
5. **Extract Rotation Components**: Break rotation into pitch (vertical) and yaw (horizontal)
6. **Map to Morph Targets**: Convert rotation angles to 0-1 blend shape values
7. **Apply Blend Shapes**: Set the eye direction morph targets

### Key Features

- **Camera Tracking by Default**: Eyes automatically follow the camera position
- **MetaHuman Morph Targets**: Direct support for MetaHuman blend shapes (`eyeLookUp_L`, `eyeLookRight_R`, etc.)
- **ARKit Compatibility**: Falls back to ARKit blend shapes if MetaHuman ones aren't available
- **Calibration System**: Uses empirically derived angle ranges from Unreal Engine
- **Per-Eye Convergence**: Each eye calculates its own look-at direction for natural convergence

## Usage

### Basic Setup

```jsx
import { usePupilTracking } from './hooks/usePupilTracking';

function MyCharacter() {
  const meshRef = useRef();
  const skeletonRoot = nodes.root; // Your skeleton root bone
  
  usePupilTracking(meshRef, skeletonRoot, {
    trackCamera: true,  // Enable camera tracking (default)
    enabled: true,
    lerpSpeed: 0.2,     // Smoothing factor
  });
  
  return (
    <skinnedMesh ref={meshRef} />
  );
}
```

### Configuration Options

```javascript
{
  maxHorizontalAngle: Math.PI / 6,  // 30 degrees - max eye movement
  maxVerticalAngle: Math.PI / 8,    // 22.5 degrees - max vertical movement
  lerpSpeed: 0.2,                    // Smoothing speed (0-1)
  verticalOffset: -0.15,             // Vertical bias (not used in camera mode)
  enabled: true,                     // Enable/disable tracking
  trackCamera: true,                 // Use camera tracking mode
  
  boneNames: {
    head: "CC_Base_Head",
    leftEye: "CC_Base_L_Eye",
    rightEye: "CC_Base_R_Eye",
  },
  
  // Calibration ranges from Unreal Engine (in degrees)
  calibration: {
    rightEye: {
      lookRightMax: 42.165333,
      lookLeftMax: -37.557323,
      lookUpMax: 29.953882,
      lookDownMax: -39.954983,
    },
    leftEye: {
      lookRightMax: 42.165333,
      lookLeftMax: -37.557323,
      lookUpMax: 29.953882,
      lookDownMax: -39.954983,
    }
  }
}
```

### Custom Target

You can set a custom target instead of the camera:

```javascript
const { setTarget } = usePupilTracking(meshRef, skeletonRoot);

// Look at a specific point
setTarget(new THREE.Vector3(0, 1.5, 2));

// Reset to camera tracking
setTarget(null);
```

## Morph Target Mapping

### MetaHuman Blend Shapes (Primary - CTRL_expressions Convention)

The system uses the MetaHuman CTRL blend shape naming convention. Most MetaHumans use the `CTRL_expressions_` prefix:

- **Left Eye**:
  - `CTRL_expressions_eyeLookUpL` - Look up
  - `CTRL_expressions_eyeLookDownL` - Look down
  - `CTRL_expressions_eyeLookLeftL` - Look left (outward for left eye)
  - `CTRL_expressions_eyeLookRightL` - Look right (inward for left eye)

- **Right Eye**:
  - `CTRL_expressions_eyeLookUpR` - Look up
  - `CTRL_expressions_eyeLookDownR` - Look down
  - `CTRL_expressions_eyeLookLeftR` - Look left (inward for right eye)
  - `CTRL_expressions_eyeLookRightR` - Look right (outward for right eye)

### Alternative CTRL Naming

Some MetaHumans may use this alternate CTRL naming:
- `CTRL_L_eye_lookUp`, `CTRL_L_eye_lookDown`, `CTRL_L_eye_lookLeft`, `CTRL_L_eye_lookRight`
- `CTRL_R_eye_lookUp`, `CTRL_R_eye_lookDown`, `CTRL_R_eye_lookLeft`, `CTRL_R_eye_lookRight`

### Legacy Blend Shapes (Fallback)

If CTRL names aren't found, it tries these legacy names:

- `eyeLookUp_L`, `eyeLookDown_L`, `eyeLookLeft_L`, `eyeLookRight_L`
- `eyeLookUp_R`, `eyeLookDown_R`, `eyeLookLeft_R`, `eyeLookRight_R`

### ARKit Blend Shapes (Fallback)

If MetaHuman blend shapes aren't found, it falls back to ARKit names:

- `A06_Eye_Look_Up_Left`, `A07_Eye_Look_Up_Right`
- `A08_Eye_Look_Down_Left`, `A09_Eye_Look_Down_Right`
- `A10_Eye_Look_Out_Left`, `A13_Eye_Look_Out_Right`
- `A11_Eye_Look_In_Left`, `A12_Eye_Look_In_Right`

## Technical Details

### Calibration System

The calibration values define the angle ranges for each direction:

- **Look Right**: 0° to 42.165° maps to 0.0 to 1.0
- **Look Left**: 0° to -37.557° maps to 0.0 to 1.0
- **Look Up**: 0° to 29.954° maps to 0.0 to 1.0
- **Look Down**: 0° to -39.955° maps to 0.0 to 1.0

These values were empirically derived from the Unreal Engine MetaHuman rig and ensure the eyes move within natural limits.

### Rotation Transformation Pipeline

1. **World Space Look-At**: Calculate rotation from eye position to target
2. **Head-Local Space**: Transform to head's local coordinate system
3. **Orientation Compensation**: Apply [0°, 90°, 90°] and [0°, 180°, 0°] offsets
4. **Extract Components**: Get yaw (horizontal) and pitch (vertical) in degrees
5. **Map Range**: Convert angle to 0-1 blend shape value using calibration

### Advantages Over Bone Rotation

- **More Natural**: Morph targets deform the eye mesh naturally
- **No Gimbal Lock**: Avoids rotation order issues
- **Better Convergence**: Each eye calculated independently
- **Matches Unreal**: Same system as Unreal Engine MetaHuman

## Comparison: Old vs New

### Old System (Bone Rotation)

- Rotated eye bones directly
- Simple angle calculation
- Could have gimbal lock issues
- Good for simple characters

### New System (Camera Tracking + Morph Targets)

- Uses morph targets primarily
- Matches Unreal Engine's approach
- Per-eye convergence calculation
- Calibrated angle ranges
- More natural eye deformation
- Better for MetaHuman models

## Debugging

The hook returns a `gazeDirection` ref with debug info:

```javascript
const { gazeDirection } = usePupilTracking(meshRef, skeletonRoot);

useFrame(() => {
  console.log('Left eye:', gazeDirection.current.left);
  console.log('Right eye:', gazeDirection.current.right);
  console.log('Average:', {
    h: gazeDirection.current.horizontal,
    v: gazeDirection.current.vertical
  });
});
```

## Notes

- The system requires a head bone to be present
- Eye bones are used for positioning; if not available, estimates from head position
- Morph targets are applied with lerping for smooth transitions
- The old bone rotation system is still available by setting `trackCamera: false`

## Future Enhancements

Possible improvements:

1. **Blink Integration**: Coordinate eye tracking with blink animations
2. **Saccadic Motion**: Add quick, jerky movements for realism
3. **Gaze Duration**: Random gaze shifts instead of constant tracking
4. **Focus Distance**: Adjust convergence based on target distance
5. **Upper Eyelid Compensation**: Move eyelids when looking up/down
