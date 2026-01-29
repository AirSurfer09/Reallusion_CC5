import React from "react";
import { useGraph, useThree, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import { useArkitLipsync } from "../../hooks/useArkitLipsync";
import { useHeadTracking } from "../../hooks/useHeadTracking";
import { usePupilTracking } from "../../hooks/usePupilTracking";

// Helper component to ensure geometry is ready
const SafeSkinnedMesh = React.forwardRef(({ geometry, ...props }, ref) => {
  // Only render if geometry has valid attributes
  if (!geometry || !geometry.attributes || !geometry.attributes.position) {
    return null;
  }

  return (
    <skinnedMesh
      ref={ref}
      geometry={geometry}
      frustumCulled={false}
      {...props}
    />
  );
});

export const Aaron = React.forwardRef(
  (
    {
      meshRefProp,
      convaiClient,
      blendshapeMapping = {},
      onLipsyncUpdate,
      ...props
    },
    characterRef,
  ) => {
    const internalCharacterRef = React.useRef();
    const faceMeshRef = React.useRef(); // Ref for CC_Base_Body_1 (face with morph targets)
    const { scene, animations } = useGLTF(
      "https://huggingface.co/datasets/airsurfer/Aaron/resolve/main/aaron-transformed.glb",
    );
    const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const { nodes, materials } = useGraph(clone);
    const { scene: threeScene, gl } = useThree();

    // Enhance material quality on mount - performant settings
    React.useEffect(() => {
      Object.entries(materials).forEach(([name, material]) => {
        if (
          material.isMeshStandardMaterial ||
          material.isMeshPhysicalMaterial
        ) {
          // Identify material types
          const isSkinMaterial =
            name &&
            (name.includes("Skin") ||
              name.includes("Head") ||
              name.includes("Body") ||
              name.includes("Arm") ||
              name.includes("Leg"));

          const isEyeMaterial =
            name &&
            (name.includes("Eye") || name.includes("Cornea")) &&
            !name.includes("Eyelash");

          const isEyelashMaterial = name && name.includes("Eyelash");

          const isHairMaterial =
            name && (name.includes("Hair") || name.includes("Scalp"));

          const isTeethMaterial =
            name && (name.includes("Teeth") || name.includes("Tongue"));

          if (isSkinMaterial) {
            // Skin - natural matte look (less shiny)
            material.envMapIntensity = 0.1; // Reduced from 0.15 for less shine
            material.roughness = 0.85; // Increased from 0.75 for more matte look
            material.metalness = 0.0;
          } else if (isEyeMaterial) {
            // Eyes - very glossy
            material.envMapIntensity = 0.8;
            material.roughness = 0.05;
            material.metalness = 0.0;
          } else if (isEyelashMaterial) {
            // Eyelashes - matte, no shine
            material.envMapIntensity = 0.0;
            material.roughness = 1.0;
            material.metalness = 0.0;
          } else if (isHairMaterial) {
            // Hair - darker shade with noticeable shine
            material.envMapIntensity = 0.35;
            material.roughness = 0.45;
            material.metalness = 0.0;
            // Darken the hair color
            if (material.color) {
              material.color.multiplyScalar(0.35); // Darken to ~35% of original
            }
          } else if (isTeethMaterial) {
            // Teeth & Tongue - slightly darker and more shadowed for natural look
            material.envMapIntensity = 0.12; // Subtle reflections
            material.roughness = 0.45; // Smoother finish for teeth
            material.metalness = 0.0;
            // Darken the teeth/tongue color moderately
            if (material.color) {
              material.color.multiplyScalar(0.65); // Darken to 65% of original
            }
            // Reduce brightness with emissive
            if (material.emissive) {
              material.emissive.setRGB(0, 0, 0);
              material.emissiveIntensity = 0;
            }
          } else {
            // Other materials - increased reflections
            material.envMapIntensity = 0.45;
            material.roughness = material.roughness || 0.4;
            material.metalness = material.metalness || 0.0;
          }

          material.needsUpdate = true;
        }
      });

      // Shadow rendering
      if (gl.shadowMap) {
        gl.shadowMap.enabled = true;
        gl.shadowMap.autoUpdate = true;
      }
    }, [materials, gl]);

    // Callback ref that sets both internal and external refs immediately
    const groupRef = React.useCallback(
      (node) => {
        if (node) {
          // Set internal ref for lipsync (synchronously)
          internalCharacterRef.current = node;

          // Forward to parent if provided
          if (characterRef) {
            if (typeof characterRef === "function") {
              characterRef(node);
            } else {
              characterRef.current = node;
            }
          }
        }
      },
      [characterRef],
    );

    const { actions } = useAnimations(animations, internalCharacterRef);

    // Use the ARKit lipsync hook with modular mapping system (call FIRST to get isPlaying)
    // Available presets: 'ARKIT_TO_CC_EXTENDED', 'ARKIT_TO_RPM', 'ARKIT_TO_ARKIT', 'METAHUMAN_TO_CC5', 'METAHUMAN_TO_CC5_DIRECT'
    const { isPlaying, totalFrames } = useArkitLipsync({
      convaiClient,
      characterRef: internalCharacterRef,
      scene: threeScene,
      mappingPreset: "METAHUMAN_TO_CC5", // CC5 Direct mapping (simple 1:1, faster)
      customMapping: blendshapeMapping, // Optional overrides from props
    });

    // Use the head tracking hook - tracks camera position
    // Tracking strength: 0.7 when speaking, 0.5 when idle
    useHeadTracking(
      nodes.CC_Base_BoneRoot,
      {
        headOnlyAngle: Math.PI / 3, // 60 degrees each side (head only)
        maxTrackAngle: Math.PI / 2, // 90 degrees each side = 180 degrees total viewing cone
        lerpSpeed: 0.08,
      },
      isPlaying,
    );

    // Use the pupil tracking hook (morph target + bone based)
    // Tracking strength: 1.0 when speaking, 0.5 when idle
    usePupilTracking(
      faceMeshRef,
      nodes.CC_Base_BoneRoot,
      {
        maxHorizontalAngle: Math.PI / 6, // 30 degrees
        maxVerticalAngle: Math.PI / 8, // 22.5 degrees
        lerpSpeed: 0.2,
        verticalOffset: 0.0, // Offset pupils slightly upward (0.0 to 1.0, where 0.5 is center)
      },
      isPlaying,
    );

    // Play idle animation on repeat with smooth fade-in (like game engines)
    React.useEffect(() => {
      if (actions && Object.keys(actions).length > 0) {
        // Get the first animation (or specific animation if you know the name)
        const firstAnimationName = Object.keys(actions)[0];
        const action = actions[firstAnimationName];

        if (action) {
          // Reset to start position
          action.reset();
          // Set loop mode before playing
          action.setLoop(2, Infinity); // LoopRepeat mode, infinite times
          // Fade in smoothly over 0.5 seconds (like Unreal Engine's blend time)
          action.fadeIn(0.5);
          // Start playing
          action.play();
          console.log(
            `Playing animation: ${firstAnimationName} on repeat (Aaron) with 0.5s fade-in`,
          );
        }
      }

      // Cleanup - fade out when unmounting
      return () => {
        if (actions) {
          Object.values(actions).forEach((action) => {
            if (action) {
              action.fadeOut(0.3); // Smooth fade out
              // Stop after fade completes
              setTimeout(() => action?.stop(), 300);
            }
          });
        }
      };
    }, [actions]);

    // Pass lipsync state up to parent
    React.useEffect(() => {
      if (onLipsyncUpdate) {
        onLipsyncUpdate({ isPlaying, totalFrames });
      }
    }, [isPlaying, totalFrames, onLipsyncUpdate]);

    // Sync face mesh ref with external meshRefProp
    React.useEffect(() => {
      if (meshRefProp && faceMeshRef.current) {
        meshRefProp.current = faceMeshRef.current;
      }
    }, [meshRefProp]);

    // Safety check: ensure all required nodes exist
    if (!nodes.CC_Base_BoneRoot || !nodes.CC_Base_Body_1) {
      console.warn("Aaron model not fully loaded yet");
      return null;
    }

    return (
      <group ref={groupRef} {...props} dispose={null}>
        <group name="Scene">
          <group name="Aaron" scale={0.01}>
            <primitive object={nodes.CC_Base_BoneRoot} />
          </group>
          <group name="CC_Base_EyeOcclusion" scale={0.01} />
          <SafeSkinnedMesh
            name="Slim_Fit_Trousers"
            geometry={nodes.Slim_Fit_Trousers.geometry}
            material={materials.Slim_Fit_Trousers_B115}
            skeleton={nodes.Slim_Fit_Trousers.skeleton}
            scale={0.01}
          />
          <SafeSkinnedMesh
            name="Sport_Sneakers"
            geometry={nodes.Sport_Sneakers.geometry}
            material={materials.Sport_sneakers_B126}
            skeleton={nodes.Sport_Sneakers.skeleton}
            scale={0.01}
          />
          <group name="Brows" scale={0.01}>
            <SafeSkinnedMesh
              name="Brows_1"
              geometry={nodes.Brows_1.geometry}
              material={materials.Brows_Hair_Transparency_B118}
              skeleton={nodes.Brows_1.skeleton}
              morphTargetDictionary={nodes.Brows_1.morphTargetDictionary}
              morphTargetInfluences={nodes.Brows_1.morphTargetInfluences}
            />
            <SafeSkinnedMesh
              name="Brows_2"
              geometry={nodes.Brows_2.geometry}
              material={materials.Brows_Color_Transparency_B119}
              skeleton={nodes.Brows_2.skeleton}
              morphTargetDictionary={nodes.Brows_2.morphTargetDictionary}
              morphTargetInfluences={nodes.Brows_2.morphTargetInfluences}
            />
            <SafeSkinnedMesh
              name="Brows_3"
              geometry={nodes.Brows_3.geometry}
              material={materials.Brows_Base_Transparency_B120}
              skeleton={nodes.Brows_3.skeleton}
              morphTargetDictionary={nodes.Brows_3.morphTargetDictionary}
              morphTargetInfluences={nodes.Brows_3.morphTargetInfluences}
            />
          </group>
          <group name="CC_Base_Body" scale={0.01}>
            <SafeSkinnedMesh
              ref={faceMeshRef}
              name="CC_Base_Body_1"
              geometry={nodes.CC_Base_Body_1.geometry}
              material={materials.Std_Skin_Head_B104}
              skeleton={nodes.CC_Base_Body_1.skeleton}
              morphTargetDictionary={nodes.CC_Base_Body_1.morphTargetDictionary}
              morphTargetInfluences={nodes.CC_Base_Body_1.morphTargetInfluences}
            />
            <SafeSkinnedMesh
              name="CC_Base_Body_2"
              geometry={nodes.CC_Base_Body_2.geometry}
              material={materials.Std_Skin_Body_B105}
              skeleton={nodes.CC_Base_Body_2.skeleton}
              morphTargetDictionary={nodes.CC_Base_Body_2.morphTargetDictionary}
              morphTargetInfluences={nodes.CC_Base_Body_2.morphTargetInfluences}
            />
            <SafeSkinnedMesh
              name="CC_Base_Body_3"
              geometry={nodes.CC_Base_Body_3.geometry}
              material={materials.Std_Skin_Arm_B106}
              skeleton={nodes.CC_Base_Body_3.skeleton}
              morphTargetDictionary={nodes.CC_Base_Body_3.morphTargetDictionary}
              morphTargetInfluences={nodes.CC_Base_Body_3.morphTargetInfluences}
            />
            <SafeSkinnedMesh
              name="CC_Base_Body_4"
              geometry={nodes.CC_Base_Body_4.geometry}
              material={materials.Std_Skin_Leg_B107}
              skeleton={nodes.CC_Base_Body_4.skeleton}
              morphTargetDictionary={nodes.CC_Base_Body_4.morphTargetDictionary}
              morphTargetInfluences={nodes.CC_Base_Body_4.morphTargetInfluences}
            />
            <SafeSkinnedMesh
              name="CC_Base_Body_5"
              geometry={nodes.CC_Base_Body_5.geometry}
              material={materials.Std_Nails_B108}
              skeleton={nodes.CC_Base_Body_5.skeleton}
              morphTargetDictionary={nodes.CC_Base_Body_5.morphTargetDictionary}
              morphTargetInfluences={nodes.CC_Base_Body_5.morphTargetInfluences}
            />
            <SafeSkinnedMesh
              name="CC_Base_Body_6"
              geometry={nodes.CC_Base_Body_6.geometry}
              material={materials.Std_Eyelash_B109}
              skeleton={nodes.CC_Base_Body_6.skeleton}
              morphTargetDictionary={nodes.CC_Base_Body_6.morphTargetDictionary}
              morphTargetInfluences={nodes.CC_Base_Body_6.morphTargetInfluences}
            />
          </group>
          <group name="CC_Base_Eye" scale={0.01}>
            <SafeSkinnedMesh
              name="CC_Base_Eye_1"
              geometry={nodes.CC_Base_Eye_1.geometry}
              material={materials.Std_Eye_R_B100}
              skeleton={nodes.CC_Base_Eye_1.skeleton}
              morphTargetDictionary={nodes.CC_Base_Eye_1.morphTargetDictionary}
              morphTargetInfluences={nodes.CC_Base_Eye_1.morphTargetInfluences}
            />
            <SafeSkinnedMesh
              name="CC_Base_Eye_2"
              geometry={nodes.CC_Base_Eye_2.geometry}
              material={materials.Std_Cornea_R_B101}
              skeleton={nodes.CC_Base_Eye_2.skeleton}
              morphTargetDictionary={nodes.CC_Base_Eye_2.morphTargetDictionary}
              morphTargetInfluences={nodes.CC_Base_Eye_2.morphTargetInfluences}
            />
            <SafeSkinnedMesh
              name="CC_Base_Eye_3"
              geometry={nodes.CC_Base_Eye_3.geometry}
              material={materials.Std_Eye_L_B102}
              skeleton={nodes.CC_Base_Eye_3.skeleton}
              morphTargetDictionary={nodes.CC_Base_Eye_3.morphTargetDictionary}
              morphTargetInfluences={nodes.CC_Base_Eye_3.morphTargetInfluences}
            />
            <SafeSkinnedMesh
              name="CC_Base_Eye_4"
              geometry={nodes.CC_Base_Eye_4.geometry}
              material={materials.Std_Cornea_L_B103}
              skeleton={nodes.CC_Base_Eye_4.skeleton}
              morphTargetDictionary={nodes.CC_Base_Eye_4.morphTargetDictionary}
              morphTargetInfluences={nodes.CC_Base_Eye_4.morphTargetInfluences}
            />
          </group>
          <group name="CC_Base_TearLine" scale={0.01}>
            <SafeSkinnedMesh
              name="CC_Base_TearLine_1"
              geometry={nodes.CC_Base_TearLine_1.geometry}
              material={materials.Std_Tearline_R_001_B121}
              skeleton={nodes.CC_Base_TearLine_1.skeleton}
              morphTargetDictionary={
                nodes.CC_Base_TearLine_1.morphTargetDictionary
              }
              morphTargetInfluences={
                nodes.CC_Base_TearLine_1.morphTargetInfluences
              }
            />
            <SafeSkinnedMesh
              name="CC_Base_TearLine_2"
              geometry={nodes.CC_Base_TearLine_2.geometry}
              material={materials.Std_Tearline_R_001_B121}
              skeleton={nodes.CC_Base_TearLine_2.skeleton}
              morphTargetDictionary={
                nodes.CC_Base_TearLine_2.morphTargetDictionary
              }
              morphTargetInfluences={
                nodes.CC_Base_TearLine_2.morphTargetInfluences
              }
            />
          </group>
          <group name="CC_Base_Teeth" scale={0.01}>
            <SafeSkinnedMesh
              name="CC_Base_Teeth_1"
              geometry={nodes.CC_Base_Teeth_1.geometry}
              material={materials.Std_Upper_Teeth_B110}
              skeleton={nodes.CC_Base_Teeth_1.skeleton}
              morphTargetDictionary={
                nodes.CC_Base_Teeth_1.morphTargetDictionary
              }
              morphTargetInfluences={
                nodes.CC_Base_Teeth_1.morphTargetInfluences
              }
            />
            <SafeSkinnedMesh
              name="CC_Base_Teeth_2"
              geometry={nodes.CC_Base_Teeth_2.geometry}
              material={materials.Std_Lower_Teeth_B111}
              skeleton={nodes.CC_Base_Teeth_2.skeleton}
              morphTargetDictionary={
                nodes.CC_Base_Teeth_2.morphTargetDictionary
              }
              morphTargetInfluences={
                nodes.CC_Base_Teeth_2.morphTargetInfluences
              }
            />
          </group>
          <SafeSkinnedMesh
            name="CC_Base_Tongue"
            geometry={nodes.CC_Base_Tongue.geometry}
            material={materials.Std_Tongue_B123}
            skeleton={nodes.CC_Base_Tongue.skeleton}
            morphTargetDictionary={nodes.CC_Base_Tongue.morphTargetDictionary}
            morphTargetInfluences={nodes.CC_Base_Tongue.morphTargetInfluences}
            scale={0.01}
          />
          <group name="Classic_Slick_Back" scale={0.01}>
            <SafeSkinnedMesh
              name="Classic_Slick_Back_1"
              geometry={nodes.Classic_Slick_Back_1.geometry}
              material={materials.Hair_Transparency_B124}
              skeleton={nodes.Classic_Slick_Back_1.skeleton}
              morphTargetDictionary={
                nodes.Classic_Slick_Back_1.morphTargetDictionary
              }
              morphTargetInfluences={
                nodes.Classic_Slick_Back_1.morphTargetInfluences
              }
            />
            <SafeSkinnedMesh
              name="Classic_Slick_Back_2"
              geometry={nodes.Classic_Slick_Back_2.geometry}
              material={materials.Hair_Clap_Transparency_B125}
              skeleton={nodes.Classic_Slick_Back_2.skeleton}
              morphTargetDictionary={
                nodes.Classic_Slick_Back_2.morphTargetDictionary
              }
              morphTargetInfluences={
                nodes.Classic_Slick_Back_2.morphTargetInfluences
              }
            />
          </group>
          <SafeSkinnedMesh
            name="Eyelash_Low"
            geometry={nodes.Eyelash_Low.geometry}
            material={materials.Eyelash_Low_Transparency_B112}
            skeleton={nodes.Eyelash_Low.skeleton}
            morphTargetDictionary={nodes.Eyelash_Low.morphTargetDictionary}
            morphTargetInfluences={nodes.Eyelash_Low.morphTargetInfluences}
            scale={0.01}
          />
          <SafeSkinnedMesh
            name="Eyelash_Up"
            geometry={nodes.Eyelash_Up.geometry}
            material={materials.Eyelash_Low_Transparency_B112}
            skeleton={nodes.Eyelash_Up.skeleton}
            morphTargetDictionary={nodes.Eyelash_Up.morphTargetDictionary}
            morphTargetInfluences={nodes.Eyelash_Up.morphTargetInfluences}
            scale={0.01}
          />
          <SafeSkinnedMesh
            name="RS_Regular_Fit_Shirt"
            geometry={nodes.RS_Regular_Fit_Shirt.geometry}
            material={materials.RS_Regular_Fit_Shirt_B114}
            skeleton={nodes.RS_Regular_Fit_Shirt.skeleton}
            morphTargetDictionary={
              nodes.RS_Regular_Fit_Shirt.morphTargetDictionary
            }
            morphTargetInfluences={
              nodes.RS_Regular_Fit_Shirt.morphTargetInfluences
            }
            scale={0.01}
          />
          <SafeSkinnedMesh
            name="Stubble"
            geometry={nodes.Stubble.geometry}
            material={materials.Beard_Transparency_B127}
            skeleton={nodes.Stubble.skeleton}
            morphTargetDictionary={nodes.Stubble.morphTargetDictionary}
            morphTargetInfluences={nodes.Stubble.morphTargetInfluences}
            scale={0.01}
          />
        </group>
      </group>
    );
  },
);

useGLTF.preload(
  "https://huggingface.co/datasets/airsurfer/Aaron/resolve/main/aaron-transformed.glb",
);
