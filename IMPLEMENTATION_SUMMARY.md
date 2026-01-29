# Implementation Summary: Camera-Based Eye Tracking

## What Was Implemented

I've successfully implemented a camera-based eye tracking system for your MetaHuman characters that mimics the Unreal Engine Blueprint system you provided. The implementation uses **MetaHuman CTRL morph targets** (blend shapes with `CTRL_` prefix) instead of just bone rotations for more natural eye movement.

### Key Features

✅ **MetaHuman CTRL Naming**: Uses official `CTRL_L_eye_*` and `CTRL_R_eye_*` morph targets  
✅ **Unreal Engine Algorithm**: Same calculation pipeline as Unreal's MetaHuman system  
✅ **Camera Tracking**: Eyes automatically follow camera position  
✅ **Calibrated Ranges**: Uses empirically derived angle limits from Unreal  
✅ **Fallback Support**: Works with legacy and ARKit naming conventions  
✅ **Per-Eye Convergence**: Independent calculation for natural eye crossing

## Files Modified

### 1. **src/hooks/usePupilTracking.js** (Complete Rewrite)

**Key Changes:**
- Added `trackCamera` config option (enabled by default)
- Implemented Unreal Engine's eye tracking algorithm:
  - GetSocketLocation for eye and head positions
  - FindLookAtRotation to calculate rotation towards target
  - InverseTransformRotation to convert to local space
  - ComposeRotators to apply orientation offsets
  - BreakRotator to extract pitch/yaw components
  - MapRangeClamped to convert angles to 0-1 morph target values
  
- Added calibration system with Unreal Engine's angle ranges:
  ```javascript
  lookRightMax: 42.165333°
  lookLeftMax: -37.557323°
  lookUpMax: 29.953882°
  lookDownMax: -39.954983°
  ```

- Added MetaHuman CTRL blend shape support (primary):
  - `CTRL_L_eye_lookUp`, `CTRL_L_eye_lookDown`, `CTRL_L_eye_lookLeft`, `CTRL_L_eye_lookRight`
  - `CTRL_R_eye_lookUp`, `CTRL_R_eye_lookDown`, `CTRL_R_eye_lookLeft`, `CTRL_R_eye_lookRight`
  
- Added legacy blend shape fallbacks:
  - `eyeLookUp_L`, `eyeLookDown_L`, `eyeLookLeft_L`, `eyeLookRight_L`
  - `eyeLookUp_R`, `eyeLookDown_R`, `eyeLookLeft_R`, `eyeLookRight_R`
  
- Maintained backward compatibility with ARKit blend shapes

- Kept old bone rotation system (disabled when `trackCamera: true`)

### 2. **src/components/characters/Mike.jsx**

**Added:**
- Import for `usePupilTracking` hook
- `faceMeshRef` for the face mesh with morph targets
- Camera tracking setup with MetaHuman bone names:
  ```javascript
  usePupilTracking(faceMeshRef, skeletonRoot, {
    trackCamera: true,
    enabled: true,
    lerpSpeed: 0.15,
    boneNames: {
      head: "FACIAL_C_FacialRoot",
      leftEye: "FACIAL_L_Eye",
      rightEye: "FACIAL_R_Eye",
    },
  });
  ```
- Ref assignment to face mesh (`Mesh019`)
- Sync with external `meshRefProp`

## New Files Created

### 3. **CAMERA_TRACKING.md**
Comprehensive documentation covering:
- How the system works
- Unreal Engine Blueprint comparison
- Configuration options
- Morph target mapping
- Technical details about calibration
- Usage examples
- Debugging tips

### 4. **PUPIL_TRACKING_EXAMPLES.jsx**
Six complete examples demonstrating:
1. Basic camera tracking
2. Custom target tracking
3. Animated target following
4. Toggle between camera and custom target
5. Custom calibration
6. Old bone rotation system (fallback)

## How It Works

### The Pipeline

```
Camera Position
    ↓
Calculate Look-At Rotation (per eye)
    ↓
Transform to Head-Local Space
    ↓
Apply Orientation Offsets [0°, 90°, 90°] + [0°, 180°, 0°]
    ↓
Extract Pitch (Y) and Yaw (Z) in degrees
    ↓
Map to 0-1 range using calibration values
    ↓
Apply to Morph Targets with lerping
    ↓
Natural Eye Movement!
```

### Key Advantages

1. **More Natural**: Morph targets deform the eye mesh realistically
2. **No Gimbal Lock**: Avoids rotation order issues
3. **Better Convergence**: Each eye calculated independently
4. **Matches Unreal**: Same algorithm as Unreal Engine MetaHuman
5. **Automatic Tracking**: Eyes follow camera by default

## Usage

The system works automatically once integrated. The eyes will now:

1. **Track the camera** as you orbit around the character
2. **Use morph targets** for eye direction (not just bone rotation)
3. **Calculate per-eye convergence** for realistic eye crossing when looking at near objects
4. **Smooth transitions** with configurable lerp speed

### Default Behavior

```jsx
<Mike />  // Eyes automatically track camera!
```

### Custom Target

```jsx
const { setTarget } = usePupilTracking(meshRef, skeletonRoot);

// Look at specific point
setTarget(new THREE.Vector3(0, 1.5, 2));

// Reset to camera
setTarget(null);
```

## Configuration

You can customize the behavior:

```javascript
usePupilTracking(faceMeshRef, skeletonRoot, {
  trackCamera: true,       // Use camera tracking (default)
  enabled: true,           // Enable/disable
  lerpSpeed: 0.15,         // Smoothing (0-1, lower = smoother)
  
  // Adjust calibration for different characters
  calibration: {
    rightEye: {
      lookRightMax: 45,    // Increase for wider range
      lookLeftMax: -40,
      lookUpMax: 35,
      lookDownMax: -35,
    },
    // ... same for leftEye
  }
});
```

## Testing

To test the implementation:

1. **Run the dev server**: `npm run dev`
2. **Load the app**: Mike character should appear
3. **Orbit the camera**: Use OrbitControls to move around
4. **Watch the eyes**: They should smoothly follow your camera position
5. **Check morph targets**: Eyes should use blend shapes, not just bone rotation

## Backward Compatibility

The old bone rotation system is still available:

```javascript
usePupilTracking(meshRef, skeletonRoot, {
  trackCamera: false,  // Use old bone rotation method
});
```

## Next Steps

Possible enhancements:

1. **Integrate with Wayne character** - Apply same tracking to Wayne.jsx
2. **Add blink coordination** - Sync blinking with eye movement
3. **Saccadic motion** - Add quick jumps for realism
4. **Gaze duration** - Random gaze shifts instead of constant tracking
5. **Eyelid compensation** - Move eyelids when looking up/down

## Notes

- The system requires the head bone to be present in the skeleton
- Eye bones are used for positioning; if not available, it estimates from head
- Morph targets are applied with lerping for smooth transitions
- The calibration values are from real Unreal Engine MetaHuman rig data

---

**The system is ready to use! The Mike character should now have camera-tracking eyes using the same algorithm as Unreal Engine's MetaHuman system.**
