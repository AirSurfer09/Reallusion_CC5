/**
 * MetaHuman to CC5 Blendshape Mapping
 * 
 * This file contains mappings from MetaHuman control rig expressions (CTRL_expressions_*)
 * to Character Creator 5 (CC5) blendshapes (C_*).
 * 
 * Based on Unreal Engine MetaHuman to CC5 conversion configuration.
 * 
 * Source channels: CTRL_expressions_* (MetaHuman)
 * Target channels: C_* (CC5)
 * 
 * NOTE: This is separate from the Convai ARKit mapping. Use this if you need to convert
 * MetaHuman blendshapes to CC5 format.
 */

/**
 * Evaluate a curve at a given input time/value using linear interpolation
 * 
 * @param {Array<{time: number, value: number}>} keys - Curve keyframes sorted by time
 * @param {number} inputValue - Input value (0-1)
 * @returns {number} Interpolated output value
 */
function evaluateCurve(keys, inputValue) {
  if (!keys || keys.length === 0) {
    // No curve defined, pass through
    return inputValue;
  }

  // Clamp input to valid range
  inputValue = Math.max(0, Math.min(1, inputValue));

  // Find the two keyframes to interpolate between
  let startKey = keys[0];
  let endKey = keys[keys.length - 1];

  // If input is before first key or after last key, clamp to boundary
  if (inputValue <= startKey.time) {
    return startKey.value;
  }
  if (inputValue >= endKey.time) {
    return endKey.value;
  }

  // Find the two keys that bracket the input value
  for (let i = 0; i < keys.length - 1; i++) {
    if (inputValue >= keys[i].time && inputValue <= keys[i + 1].time) {
      startKey = keys[i];
      endKey = keys[i + 1];
      break;
    }
  }

  // Linear interpolation between the two keys
  const timeDelta = endKey.time - startKey.time;
  if (timeDelta === 0) {
    return startKey.value;
  }

  const t = (inputValue - startKey.time) / timeDelta;
  return startKey.value + (endKey.value - startKey.value) * t;
}

/**
 * Combined blendshape mappings
 * Maps MetaHuman source channels to CC5 target channels
 * 
 * Structure:
 * - name: Descriptive name of the mapping
 * - source: Array of MetaHuman CTRL_expressions_* channels
 * - target: CC5 C_* channel name
 * - mode: "Add" (additive) or "Limit" (limits the value)
 * - curve: Array of keyframes [{time, value}] for remapping output (optional)
 */
export const METAHUMAN_TO_CC5_MAPPING = [
  // ========== NOSE WRINKLE & BROW COMBINATIONS ==========
  {
    name: "NoseWrinkleL_BrowDownL",
    source: ["CTRL_expressions_noseWrinkleL", "CTRL_expressions_browDownL"],
    target: "C_NoseWrinkleL_BrowDownL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "NoseWrinkleR_BrowDownR",
    source: ["CTRL_expressions_noseWrinkleR", "CTRL_expressions_browDownR"],
    target: "C_NoseWrinkleR_BrowDownR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },

  // ========== EYE BLINK COMBINATIONS ==========
  {
    name: "BlinkL",
    source: ["CTRL_expressions_eyeBlinkL"],
    target: "C_BlinkL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 0.5, value: 1}, {time: 1, value: 0}]
  },
  {
    name: "BlinkR",
    source: ["CTRL_expressions_eyeBlinkR"],
    target: "C_BlinkR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 0.5, value: 1}, {time: 1, value: 0}]
  },
  {
    name: "BlinkL_LookDownL",
    source: ["CTRL_expressions_eyeBlinkL", "CTRL_expressions_eyeLookDownL"],
    target: "C_BlinkL_LookDownL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "BlinkR_LookDownR",
    source: ["CTRL_expressions_eyeBlinkR", "CTRL_expressions_eyeLookDownR"],
    target: "C_BlinkR_LookDownR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "BlinkL_LookUpL",
    source: ["CTRL_expressions_eyeBlinkL", "CTRL_expressions_eyeLookUpL"],
    target: "C_BlinkL_LookUpL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "BlinkR_LookUpR",
    source: ["CTRL_expressions_eyeBlinkR", "CTRL_expressions_eyeLookUpR"],
    target: "C_BlinkR_LookUpR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "BlinkL_SquintInnerL",
    source: ["CTRL_expressions_eyeBlinkL", "CTRL_expressions_eyeSquintInnerL"],
    target: "C_BlinkL_SquintInnerL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "BlinkR_SquintInnerR",
    source: ["CTRL_expressions_eyeBlinkR", "CTRL_expressions_eyeSquintInnerR"],
    target: "C_BlinkR_SquintInnerR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "BlinkL_CheekRaiseL",
    source: ["CTRL_expressions_eyeBlinkL", "CTRL_expressions_eyeCheekRaiseL"],
    target: "C_BlinkL_CheekRaiseL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "BlinkL_CheekRaiseR",
    source: ["CTRL_expressions_eyeBlinkR", "CTRL_expressions_eyeCheekRaiseR"],
    target: "C_BlinkR_CheekRaiseR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "BlinkL_LookLeftL",
    source: ["CTRL_expressions_eyeBlinkL", "CTRL_expressions_eyeLookLeftL"],
    target: "C_BlinkL_LookLeftL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "BlinkR_LookLeftR",
    source: ["CTRL_expressions_eyeBlinkR", "CTRL_expressions_eyeLookLeftR"],
    target: "C_BlinkR_LookLeftR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "BlinkL_LookRightL",
    source: ["CTRL_expressions_eyeBlinkL", "CTRL_expressions_eyeLookRightL"],
    target: "C_BlinkL_LookRightL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "BlinkR_LookRightR",
    source: ["CTRL_expressions_eyeBlinkR", "CTRL_expressions_eyeLookRightR"],
    target: "C_BlinkR_LookRightR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "BlinkL_SquintInnerL_CheekRaiseL",
    source: ["CTRL_expressions_eyeCheekRaiseL", "CTRL_expressions_eyeSquintInnerL", "CTRL_expressions_eyeBlinkL"],
    target: "C_BlinkL_SquintInnerL_CheekRaiseL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "BlinkR_SquintInnerR_CheekRaiseR",
    source: ["CTRL_expressions_eyeCheekRaiseR", "CTRL_expressions_eyeSquintInnerR", "CTRL_expressions_eyeBlinkR"],
    target: "C_BlinkR_SquintInnerR_CheekRaiseR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },

  // ========== EYE WIDEN COMBINATIONS ==========
  {
    name: "WidenL_LookDownL",
    source: ["CTRL_expressions_eyeLookDownL", "CTRL_expressions_eyeWidenL"],
    target: "C_WidenL_LookDownL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "WidenR_LookDownR",
    source: ["CTRL_expressions_eyeLookDownR", "CTRL_expressions_eyeWidenR"],
    target: "C_WidenR_LookDownR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },

  // ========== CHEEK & SQUINT COMBINATIONS ==========
  {
    name: "CheekRaiseL_SquintInnerL",
    source: ["CTRL_expressions_eyeCheekRaiseL", "CTRL_expressions_eyeSquintInnerL"],
    target: "C_CheekRaiseL_SquintInnerL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "CheekRaiseR_SquintInnerR",
    source: ["CTRL_expressions_eyeCheekRaiseR", "CTRL_expressions_eyeSquintInnerR"],
    target: "C_CheekRaiseR_SquintInnerR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },

  // ========== CHEEK BLOW ==========
  {
    name: "CheekBlowL_CheekBlowR",
    source: ["CTRL_expressions_mouthCheekBlowL", "CTRL_expressions_mouthCheekBlowR"],
    target: "C_CheekBlowL_CheekBlowR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },

  // ========== CHEEK RAISE & CORNER PULL ==========
  {
    name: "CheekRaiseL_MouthCornerPullL",
    source: ["CTRL_expressions_eyeCheekRaiseL", "CTRL_expressions_mouthCornerPullL"],
    target: "C_CheekRaiseL_CornerPullL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "CheekRaiseR_MouthCornerPullR",
    source: ["CTRL_expressions_eyeCheekRaiseR", "CTRL_expressions_mouthCornerPullR"],
    target: "C_CheekRaiseR_CornerPullR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },

  // ========== NOSE WRINKLE & UPPER LIP ==========
  {
    name: "WrinkleL_UpperLipRaiseL",
    source: ["CTRL_expressions_noseWrinkleL", "CTRL_expressions_mouthUpperLipRaiseL"],
    target: "C_WrinkleL_UpperLipRaiseL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "WrinkleR_UpperLipRaiseR",
    source: ["CTRL_expressions_noseWrinkleR", "CTRL_expressions_mouthUpperLipRaiseR"],
    target: "C_WrinkleR_UpperLipRaiseR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "WrinkleL_MouthCornerPullL",
    source: ["CTRL_expressions_noseWrinkleL", "CTRL_expressions_mouthCornerPullL"],
    target: "C_WrinkleL_MouthCornerPullL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "WrinkleR_MouthCornerPullR",
    source: ["CTRL_expressions_noseWrinkleR", "CTRL_expressions_mouthCornerPullR"],
    target: "C_WrinkleR_MouthCornerPullR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },

  // ========== CORNER PULL COMBINATIONS ==========
  {
    name: "CornerPullL_CornerPullR",
    source: ["CTRL_expressions_mouthCornerPullL", "CTRL_expressions_mouthCornerPullR"],
    target: "C_CornerPullL_CornerPullR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "CornerPullL_LowerLipDepressL",
    source: ["CTRL_expressions_mouthCornerPullL", "CTRL_expressions_mouthLowerLipDepressL"],
    target: "C_CornerPullL_LowerLipDepressL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "CornerPullR_LowerLipDepressR",
    source: ["CTRL_expressions_mouthCornerPullR", "CTRL_expressions_mouthLowerLipDepressR"],
    target: "C_CornerPullR_LowerLipDepressR",
    mode: "Add",
    curve: [{time: 0, value: 0.009009}, {time: 1, value: 1}]
  },
  {
    name: "CornerPullL_UpperLipRaiseL",
    source: ["CTRL_expressions_mouthCornerPullL", "CTRL_expressions_mouthUpperLipRaiseL"],
    target: "C_CornerPullL_UpperLipRaiseL",
    mode: "Add",
    curve: [{time: 0, value: -0.003497}, {time: 1, value: 1}]
  },
  {
    name: "CornerPullR_UpperLipRaiseR",
    source: ["CTRL_expressions_mouthCornerPullR", "CTRL_expressions_mouthUpperLipRaiseR"],
    target: "C_CornerPullR_UpperLipRaiseR",
    mode: "Add",
    curve: [{time: 0, value: -0.003497}, {time: 1, value: 1}]
  },
  {
    name: "CornerPullL_StretchL",
    source: ["CTRL_expressions_mouthCornerPullL", "CTRL_expressions_mouthStretchL"],
    target: "C_CornerPullL_StretchL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "CornerPullR_StretchR",
    source: ["CTRL_expressions_mouthCornerPullR", "CTRL_expressions_mouthStretchR"],
    target: "C_CornerPullR_StretchR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "StretchL_CornerPullL_LowerLipDepressL",
    source: ["CTRL_expressions_mouthStretchL", "CTRL_expressions_mouthCornerPullL", "CTRL_expressions_mouthLowerLipDepressL"],
    target: "C_StretchL_CornerPullL_LowerLipDepressL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "StretchR_CornerPullR_LowerLipDepressR",
    source: ["CTRL_expressions_mouthStretchR", "CTRL_expressions_mouthCornerPullR", "CTRL_expressions_mouthLowerLipDepressR"],
    target: "C_StretchR_CornerPullR_LowerLipDepressR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "CornerPullL_DimpleL",
    source: ["CTRL_expressions_mouthCornerPullL", "CTRL_expressions_mouthDimpleL"],
    target: "C_CornerPullL_DimpleL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "CornerPullR_DimpleR",
    source: ["CTRL_expressions_mouthCornerPullR", "CTRL_expressions_mouthDimpleR"],
    target: "C_CornerPullR_DimpleR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "CornerPullL_SharpCornerPullL",
    source: ["CTRL_expressions_mouthCornerPullL", "CTRL_expressions_mouthSharpCornerPullL"],
    target: "C_CornerPullL_SharpCornerPullL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value : 0.5}] // Reduced from 1.0 to 0.7 (70% intensity)
  },
  {
    name: "CornerPullR_SharpCornerPullR",
    source: ["CTRL_expressions_mouthCornerPullR", "CTRL_expressions_mouthSharpCornerPullR"],
    target: "C_CornerPullR_SharpCornerPullR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value : 0.5}] // Reduced from 1.0 to 0.7 (70% intensity)
  },

  // ========== FUNNEL & CORNER PULL ==========
  {
    name: "FunnelUL_CornerPullL",
    source: ["CTRL_expressions_mouthCornerPullL", "CTRL_expressions_mouthFunnelUL"],
    target: "C_FunnelUL_CornerPullL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "FunnelUR_CornerPullR",
    source: ["CTRL_expressions_mouthCornerPullR", "CTRL_expressions_mouthFunnelUR"],
    target: "C_FunnelUR_CornerPullR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "FunnelDL_CornerPullL",
    source: ["CTRL_expressions_mouthCornerPullL", "CTRL_expressions_mouthFunnelDL"],
    target: "C_FunnelDL_CornerPullL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "FunnelDR_CornerPullR",
    source: ["CTRL_expressions_mouthCornerPullR", "CTRL_expressions_mouthFunnelDR"],
    target: "C_FunnelDR_CornerPullR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },

  // ========== LIPS PURSE & CORNER PULL ==========
  {
    name: "LipsPurseUL_CornerPullL",
    source: ["CTRL_expressions_mouthCornerPullL", "CTRL_expressions_mouthLipsPurseUL"],
    target: "C_LipsPurseUL_CornerPullL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "LipsPurseUR_CornerPullR",
    source: ["CTRL_expressions_mouthCornerPullR", "CTRL_expressions_mouthLipsPurseUR"],
    target: "C_LipsPurseUR_CornerPullR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "LipsPurseDL_CornerPullL",
    source: ["CTRL_expressions_mouthCornerPullL", "CTRL_expressions_mouthLipsPurseDL"],
    target: "C_LipsPurseDL_CornerPullL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "LipsPurseDR_CornerPullR",
    source: ["CTRL_expressions_mouthCornerPullR", "CTRL_expressions_mouthLipsPurseDR"],
    target: "C_LipsPurseDR_CornerPullR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "FunnelUL_LipsPurseUL_CornerPullL",
    source: ["CTRL_expressions_mouthCornerPullL", "CTRL_expressions_mouthLipsPurseUL", "CTRL_expressions_mouthFunnelUL"],
    target: "C_FunnelUL_LipsPurseUL_CornerPullL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "FunnelUR_LipsPurseUR_CornerPullR",
    source: ["CTRL_expressions_mouthCornerPullR", "CTRL_expressions_mouthLipsPurseUR", "CTRL_expressions_mouthFunnelUR"],
    target: "C_FunnelUR_LipsPurseUR_CornerPullR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "FunnelDL_LipsPurseDL_CornerPullL",
    source: ["CTRL_expressions_mouthCornerPullL", "CTRL_expressions_mouthLipsPurseDL", "CTRL_expressions_mouthFunnelDL"],
    target: "C_FunnelDL_LipsPurseDL_CornerPullL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "FunnelDR_LipsPurseDR_CornerPullR",
    source: ["CTRL_expressions_mouthCornerPullR", "CTRL_expressions_mouthLipsPurseDR", "CTRL_expressions_mouthFunnelDR"],
    target: "C_FunnelDR_LipsPurseDR_CornerPullR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },

  // ========== LIPS PURSE & FUNNEL ==========
  {
    name: "LipsPurseUL_FunnelUL",
    source: ["CTRL_expressions_mouthLipsPurseUL", "CTRL_expressions_mouthFunnelUL"],
    target: "C_LipsPurseUL_FunnelUL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "LipsPurseUR_FunnelUR",
    source: ["CTRL_expressions_mouthLipsPurseUR", "CTRL_expressions_mouthFunnelUR"],
    target: "C_LipsPurseUR_FunnelUR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "LipsPurseDL_FunnelDL",
    source: ["CTRL_expressions_mouthLipsPurseDL", "CTRL_expressions_mouthFunnelDL"],
    target: "C_LipsPurseDL_FunnelDL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "LipsPurseDR_FunnelDR",
    source: ["CTRL_expressions_mouthLipsPurseDR", "CTRL_expressions_mouthFunnelDR"],
    target: "C_LipsPurseDR_FunnelDR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },

  // ========== FUNNEL & CHIN RAISE ==========
  {
    name: "FunnelUL_ChinRaiseUL",
    source: ["CTRL_expressions_mouthFunnelUL", "CTRL_expressions_jawChinRaiseUL"],
    target: "C_FunnelUL_ChinRaiseUL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "FunnelUR_ChinRaiseUR",
    source: ["CTRL_expressions_mouthFunnelUR", "CTRL_expressions_jawChinRaiseUR"],
    target: "C_FunnelUR_ChinRaiseUR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },

  // ========== LIPS PURSE & LIPS TOWARDS ==========
  {
    name: "LipsPurseUL_LipsTowardsUL",
    source: ["CTRL_expressions_mouthLipsPurseUL", "CTRL_expressions_mouthLipsTowardsUL"],
    target: "C_LipsPurseUL_LipsTowardsUL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "LipsPurseUR_LipsTowardsUR",
    source: ["CTRL_expressions_mouthLipsPurseUR", "CTRL_expressions_mouthLipsTowardsUR"],
    target: "C_LipsPurseUR_LipsTowardsUR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "LipsPurseDL_LipsTowardsDL",
    source: ["CTRL_expressions_mouthLipsPurseDL", "CTRL_expressions_mouthLipsTowardsDL"],
    target: "C_LipsPurseDL_LipsTowardsDL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "LipsPurseDR_LipsTowardsDR",
    source: ["CTRL_expressions_mouthLipsPurseDR", "CTRL_expressions_mouthLipsTowardsDR"],
    target: "C_LipsPurseDR_LipsTowardsDR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "LipsPurseUL_LipsTowardsUL_FunnelUL",
    source: ["CTRL_expressions_mouthLipsPurseUL", "CTRL_expressions_mouthLipsTowardsUL", "CTRL_expressions_mouthFunnelUL"],
    target: "C_LipsPurseUL_LipsTowardsUL_FunnelUL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "LipsPurseUR_LipsTowardsUR_FunnelUR",
    source: ["CTRL_expressions_mouthLipsPurseUR", "CTRL_expressions_mouthLipsTowardsUR", "CTRL_expressions_mouthFunnelUR"],
    target: "C_LipsPurseUR_LipsTowardsUR_FunnelUR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "LipsPurseDL_LipsTowardsDL_FunnelDL",
    source: ["CTRL_expressions_mouthLipsPurseDL", "CTRL_expressions_mouthLipsTowardsDL", "CTRL_expressions_mouthFunnelDL"],
    target: "C_LipsPurseDL_LipsTowardsDL_FunnelDL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "LipsPurseDR_LipsTowardsDR_FunnelDR",
    source: ["CTRL_expressions_mouthLipsPurseDR", "CTRL_expressions_mouthLipsTowardsDR", "CTRL_expressions_mouthFunnelDR"],
    target: "C_LipsPurseDR_LipsTowardsDR_FunnelDR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },

  // ========== LIPS PURSE & LIPS TOGETHER ==========
  {
    name: "LipsPurseUL_LipsTogetherUL",
    source: ["CTRL_expressions_mouthLipsPurseUL", "CTRL_expressions_mouthLipsTogetherUL"],
    target: "C_LipsPurseUL_LipsTogetherUL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value : 0.5}] // Reduced from 1.0 to 0.7 (70% intensity)
  },
  {
    name: "LipsPurseUR_LipsTogetherUR",
    source: ["CTRL_expressions_mouthLipsPurseUR", "CTRL_expressions_mouthLipsTogetherUR"],
    target: "C_LipsPurseUR_LipsTogetherUR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value : 0.5}] // Reduced from 1.0 to 0.7 (70% intensity)
  },
  {
    name: "LipsPurseDL_LipsTogetherDL",
    source: ["CTRL_expressions_mouthLipsPurseDL", "CTRL_expressions_mouthLipsTogetherDL"],
    target: "C_LipsPurseDL_LipsTogetherDL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value : 0.5}] // Reduced from 1.0 to 0.7 (70% intensity)
  },
  {
    name: "LipsPurseDR_LipsTogetherDR",
    source: ["CTRL_expressions_mouthLipsPurseDR", "CTRL_expressions_mouthLipsTogetherDR"],
    target: "C_LipsPurseDR_LipsTogetherDR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value : 0.5}] // Reduced from 1.0 to 0.7 (70% intensity)
  },

  // ========== FUNNEL & UPPER/LOWER LIP ==========
  {
    name: "FunnelUL_UpperLipRaiseL",
    source: ["CTRL_expressions_mouthFunnelUL", "CTRL_expressions_mouthUpperLipRaiseL"],
    target: "C_FunnelUL_UpperLipRaiseL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value : 0.5}] // Reduced from 1.0 to 0.7 (70% intensity)
  },
  {
    name: "FunnelUR_UpperLipRaiseR",
    source: ["CTRL_expressions_mouthFunnelUR", "CTRL_expressions_mouthUpperLipRaiseR"],
    target: "C_FunnelUR_UpperLipRaiseR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value : 0.5}] // Reduced from 1.0 to 0.7 (70% intensity)
  },
  {
    name: "FunnelDL_LowerLipDepressL",
    source: ["CTRL_expressions_mouthFunnelDL", "CTRL_expressions_mouthLowerLipDepressL"],
    target: "C_FunnelDL_LowerLipDepressL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value : 0.5}] // Reduced from 1.0 to 0.7 (70% intensity)
  },
  {
    name: "FunnelDR_LowerLipDepressR",
    source: ["CTRL_expressions_mouthFunnelDR", "CTRL_expressions_mouthLowerLipDepressR"],
    target: "C_FunnelDR_LowerLipDepressR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value : 0.5}] // Reduced from 1.0 to 0.7 (70% intensity)
  },

  // ========== FUNNEL & LIPS TOWARDS ==========
  {
    name: "FunnelUL_LipsTowardsUL",
    source: ["CTRL_expressions_mouthFunnelUL", "CTRL_expressions_mouthLipsTowardsUL"],
    target: "C_FunnelUL_LipsTowardsUL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "FunnelUR_LipsTowardsUR",
    source: ["CTRL_expressions_mouthFunnelUR", "CTRL_expressions_mouthLipsTowardsUR"],
    target: "C_FunnelUR_LipsTowardsUR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "FunnelDL_LipsTowardsDL",
    source: ["CTRL_expressions_mouthFunnelDL", "CTRL_expressions_mouthLipsTowardsDL"],
    target: "C_FunnelDL_LipsTowardsDL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "FunnelDR_LipsTowardsDR",
    source: ["CTRL_expressions_mouthFunnelDR", "CTRL_expressions_mouthLipsTowardsDR"],
    target: "C_FunnelDR_LipsTowardsDR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },

  // ========== STRETCH COMBINATIONS ==========
  {
    name: "StretchL_LowerLipDepressL",
    source: ["CTRL_expressions_mouthStretchL", "CTRL_expressions_mouthLowerLipDepressL"],
    target: "C_StretchL_LowerLipDepressL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "StretchR_LowerLipDepressR",
    source: ["CTRL_expressions_mouthStretchR", "CTRL_expressions_mouthLowerLipDepressR"],
    target: "C_StretchR_LowerLipDepressR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "StretchL_StretchR",
    source: ["CTRL_expressions_mouthStretchL", "CTRL_expressions_mouthStretchR"],
    target: "C_StretchL_StretchR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "StretchL_LowerLipBite_L",
    source: ["CTRL_expressions_mouthStretchL", "CTRL_expressions_mouthLowerLipBiteL"],
    target: "C_StretchL_LowerLipBite_L",
    mode: "Add",
    curve: [{time: 0, value: -0.003497}, {time: 1, value: 1}]
  },
  {
    name: "StretchR_LowerLipBite_R",
    source: ["CTRL_expressions_mouthStretchR", "CTRL_expressions_mouthLowerLipBiteR"],
    target: "C_StretchR_LowerLipBite_R",
    mode: "Add",
    curve: [{time: 0, value: -0.003497}, {time: 1, value: 1}]
  },

  // ========== JAW OPEN COMBINATIONS ==========
  {
    name: "CornerPullL_JawOpen",
    source: ["CTRL_expressions_jawOpen", "CTRL_expressions_mouthCornerPullL"],
    target: "C_CornerPullL_JawOpen",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "CornerPullR_JawOpen",
    source: ["CTRL_expressions_jawOpen", "CTRL_expressions_mouthCornerPullR"],
    target: "C_CornerPullR_JawOpen",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "CornerPullL_JawOpen_LowerLipDepressL",
    source: ["CTRL_expressions_mouthCornerPullL", "CTRL_expressions_jawOpen", "CTRL_expressions_mouthLowerLipDepressL"],
    target: "C_CornerPullL_JawOpen_LowerLipDepressL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "CornerPullR_JawOpen_LowerLipDepressR",
    source: ["CTRL_expressions_mouthCornerPullR", "CTRL_expressions_jawOpen", "CTRL_expressions_mouthLowerLipDepressR"],
    target: "C_CornerPullR_JawOpen_LowerLipDepressR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "LipsPurseDL_JawOpen",
    source: ["CTRL_expressions_mouthLipsPurseDL", "CTRL_expressions_jawOpen"],
    target: "C_LipsPurseDL_JawOpen",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value : 0.5}] // Reduced from 1.0 to 0.7 (70% intensity)
  },
  {
    name: "LipsPurseDR_JawOpen",
    source: ["CTRL_expressions_mouthLipsPurseDR", "CTRL_expressions_jawOpen"],
    target: "C_LipsPurseDR_JawOpen",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value : 0.5}] // Reduced from 1.0 to 0.7 (70% intensity)
  },
  {
    name: "LipsPurseUL_JawOpen",
    source: ["CTRL_expressions_mouthLipsPurseUL", "CTRL_expressions_jawOpen"],
    target: "C_LipsPurseUL_JawOpen",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value : 0.5}] // Reduced from 1.0 to 0.7 (70% intensity)
  },
  {
    name: "LipsPurseUR_JawOpen",
    source: ["CTRL_expressions_mouthLipsPurseUR", "CTRL_expressions_jawOpen"],
    target: "C_LipsPurseUR_JawOpen",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value : 0.5}] // Reduced from 1.0 to 0.7 (70% intensity)
  },
  {
    name: "StretchL_LowerLipDepressL_JawOpen",
    source: ["CTRL_expressions_mouthStretchL", "CTRL_expressions_mouthLowerLipDepressL", "CTRL_expressions_jawOpen"],
    target: "C_StretchL_LowerLipDepressL_JawOpen",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "StretchR_LowerLipDepressR_JawOpen",
    source: ["CTRL_expressions_mouthStretchR", "CTRL_expressions_mouthLowerLipDepressR", "CTRL_expressions_jawOpen"],
    target: "C_StretchR_LowerLipDepressR_JawOpen",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "StretchL_JawOpen",
    source: ["CTRL_expressions_mouthStretchL", "CTRL_expressions_jawOpen"],
    target: "C_StretchL_JawOpen",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "StretchR_JawOpen",
    source: ["CTRL_expressions_mouthStretchR", "CTRL_expressions_jawOpen"],
    target: "C_StretchR_JawOpen",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },

  // ========== LIP DEPRESS & RAISE ==========
  {
    name: "LowerLipDepressL_LowerLipDepressR",
    source: ["CTRL_expressions_mouthLowerLipDepressL", "CTRL_expressions_mouthLowerLipDepressR"],
    target: "C_LowerLipDepressL_LowerLipDepressR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "UpperLipRaiseL_UpperLipRaiseR",
    source: ["CTRL_expressions_mouthUpperLipRaiseL", "CTRL_expressions_mouthUpperLipRaiseR"],
    target: "C_UpperLipRaiseL_UpperLipRaiseR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },

  // ========== COMPLEX JAW OPEN COMBINATIONS ==========
  {
    name: "CornerPullL_StretchL_JawOpen",
    source: ["CTRL_expressions_mouthCornerPullL", "CTRL_expressions_mouthStretchL", "CTRL_expressions_jawOpen"],
    target: "C_CornerPullL_StretchL_JawOpen",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "CornerPullR_StretchR_JawOpen",
    source: ["CTRL_expressions_mouthCornerPullR", "CTRL_expressions_mouthStretchR", "CTRL_expressions_jawOpen"],
    target: "C_CornerPullR_StretchR_JawOpen",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "CornerPullRL_StretchRL_JawOpen",
    source: ["CTRL_expressions_mouthCornerPullR", "CTRL_expressions_mouthStretchR", "CTRL_expressions_jawOpen", "CTRL_expressions_mouthStretchL", "CTRL_expressions_mouthCornerPullL"],
    target: "C_CornerPullRL_StretchRL_JawOpen",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "CornerPullRL_StretchRL_JawOpen_LowerLipDepressRL",
    source: ["CTRL_expressions_mouthCornerPullR", "CTRL_expressions_mouthStretchR", "CTRL_expressions_jawOpen", "CTRL_expressions_mouthStretchL", "CTRL_expressions_mouthCornerPullL", "CTRL_expressions_mouthLowerLipDepressL", "CTRL_expressions_mouthLowerLipDepressR"],
    target: "C_CornerPullRL_StretchRL_JawOpen_LowerLipDepressRL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },

  // ========== LIP BITE & JAW OPEN ==========
  {
    name: "UpperLipBiteL_JawOpen",
    source: ["CTRL_expressions_mouthUpperLipBiteL", "CTRL_expressions_jawOpen"],
    target: "C_UpperLipBiteL_JawOpen",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "UpperLipBiteR_JawOpen",
    source: ["CTRL_expressions_mouthUpperLipBiteR", "CTRL_expressions_jawOpen"],
    target: "C_UpperLipBiteR_JawOpen",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "LowerLipBiteL_JawOpen",
    source: ["CTRL_expressions_mouthLowerLipBiteL", "CTRL_expressions_jawOpen"],
    target: "C_LowerLipBiteL_JawOpen",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "LowerLipBiteR_JawOpen",
    source: ["CTRL_expressions_mouthLowerLipBiteR", "CTRL_expressions_jawOpen"],
    target: "C_LowerLipBiteR_JawOpen",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },

  // ========== PRESS & JAW OPEN ==========
  {
    name: "PressUL_JawOpen",
    source: ["CTRL_expressions_mouthPressUL", "CTRL_expressions_jawOpen"],
    target: "C_PressUL_JawOpen",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value : 0.5}] // Reduced from 1.0 to 0.7 (70% intensity)
  },
  {
    name: "PressUR_JawOpen",
    source: ["CTRL_expressions_mouthPressUR", "CTRL_expressions_jawOpen"],
    target: "C_PressUR_JawOpen",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value : 0.5}] // Reduced from 1.0 to 0.7 (70% intensity)
  },
  {
    name: "PressDL_JawOpen",
    source: ["CTRL_expressions_mouthPressDL", "CTRL_expressions_jawOpen"],
    target: "C_PressDL_JawOpen",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value : 0.5}] // Reduced from 1.0 to 0.7 (70% intensity)
  },
  {
    name: "PressDR_JawOpen",
    source: ["CTRL_expressions_mouthPressDR", "CTRL_expressions_jawOpen"],
    target: "C_PressDR_JawOpen",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value : 0.5}] // Reduced from 1.0 to 0.7 (70% intensity)
  },

  // ========== DIMPLE COMBINATIONS ==========
  {
    name: "DimpleL_UpperLipRaiseL",
    source: ["CTRL_expressions_mouthDimpleL", "CTRL_expressions_mouthUpperLipRaiseL"],
    target: "C_DimpleL_UpperLipRaiseL",
    mode: "Add",
    curve: [{time: 0, value: -0.003497}, {time: 1, value: 1}]
  },
  {
    name: "DimpleR_UpperLipRaiseR",
    source: ["CTRL_expressions_mouthDimpleR", "CTRL_expressions_mouthUpperLipRaiseR"],
    target: "C_DimpleR_UpperLipRaiseR",
    mode: "Add",
    curve: [{time: 0, value: -0.003497}, {time: 1, value: 1}]
  },
  {
    name: "DimpleL_LowerLipDepressL",
    source: ["CTRL_expressions_mouthDimpleL", "CTRL_expressions_mouthLowerLipDepressL"],
    target: "C_DimpleL_LowerLipDepressL",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "DimpleR_LowerLipDepressR",
    source: ["CTRL_expressions_mouthDimpleR", "CTRL_expressions_mouthLowerLipDepressR"],
    target: "C_DimpleR_LowerLipDepressR",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "DimpleL_JawOpen",
    source: ["CTRL_expressions_jawOpen", "CTRL_expressions_mouthDimpleL"],
    target: "C_DimpleL_JawOpen",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "DimpleR_JawOpen",
    source: ["CTRL_expressions_jawOpen", "CTRL_expressions_mouthDimpleR"],
    target: "C_DimpleR_JawOpen",
    mode: "Add",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },

  // ========== LIMIT MODE MAPPINGS ==========
  {
    name: "EyeLidPress_Blink_L",
    source: ["CTRL_expressions_eyeBlinkL"],
    target: "CTRL_expressions_eyeLidPressL",
    mode: "Limit",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "EyeLidPress_Blink_R",
    source: ["CTRL_expressions_eyeBlinkR"],
    target: "CTRL_expressions_eyeLidPressR",
    mode: "Limit",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "NoseWinkleUpper_L",
    source: ["CTRL_expressions_noseWrinkleL"],
    target: "CTRL_expressions_noseWrinkleUpperL",
    mode: "Limit",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "NoseWinkleUpper_R",
    source: ["CTRL_expressions_noseWrinkleR"],
    target: "CTRL_expressions_noseWrinkleUpperR",
    mode: "Limit",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "MouthStretchLipClose_Stretch_L",
    source: ["CTRL_expressions_mouthStretchL"],
    target: "CTRL_expressions_mouthStretchLipsCloseL",
    mode: "Limit",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "MouthStretchLipClose_Stretch_R",
    source: ["CTRL_expressions_mouthStretchR"],
    target: "CTRL_expressions_mouthStretchLipsCloseR",
    mode: "Limit",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "JawOpenExtreme_JawOpen",
    source: ["CTRL_expressions_jawOpen"],
    target: "CTRL_expressions_jawOpenExtreme",
    mode: "Limit",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "MouthLipsTogetherUL_JawOpen",
    source: ["CTRL_expressions_jawOpen"],
    target: "CTRL_expressions_mouthLipsTogetherUL",
    mode: "Limit",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "MouthLipsTogetherUR_JawOpen",
    source: ["CTRL_expressions_jawOpen"],
    target: "CTRL_expressions_mouthLipsTogetherUR",
    mode: "Limit",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "MouthLipsTogetherDL_JawOpen",
    source: ["CTRL_expressions_jawOpen"],
    target: "CTRL_expressions_mouthLipsTogetherDL",
    mode: "Limit",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
  {
    name: "MouthLipsTogetherDR_JawOpen",
    source: ["CTRL_expressions_jawOpen"],
    target: "CTRL_expressions_mouthLipsTogetherDR",
    mode: "Limit",
    curve: [{time: 0, value: 0}, {time: 1, value: 1}]
  },
];

/**
 * Helper function to convert MetaHuman blendshapes to CC5 format
 * 
 * @param {Object} metahumanBlendshapes - Object with CTRL_expressions_* keys and numeric values (0-1)
 * @param {Object} options - Optional configuration
 * @param {number} options.teethDownOffset - Constant offset for hiding lower teeth (default: 0.3)
 * @returns {Object} CC5 blendshapes with C_* or CTRL_expressions_* keys and calculated values
 */
export function convertMetaHumanToCC5(metahumanBlendshapes, options = {}) {
  const { teethDownOffset = 0} = options;
  const cc5Blendshapes = {};

  METAHUMAN_TO_CC5_MAPPING.forEach(mapping => {
    const { name, source, target, mode, curve } = mapping;

    // Calculate the combined value from source channels
    let value = 0;

    if (mode === "Add") {
      // Add mode: multiply all source values together
      value = source.reduce((product, sourceKey) => {
        const sourceValue = metahumanBlendshapes[sourceKey] || 0;
        return product * sourceValue;
      }, 1);
    } else if (mode === "Limit") {
      // Limit mode: first value is the limit, other values are capped by it and multiplied
      const limit = metahumanBlendshapes[source[0]] || 0;
      
      if (source.length === 1) {
        // If only one source, just pass it through
        value = limit;
      } else {
        // Cap each subsequent value by the limit and multiply them together
        value = source.slice(1).reduce((product, sourceKey) => {
          const sourceValue = metahumanBlendshapes[sourceKey] || 0;
          const limitedValue = Math.min(limit, sourceValue);
          return product * limitedValue;
        }, 1);
      }
    }

    // Apply curve evaluation if curve is defined
    if (curve && curve.length > 0) {
      value = evaluateCurve(curve, value);
    }

    // Set or accumulate the target blendshape value
    // If target already exists, take the maximum (Unreal uses multiplication for combination)
    if (cc5Blendshapes[target] !== undefined) {
      // Multiple mappings write to same target - multiply them
      cc5Blendshapes[target] *= value;
    } else {
      cc5Blendshapes[target] = value;
    }
  });

  // Apply constant offsets for teeth visibility control
  // These corrective blendshapes help hide lower teeth and lower the tongue while talking
  const teethCorrectives = [
    'C_FunnelDL_LowerLipDepressL',
    'C_FunnelDR_LowerLipDepressR'
  ];

  teethCorrectives.forEach(target => {
    if (cc5Blendshapes[target] !== undefined) {
      // Add offset to existing value, clamped to [0, 1]
      cc5Blendshapes[target] = Math.min(1.0, cc5Blendshapes[target] + teethDownOffset);
    } else {
      // Set base offset value
      cc5Blendshapes[target] = teethDownOffset;
    }
  });

  return cc5Blendshapes;
}

/**
 * Get all MetaHuman source channel names
 * @returns {Array<string>} Array of CTRL_expressions_* channel names
 */
export function getMetaHumanChannelNames() {
  const channels = new Set();
  METAHUMAN_TO_CC5_MAPPING.forEach(mapping => {
    mapping.source.forEach(channel => channels.add(channel));
  });
  return Array.from(channels).sort();
}

/**
 * Get all CC5 target channel names
 * @returns {Array<string>} Array of C_* or CTRL_expressions_* (for Limit mode) channel names
 */
export function getCC5ChannelNames() {
  return METAHUMAN_TO_CC5_MAPPING.map(mapping => mapping.target).sort();
}

/**
 * Get mapping count statistics
 * @returns {Object} Statistics about the mappings
 */
export function getMappingStats() {
  const addCount = METAHUMAN_TO_CC5_MAPPING.filter(m => m.mode === "Add").length;
  const limitCount = METAHUMAN_TO_CC5_MAPPING.filter(m => m.mode === "Limit").length;
  
  return {
    total: METAHUMAN_TO_CC5_MAPPING.length,
    add: addCount,
    limit: limitCount,
    sourceChannels: getMetaHumanChannelNames().length,
    targetChannels: getCC5ChannelNames().length,
  };
}
