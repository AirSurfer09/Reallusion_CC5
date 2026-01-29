import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Wayne } from './components/characters/Wayne';
import { usePupilTracking } from './hooks/usePupilTracking';

/**
 * Example: Basic camera tracking
 * Eyes will automatically follow the camera position
 */
function Example1() {
  return (
    <Canvas>
      <WayneWithCameraTracking />
      <OrbitControls />
    </Canvas>
  );
}

function WayneWithCameraTracking() {
  const meshRef = useRef();
  const characterRef = useRef();
  
  // Get skeleton root from Wayne character
  const skeletonRoot = characterRef.current?.children.find(
    child => child.name === 'root' || child.type === 'Bone'
  );
  
  // Enable camera tracking (default behavior)
  usePupilTracking(meshRef, skeletonRoot, {
    trackCamera: true,    // Track camera (default)
    enabled: true,
    lerpSpeed: 0.2,       // Smooth eye movement
  });
  
  return (
    <Wayne 
      ref={characterRef}
      meshRefProp={meshRef}
      position={[0, 0, 0]}
    />
  );
}

/**
 * Example 2: Custom target tracking
 * Eyes follow a specific object/position
 */
function Example2() {
  const targetRef = useRef();
  
  return (
    <Canvas>
      <WayneWithCustomTarget targetRef={targetRef} />
      
      {/* Visual indicator of target */}
      <mesh ref={targetRef} position={[0, 1.5, 1]}>
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial color="red" />
      </mesh>
      
      <OrbitControls />
    </Canvas>
  );
}

function WayneWithCustomTarget({ targetRef }) {
  const meshRef = useRef();
  const characterRef = useRef();
  
  const skeletonRoot = characterRef.current?.children.find(
    child => child.name === 'root' || child.type === 'Bone'
  );
  
  const { setTarget } = usePupilTracking(meshRef, skeletonRoot);
  
  // Update target position every frame
  React.useEffect(() => {
    if (!targetRef.current) return;
    
    const interval = setInterval(() => {
      const pos = targetRef.current.position;
      setTarget(pos);
    }, 100);
    
    return () => clearInterval(interval);
  }, [setTarget, targetRef]);
  
  return (
    <Wayne 
      ref={characterRef}
      meshRefProp={meshRef}
      position={[0, 0, 0]}
    />
  );
}

/**
 * Example 3: Animated target
 * Eyes follow a moving object
 */
function Example3() {
  return (
    <Canvas>
      <WayneWithAnimatedTarget />
      <OrbitControls />
    </Canvas>
  );
}

function WayneWithAnimatedTarget() {
  const meshRef = useRef();
  const characterRef = useRef();
  const targetPos = useRef(new THREE.Vector3());
  
  const skeletonRoot = characterRef.current?.children.find(
    child => child.name === 'root' || child.type === 'Bone'
  );
  
  const { setTarget } = usePupilTracking(meshRef, skeletonRoot);
  
  // Animate target in a circle
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    targetPos.current.set(
      Math.sin(t) * 2,
      1.5 + Math.sin(t * 2) * 0.5,
      Math.cos(t) * 2
    );
    setTarget(targetPos.current);
  });
  
  return (
    <Wayne 
      ref={characterRef}
      meshRefProp={meshRef}
      position={[0, 0, 0]}
    />
  );
}

/**
 * Example 4: Toggle between camera and custom target
 */
function Example4() {
  const [useCamera, setUseCamera] = React.useState(true);
  
  return (
    <div>
      <button onClick={() => setUseCamera(!useCamera)}>
        {useCamera ? 'Track Object' : 'Track Camera'}
      </button>
      
      <Canvas>
        <WayneWithToggle useCamera={useCamera} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}

function WayneWithToggle({ useCamera }) {
  const meshRef = useRef();
  const characterRef = useRef();
  const objectPos = useRef(new THREE.Vector3(0, 1.5, 2));
  
  const skeletonRoot = characterRef.current?.children.find(
    child => child.name === 'root' || child.type === 'Bone'
  );
  
  const { setTarget } = usePupilTracking(meshRef, skeletonRoot);
  
  React.useEffect(() => {
    if (useCamera) {
      setTarget(null); // Reset to camera
    } else {
      setTarget(objectPos.current);
    }
  }, [useCamera, setTarget]);
  
  return (
    <>
      <Wayne 
        ref={characterRef}
        meshRefProp={meshRef}
        position={[0, 0, 0]}
      />
      
      {!useCamera && (
        <mesh position={[0, 1.5, 2]}>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial color="yellow" />
        </mesh>
      )}
    </>
  );
}

/**
 * Example 5: Custom calibration for different character rigs
 */
function Example5() {
  return (
    <Canvas>
      <WayneWithCustomCalibration />
      <OrbitControls />
    </Canvas>
  );
}

function WayneWithCustomCalibration() {
  const meshRef = useRef();
  const characterRef = useRef();
  
  const skeletonRoot = characterRef.current?.children.find(
    child => child.name === 'root' || child.type === 'Bone'
  );
  
  // Custom calibration if your character has different eye movement ranges
  usePupilTracking(meshRef, skeletonRoot, {
    trackCamera: true,
    calibration: {
      rightEye: {
        lookRightMax: 45,   // Increased range
        lookLeftMax: -40,
        lookUpMax: 35,
        lookDownMax: -35,
      },
      leftEye: {
        lookRightMax: 45,
        lookLeftMax: -40,
        lookUpMax: 35,
        lookDownMax: -35,
      }
    }
  });
  
  return (
    <Wayne 
      ref={characterRef}
      meshRefProp={meshRef}
      position={[0, 0, 0]}
    />
  );
}

/**
 * Example 6: Disable camera tracking, use old bone rotation system
 */
function Example6() {
  return (
    <Canvas>
      <WayneWithBoneRotation />
      <OrbitControls />
    </Canvas>
  );
}

function WayneWithBoneRotation() {
  const meshRef = useRef();
  const characterRef = useRef();
  
  const skeletonRoot = characterRef.current?.children.find(
    child => child.name === 'root' || child.type === 'Bone'
  );
  
  // Use old bone rotation system
  usePupilTracking(meshRef, skeletonRoot, {
    trackCamera: false,   // Disable new camera tracking
    enabled: true,
  });
  
  return (
    <Wayne 
      ref={characterRef}
      meshRefProp={meshRef}
      position={[0, 0, 0]}
    />
  );
}

export {
  Example1,
  Example2,
  Example3,
  Example4,
  Example5,
  Example6,
};
