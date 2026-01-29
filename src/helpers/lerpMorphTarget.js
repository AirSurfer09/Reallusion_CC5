export function lerpMorphTarget(name, value, lerpAmount, scene) {
  scene.traverse((child) => {
    if (child.isSkinnedMesh && child.morphTargetDictionary && child.morphTargetInfluences) {
      const index = child.morphTargetDictionary[name];
      if (index !== undefined) {
        const current = child.morphTargetInfluences[index];
        child.morphTargetInfluences[index] = current + (value - current) * lerpAmount;
      }
    }
  });
}

export function setMorphTarget(name, value, scene) {
  scene.traverse((child) => {
    if (child.isSkinnedMesh && child.morphTargetDictionary && child.morphTargetInfluences) {
      const index = child.morphTargetDictionary[name];
      if (index !== undefined) {
        child.morphTargetInfluences[index] = value;
      }
    }
  });
}

