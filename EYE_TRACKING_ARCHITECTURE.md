# Eye Tracking System Architecture

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CAMERA-BASED EYE TRACKING                 │
│              (Unreal Engine MetaHuman Algorithm)             │
└─────────────────────────────────────────────────────────────┘

INPUT SOURCES:
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Camera     │     │ Custom Target│     │  Skeleton    │
│  Position    │ OR  │   Position   │     │    Bones     │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                     │                     │
       └─────────┬───────────┘                     │
                 │                                 │
                 ▼                                 ▼
         ┌───────────────┐              ┌──────────────────┐
         │ Target Vector │              │ Head + Eye Bones │
         │   (World)     │              │   Get Positions  │
         └───────┬───────┘              └─────────┬────────┘
                 │                                 │
                 └────────────┬────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Per-Eye Calc    │
                    │ (Left & Right)   │
                    └─────────┬────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌───────────────┐                         ┌───────────────┐
│ LEFT EYE CALC │                         │RIGHT EYE CALC │
└───────┬───────┘                         └───────┬───────┘
        │                                         │
        │  1. FindLookAtRotation                 │
        │  2. InverseTransformRotation           │
        │  3. ComposeRotators                    │
        │  4. BreakRotator (Pitch/Yaw)           │
        │                                         │
        ▼                                         ▼
┌───────────────┐                         ┌───────────────┐
│ Left Rotation │                         │Right Rotation │
│  Yaw: -37→42° │                         │  Yaw: -37→42° │
│ Pitch: -39→29°│                         │ Pitch: -39→29°│
└───────┬───────┘                         └───────┬───────┘
        │                                         │
        │  MapRangeClamped (Calibration)         │
        │                                         │
        ▼                                         ▼
┌───────────────┐                         ┌───────────────┐
│ Morph Targets │                         │ Morph Targets │
│ 0.0 → 1.0     │                         │ 0.0 → 1.0     │
└───────┬───────┘                         └───────┬───────┘
        │                                         │
        └────────────┬────────────────────────────┘
                     │
                     ▼
         ┌─────────────────────┐
         │  Apply to Mesh      │
         │  with Lerp Smooth   │
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │   8 Blend Shapes    │
         │  (4 per eye)        │
         └─────────────────────┘

BLEND SHAPES APPLIED:
┌──────────────────────┬──────────────────────┐
│      LEFT EYE        │      RIGHT EYE       │
├──────────────────────┼──────────────────────┤
│ CTRL_L_eye_lookUp    │ CTRL_R_eye_lookUp    │
│ CTRL_L_eye_lookDown  │ CTRL_R_eye_lookDown  │
│ CTRL_L_eye_lookLeft  │ CTRL_R_eye_lookLeft  │
│ CTRL_L_eye_lookRight │ CTRL_R_eye_lookRight │
└──────────────────────┴──────────────────────┘

RESULT: Natural eye movement tracking camera!
```

## Calibration Ranges

```
HORIZONTAL (Yaw):
        Left          Center         Right
         ↓               ↓              ↓
    -37.557°           0°          +42.165°
    ◄─────────────────────────────────►
         │                             │
    lookLeft = 1.0              lookRight = 1.0


VERTICAL (Pitch):
          Up
           ↓
      +29.954°
          ▲
          │
    ──────┼────── 0° (Center)
          │
          ▼
      -39.955°
           ↓
         Down
    
    lookUp = 1.0    │    lookDown = 1.0
```

## Code Flow

```javascript
// 1. Get positions
leftEyePos = leftEyeBone.getWorldPosition()
rightEyePos = rightEyeBone.getWorldPosition()
targetPos = camera.position (or custom target)

// 2. Calculate look-at rotation
rightLookAtRot = Matrix4.lookAt(rightEyePos, targetPos, up)
leftLookAtRot = Matrix4.lookAt(leftEyePos, targetPos, up)

// 3. Transform to head-local space
rightLocalRot = headInverse * rightLookAtRot
leftLocalRot = headInverse * leftLookAtRot

// 4. Apply offsets (match Unreal bone orientation)
rightRot = rightLocalRot * Euler(0°, 90°, 90°) * Euler(0°, 180°, 0°)
leftRot = leftLocalRot * Euler(0°, 90°, 90°) * Euler(0°, 180°, 0°)

// 5. Extract angles
rightYaw = rightRot.z (in degrees)
rightPitch = rightRot.y (in degrees)

// 6. Map to 0-1 range
lookRight = mapRange(rightYaw, 0, 42.165, 0, 1)
lookLeft = mapRange(rightYaw, 0, -37.557, 0, 1)
lookUp = mapRange(rightPitch, 0, 29.954, 0, 1)
lookDown = mapRange(rightPitch, 0, -39.955, 0, 1)

// 7. Apply to morph targets
mesh.morphTargetInfluences[lookRightIndex] = lerp(current, lookRight, 0.15)
```

## Comparison: Unreal vs Three.js

```
┌─────────────────────┬──────────────────────┐
│  Unreal Engine BP   │     Three.js         │
├─────────────────────┼──────────────────────┤
│ GetSocketLocation   │ bone.getWorldPos()   │
│ FindLookAtRotation  │ Matrix4.lookAt()     │
│ InverseTransform    │ matrix.invert()      │
│ ComposeRotators     │ quat.multiply()      │
│ BreakRotator        │ euler.setFromQuat()  │
│ MapRangeClamped     │ mapRangeClamped()    │
│ Set Variable        │ influences[idx] = x  │
└─────────────────────┴──────────────────────┘
```

## System States

```
STATE 1: Camera Tracking (Default)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Camera moves → Eyes follow
- trackCamera: true
- target: camera.position
- morph targets: active
- bone rotation: inactive

STATE 2: Custom Target
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Object moves → Eyes follow
- trackCamera: true
- target: custom Vector3
- morph targets: active
- bone rotation: inactive

STATE 3: Legacy Bone Mode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Simple rotation tracking
- trackCamera: false
- target: camera.position or custom
- morph targets: active (for deformation)
- bone rotation: active
```

## Performance Notes

```
┌────────────────────┬─────────┬──────────┐
│ Operation          │ Cost    │ Per Frame│
├────────────────────┼─────────┼──────────┤
│ Get Bone Position  │ Low     │ 3x       │
│ Matrix Calculation │ Medium  │ 2x       │
│ Quaternion Ops     │ Low     │ 4x       │
│ Angle Extraction   │ Low     │ 2x       │
│ Morph Target Apply │ Low     │ 8x       │
├────────────────────┼─────────┼──────────┤
│ TOTAL              │ ~0.1ms  │ Every    │
└────────────────────┴─────────┴──────────┘

✅ Highly optimized for 60 FPS
✅ Uses refs to avoid React re-renders
✅ Lerping prevents jittery movement
```
