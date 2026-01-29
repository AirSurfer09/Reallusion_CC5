import { OrbitControls } from "@react-three/drei";
import { Aaron } from "./characters/Aaron";

import * as THREE from "three";
import { useEffect, useRef } from "react";

// Gradient Background Component
function GradientBackground() {
  const meshRef = useRef();

  useEffect(() => {
    if (meshRef.current) {
      // Create gradient texture
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");

      // Create light gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#f5f0e8"); // Warm cream (top)
      gradient.addColorStop(0.5, "#ece5d8"); // Beige
      gradient.addColorStop(1, "#d8d0c0"); // Warm gray (bottom)

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const texture = new THREE.CanvasTexture(canvas);
      meshRef.current.material.map = texture;
      meshRef.current.material.needsUpdate = true;
    }
  }, []);

  return (
    <mesh ref={meshRef} position={[0, 1.6, -1]} rotation={[0, 0, 0]}>
      <planeGeometry args={[10, 8]} />
      <meshBasicMaterial side={THREE.DoubleSide} />
    </mesh>
  );
}

export const Experience = ({
  meshRef,
  convaiClient,
  blendshapeMapping,
  onLipsyncUpdate,
}) => {
  return (
    <>
      {/* Reduced to 3 lights for better performance */}
      {/* Shadows disabled - no real-time calculations for maximum FPS */}

      {/* Gradient Background */}
      <GradientBackground />

      {/* 1. Ambient light - essential base illumination */}
      <ambientLight intensity={0.25} color="#fff5ee" />

      {/* 2. Main Key Light - primary light source (no shadows) */}
      <spotLight
        position={[0.5, 2.5, 3.5]}
        angle={0.9}
        penumbra={1.0}
        intensity={35}
        color="#fff0e6"
        target-position={[0, 1.6, 0]}
      />

      {/* 3. Fill Light - soft side fill for balanced lighting */}
      <spotLight
        position={[-2, 2.2, 2.5]}
        angle={0.85}
        penumbra={1.0}
        intensity={15}
        color="#ffe8dd"
        target-position={[0, 1.6, 0]}
      />

      <OrbitControls
        target={[0, 1.6, 0]}
        enablePan={true}
        enableZoom={true}
        minDistance={0.5}
        maxDistance={4}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 3}
      />

      {/* Main Character - Zari with lipsync, head tracking, pupil tracking, and animation */}
      {/* <Zari */}
      {/* <Nia */}
      <Aaron
        meshRefProp={meshRef}
        convaiClient={convaiClient}
        blendshapeMapping={blendshapeMapping}
        onLipsyncUpdate={onLipsyncUpdate}
      />
    </>
  );
};
