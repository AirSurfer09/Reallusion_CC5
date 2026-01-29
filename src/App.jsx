import { Canvas } from "@react-three/fiber";
import { Stats } from "@react-three/drei";
import { Experience } from "./components/Experience";
import { useRef, useState, useEffect, Suspense } from "react";
import { useConvaiClient, ConvaiWidget } from "@convai/web-sdk/react";
import { CONVAI_CONFIG, CONVAI_TO_MODEL_MAPPING } from "./constants";
import "./App.css";
import * as THREE from "three";

// Check WebGPU support
const isWebGPUAvailable =
  typeof navigator !== "undefined" && navigator.gpu !== undefined;

function Loader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="gray" wireframe />
    </mesh>
  );
}

function App() {
  const meshRef = useRef(null);
  const [blendshapeStats, setBlendshapeStats] = useState({
    totalFramesReceived: 0,
    isAvailable: false,
  });

  // Initialize Convai client
  const convaiClient = useConvaiClient(CONVAI_CONFIG);

  // Listen for blendshape events
  useEffect(() => {
    let totalFrames = 0;

    const handleBlendshapes = (data) => {
      if (data.blendshapes) {
        totalFrames += data.blendshapes.length;
        setBlendshapeStats({
          totalFramesReceived: totalFrames,
          isAvailable: true,
        });
      }
    };

    convaiClient.on("blendshapes", handleBlendshapes);

    return () => {
      convaiClient.off("blendshapes", handleBlendshapes);
    };
  }, [convaiClient]);

  return (
    <>
      <Canvas
        shadows={false}
        dpr={1}
        camera={{ position: [0, 1.6, 3.5], fov: 10 }}
        gl={(canvas) => {
          // Log WebGPU availability
          if (isWebGPUAvailable) {
            console.log("🚀 WebGPU is available on this device");
          }
          // Use optimized WebGL2 renderer
          const renderer = new THREE.WebGLRenderer({
            canvas,
            powerPreference: "high-performance",
            antialias: false, // Disabled for better performance
            alpha: false,
            stencil: false,
            depth: true,
          });
          renderer.toneMapping = THREE.ACESFilmicToneMapping;
          renderer.toneMappingExposure = 1;
          renderer.outputColorSpace = THREE.SRGBColorSpace;
          // Shadows completely disabled - no real-time calculations
          renderer.shadowMap.enabled = false;
          renderer.shadowMap.autoUpdate = false;
          return renderer;
        }}
        flat={false}
        linear={false}
        frameloop="always"
      >
        <Stats />
        <color attach="background" args={["#000000"]} />
        <Suspense fallback={<Loader />}>
          <Experience
            meshRef={meshRef}
            convaiClient={convaiClient}
            blendshapeMapping={CONVAI_TO_MODEL_MAPPING}
          />
        </Suspense>
      </Canvas>

      {/* Convai Widget - Bottom right corner */}
      <ConvaiWidget convaiClient={convaiClient} />
    </>
  );
}

export default App;
