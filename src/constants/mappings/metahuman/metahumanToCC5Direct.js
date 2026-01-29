/**
 * MetaHuman to CC5 Direct (1:1) Mapping
 * 
 * This is a simple 1:1 mapping from MetaHuman control expressions (CTRL_expressions_*)
 * to CC5 base blendshapes (without C_ prefix).
 * 
 * Use this when you want to directly map incoming MetaHuman blendshape values
 * to CC5 without any corrective combinations.
 * 
 * This differs from metahumanToCC5.js which handles complex corrective combinations
 * (e.g., C_BlinkL_LookDownL which multiplies multiple sources together).
 * 
 * Usage:
 * - Iterate through incoming MetaHuman blendshapes (keys)
 * - Look up the corresponding CC5 blendshape name (values)
 * - Apply the weight directly
 */

export const METAHUMAN_TO_CC5_DIRECT_MAPPING = {
  "CTRL_expressions_browDownL": "Brow_Down_L",
  "CTRL_expressions_browDownR": "Brow_Down_R",
  "CTRL_expressions_browLateralL": "Brow_Lateral_L",
  "CTRL_expressions_browLateralR": "Brow_Lateral_R",
  "CTRL_expressions_browRaiseInL": "Brow_Raise_In_L",
  "CTRL_expressions_browRaiseInR": "Brow_Raise_In_R",
  "CTRL_expressions_browRaiseOuterL": "Brow_Raise_Outer_L",
  "CTRL_expressions_browRaiseOuterR": "Brow_Raise_Outer_R",
  "CTRL_expressions_earUpL": "Ear_Up_L",
  "CTRL_expressions_earUpR": "Ear_Up_R",
  "CTRL_expressions_eyeBlinkL": "Eye_Blink_L",
  "CTRL_expressions_eyeBlinkR": "Eye_Blink_R",
  "CTRL_expressions_eyeCheekRaiseL": "Eye_Cheek_Raise_L",
  "CTRL_expressions_eyeCheekRaiseR": "Eye_Cheek_Raise_R",
  "CTRL_expressions_eyeFaceScrunchL": "Eye_Face_Scrunch_L",
  "CTRL_expressions_eyeFaceScrunchR": "Eye_Face_Scrunch_R",
  "CTRL_expressions_eyeLidPressL": "Eye_Lid_Press_L",
  "CTRL_expressions_eyeLidPressR": "Eye_Lid_Press_R",
  "CTRL_expressions_eyeLookDownL": "Eye_Look_Down_L",
  "CTRL_expressions_eyeLookDownR": "Eye_Look_Down_R",
  "CTRL_expressions_eyeLookLeftL": "Eye_Look_Left_L",
  "CTRL_expressions_eyeLookLeftR": "Eye_Look_Left_R",
  "CTRL_expressions_eyeLookRightL": "Eye_Look_Right_L",
  "CTRL_expressions_eyeLookRightR": "Eye_Look_Right_R",
  "CTRL_expressions_eyeLookUpL": "Eye_Look_Up_L",
  "CTRL_expressions_eyeLookUpR": "Eye_Look_Up_R",
  "CTRL_expressions_eyeLowerLidDownL": "Eye_LowerLid_Down_L",
  "CTRL_expressions_eyeLowerLidDownR": "Eye_LowerLid_Down_R",
  "CTRL_expressions_eyeLowerLidUpL": "Eye_LowerLid_Up_L",
  "CTRL_expressions_eyeLowerLidUpR": "Eye_LowerLid_Up_R",
  "CTRL_expressions_eyeParallelLookDirection": "Eye_Parallel_Look_Direction",
  "CTRL_expressions_eyeRelaxL": "Eye_Relax_L",
  "CTRL_expressions_eyeRelaxR": "Eye_Relax_R",
  "CTRL_expressions_eyeSquintInnerL": "Eye_Squint_Inner_L",
  "CTRL_expressions_eyeSquintInnerR": "Eye_Squint_Inner_R",
  "CTRL_expressions_eyeUpperLidUpL": "Eye_UpperLid_Up_L",
  "CTRL_expressions_eyeUpperLidUpR": "Eye_UpperLid_Up_R",
  "CTRL_expressions_eyeWidenL": "Eye_Widen_L",
  "CTRL_expressions_eyeWidenR": "Eye_Widen_R",
  "CTRL_expressions_eyelashesDownINL": "Eyelashes_Down_IN_L",
  "CTRL_expressions_eyelashesDownINR": "Eyelashes_Down_IN_R",
  "CTRL_expressions_eyelashesDownOUTL": "Eyelashes_Down_OUT_L",
  "CTRL_expressions_eyelashesDownOUTR": "Eyelashes_Down_OUT_R",
  "CTRL_expressions_eyelashesUpINL": "Eyelashes_Up_IN_L",
  "CTRL_expressions_eyelashesUpINR": "Eyelashes_Up_IN_R",
  "CTRL_expressions_eyelashesUpOUTL": "Eyelashes_Up_OUT_L",
  "CTRL_expressions_eyelashesUpOUTR": "Eyelashes_Up_OUT_R",
  "CTRL_expressions_jawBack": "Jaw_Back",
  "CTRL_expressions_jawChinCompressL": "Jaw_Chin_Compress_L",
  "CTRL_expressions_jawChinCompressR": "Jaw_Chin_Compress_R",
  "CTRL_expressions_jawChinRaiseDL": "Jaw_Chin_Raise_DL",
  "CTRL_expressions_jawChinRaiseDR": "Jaw_Chin_Raise_DR",
  "CTRL_expressions_jawChinRaiseUL": "Jaw_Chin_Raise_UL",
  "CTRL_expressions_jawChinRaiseUR": "Jaw_Chin_Raise_UR",
  "CTRL_expressions_jawClenchL": "Jaw_Clench_L",
  "CTRL_expressions_jawClenchR": "Jaw_Clench_R",
  "CTRL_expressions_jawFwd": "Jaw_Fwd",
  "CTRL_expressions_jawLeft": "Jaw_Left",
  "CTRL_expressions_jawOpen": "Jaw_Open",
  "CTRL_expressions_jawOpenExtreme": "Jaw_Open_Extreme",
  "CTRL_expressions_jawRight": "Jaw_Right",
  "CTRL_expressions_mouthCheekBlowL": "Mouth_Cheek_Blow_L",
  "CTRL_expressions_mouthCheekBlowR": "Mouth_Cheek_Blow_R",
  "CTRL_expressions_mouthCheekSuckL": "Mouth_Cheek_Suck_L",
  "CTRL_expressions_mouthCheekSuckR": "Mouth_Cheek_Suck_R",
  "CTRL_expressions_mouthCornerDepressL": "Mouth_Corner_Depress_L",
  "CTRL_expressions_mouthCornerDepressR": "Mouth_Corner_Depress_R",
  "CTRL_expressions_mouthCornerDownL": "Mouth_Corner_Down_L",
  "CTRL_expressions_mouthCornerDownR": "Mouth_Corner_Down_R",
  "CTRL_expressions_mouthCornerNarrowL": "Mouth_Corner_Narrow_L",
  "CTRL_expressions_mouthCornerNarrowR": "Mouth_Corner_Narrow_R",
  "CTRL_expressions_mouthCornerPullL": "Mouth_Corner_Pull_L",
  "CTRL_expressions_mouthCornerPullR": "Mouth_Corner_Pull_R",
  "CTRL_expressions_mouthCornerRounderDL": "Mouth_Corner_Rounder_DL",
  "CTRL_expressions_mouthCornerRounderDR": "Mouth_Corner_Rounder_DR",
  "CTRL_expressions_mouthCornerRounderUL": "Mouth_Corner_Rounder_UL",
  "CTRL_expressions_mouthCornerRounderUR": "Mouth_Corner_Rounder_UR",
  "CTRL_expressions_mouthCornerSharpenDL": "Mouth_Corner_Sharpen_DL",
  "CTRL_expressions_mouthCornerSharpenDR": "Mouth_Corner_Sharpen_DR",
  "CTRL_expressions_mouthCornerSharpenUL": "Mouth_Corner_Sharpen_UL",
  "CTRL_expressions_mouthCornerSharpenUR": "Mouth_Corner_Sharpen_UR",
  "CTRL_expressions_mouthCornerUpL": "Mouth_Corner_Up_L",
  "CTRL_expressions_mouthCornerUpR": "Mouth_Corner_Up_R",
  "CTRL_expressions_mouthCornerWideL": "Mouth_Corner_Wide_L",
  "CTRL_expressions_mouthCornerWideR": "Mouth_Corner_Wide_R",
  "CTRL_expressions_mouthDimpleL": "Mouth_Dimple_L",
  "CTRL_expressions_mouthDimpleR": "Mouth_Dimple_R",
  "CTRL_expressions_mouthDown": "Mouth_Down",
  "CTRL_expressions_mouthFunnelDL": "Mouth_Funnel_DL",
  "CTRL_expressions_mouthFunnelDR": "Mouth_Funnel_DR",
  "CTRL_expressions_mouthFunnelUL": "Mouth_Funnel_UL",
  "CTRL_expressions_mouthFunnelUR": "Mouth_Funnel_UR",
  "CTRL_expressions_mouthLeft": "Mouth_Left",
  "CTRL_expressions_mouthLipsBlowL": "Mouth_Lips_Blow_L",
  "CTRL_expressions_mouthLipsBlowR": "Mouth_Lips_Blow_R",
  "CTRL_expressions_mouthLipsPressL": "Mouth_Lips_Press_L",
  "CTRL_expressions_mouthLipsPressR": "Mouth_Lips_Press_R",
  "CTRL_expressions_mouthLipsPullDL": "Mouth_Lips_Pull_DL",
  "CTRL_expressions_mouthLipsPullDR": "Mouth_Lips_Pull_DR",
  "CTRL_expressions_mouthLipsPullUL": "Mouth_Lips_Pull_UL",
  "CTRL_expressions_mouthLipsPullUR": "Mouth_Lips_Pull_UR",
  "CTRL_expressions_mouthLipsPurseDL": "Mouth_Lips_Purse_DL",
  "CTRL_expressions_mouthLipsPurseDR": "Mouth_Lips_Purse_DR",
  "CTRL_expressions_mouthLipsPurseUL": "Mouth_Lips_Purse_UL",
  "CTRL_expressions_mouthLipsPurseUR": "Mouth_Lips_Purse_UR",
  "CTRL_expressions_mouthLipsPushDL": "Mouth_Lips_Push_DL",
  "CTRL_expressions_mouthLipsPushDR": "Mouth_Lips_Push_DR",
  "CTRL_expressions_mouthLipsPushUL": "Mouth_Lips_Push_UL",
  "CTRL_expressions_mouthLipsPushUR": "Mouth_Lips_Push_UR",
  "CTRL_expressions_mouthLipsStickyLPh1": "Mouth_Lips_Sticky_L_Ph1",
  "CTRL_expressions_mouthLipsStickyLPh2": "Mouth_Lips_Sticky_L_Ph2",
  "CTRL_expressions_mouthLipsStickyLPh3": "Mouth_Lips_Sticky_L_Ph3",
  "CTRL_expressions_mouthLipsStickyRPh1": "Mouth_Lips_Sticky_R_Ph1",
  "CTRL_expressions_mouthLipsStickyRPh2": "Mouth_Lips_Sticky_R_Ph2",
  "CTRL_expressions_mouthLipsStickyRPh3": "Mouth_Lips_Sticky_R_Ph3",
  "CTRL_expressions_mouthLipsThickDL": "Mouth_Lips_Thick_DL",
  "CTRL_expressions_mouthLipsThickDR": "Mouth_Lips_Thick_DR",
  "CTRL_expressions_mouthLipsThickInwardDL": "Mouth_Lips_Thick_Inward_DL",
  "CTRL_expressions_mouthLipsThickInwardDR": "Mouth_Lips_Thick_Inward_DR",
  "CTRL_expressions_mouthLipsThickInwardUL": "Mouth_Lips_Thick_Inward_UL",
  "CTRL_expressions_mouthLipsThickInwardUR": "Mouth_Lips_Thick_Inward_UR",
  "CTRL_expressions_mouthLipsThickUL": "Mouth_Lips_Thick_UL",
  "CTRL_expressions_mouthLipsThickUR": "Mouth_Lips_Thick_UR",
  "CTRL_expressions_mouthLipsThinDL": "Mouth_Lips_Thin_DL",
  "CTRL_expressions_mouthLipsThinDR": "Mouth_Lips_Thin_DR",
  "CTRL_expressions_mouthLipsThinInwardDL": "Mouth_Lips_Thin_Inward_DL",
  "CTRL_expressions_mouthLipsThinInwardDR": "Mouth_Lips_Thin_Inward_DR",
  "CTRL_expressions_mouthLipsThinInwardUL": "Mouth_Lips_Thin_Inward_UL",
  "CTRL_expressions_mouthLipsThinInwardUR": "Mouth_Lips_Thin_Inward_UR",
  "CTRL_expressions_mouthLipsThinUL": "Mouth_Lips_Thin_UL",
  "CTRL_expressions_mouthLipsThinUR": "Mouth_Lips_Thin_UR",
  "CTRL_expressions_mouthLipsTightenDL": "Mouth_Lips_Tighten_DL",
  "CTRL_expressions_mouthLipsTightenDR": "Mouth_Lips_Tighten_DR",
  "CTRL_expressions_mouthLipsTightenUL": "Mouth_Lips_Tighten_UL",
  "CTRL_expressions_mouthLipsTightenUR": "Mouth_Lips_Tighten_UR",
  "CTRL_expressions_mouthLipsTogetherDL": "Mouth_Lips_Together_DL",
  "CTRL_expressions_mouthLipsTogetherDR": "Mouth_Lips_Together_DR",
  "CTRL_expressions_mouthLipsTogetherUL": "Mouth_Lips_Together_UL",
  "CTRL_expressions_mouthLipsTogetherUR": "Mouth_Lips_Together_UR",
  "CTRL_expressions_mouthLipsTowardsDL": "Mouth_Lips_Towards_DL",
  "CTRL_expressions_mouthLipsTowardsDR": "Mouth_Lips_Towards_DR",
  "CTRL_expressions_mouthLipsTowardsUL": "Mouth_Lips_Towards_UL",
  "CTRL_expressions_mouthLipsTowardsUR": "Mouth_Lips_Towards_UR",
  "CTRL_expressions_mouthLowerLipBiteL": "Mouth_LowerLip_Bite_L",
  "CTRL_expressions_mouthLowerLipBiteR": "Mouth_LowerLip_Bite_R",
  "CTRL_expressions_mouthLowerLipDepressL": "Mouth_LowerLip_Depress_L",
  "CTRL_expressions_mouthLowerLipDepressR": "Mouth_LowerLip_Depress_R",
  "CTRL_expressions_mouthLowerLipRollInL": "Mouth_LowerLip_RollIn_L",
  "CTRL_expressions_mouthLowerLipRollInR": "Mouth_LowerLip_RollIn_R",
  "CTRL_expressions_mouthLowerLipRollOutL": "Mouth_LowerLip_Roll_Out_L",
  "CTRL_expressions_mouthLowerLipRollOutR": "Mouth_LowerLip_Roll_Out_R",
  "CTRL_expressions_mouthLowerLipShiftLeft": "Mouth_LowerLip_Shift_Left",
  "CTRL_expressions_mouthLowerLipShiftRight": "Mouth_LowerLip_Shift_Right",
  "CTRL_expressions_mouthLowerLipTowardsTeethL": "Mouth_LowerLip_Towards_Teeth_L",
  "CTRL_expressions_mouthLowerLipTowardsTeethR": "Mouth_LowerLip_Towards_Teeth_R",
  "CTRL_expressions_mouthPressDL": "Mouth_Mouth_Press_DL",
  "CTRL_expressions_mouthPressDR": "Mouth_Mouth_Press_DR",
  "CTRL_expressions_mouthPressUL": "Mouth_Mouth_Press_UL",
  "CTRL_expressions_mouthPressUR": "Mouth_Mouth_Press_UR",
  "CTRL_expressions_mouthRight": "Mouth_Right",
  "CTRL_expressions_mouthSharpCornerPullL": "Mouth_SharpCorner_Pull_L",
  "CTRL_expressions_mouthSharpCornerPullR": "Mouth_SharpCorner_Pull_R",
  "CTRL_expressions_mouthStickyDC": "Mouth_Sticky_DC",
  "CTRL_expressions_mouthStickyDINL": "Mouth_Sticky_D_IN_L",
  "CTRL_expressions_mouthStickyDINR": "Mouth_Sticky_D_IN_R",
  "CTRL_expressions_mouthStickyDOUTL": "Mouth_Sticky_D_OUT_L",
  "CTRL_expressions_mouthStickyDOUTR": "Mouth_Sticky_D_OUT_R",
  "CTRL_expressions_mouthStickyUC": "Mouth_Sticky_UC",
  "CTRL_expressions_mouthStickyUINL": "Mouth_Sticky_U_IN_L",
  "CTRL_expressions_mouthStickyUINR": "Mouth_Sticky_U_IN_R",
  "CTRL_expressions_mouthStickyUOUTL": "Mouth_Sticky_U_OUT_L",
  "CTRL_expressions_mouthStickyUOUTR": "Mouth_Sticky_U_OUT_R",
  "CTRL_expressions_mouthStretchL": "Mouth_Stretch_L",
  "CTRL_expressions_mouthStretchLipsCloseL": "Mouth_StretchLips_Close_L",
  "CTRL_expressions_mouthStretchLipsCloseR": "Mouth_StretchLips_Close_R",
  "CTRL_expressions_mouthStretchR": "Mouth_Stretch_R",
  "CTRL_expressions_mouthUp": "Mouth_Up",
  "CTRL_expressions_mouthUpperLipBiteL": "Mouth_UpperLip_Bite_L",
  "CTRL_expressions_mouthUpperLipBiteR": "Mouth_UpperLip_Bite_R",
  "CTRL_expressions_mouthUpperLipRaiseL": "Mouth_UpperLip_Raise_L",
  "CTRL_expressions_mouthUpperLipRaiseR": "Mouth_UpperLip_Raise_R",
  "CTRL_expressions_mouthUpperLipRollInL": "Mouth_UpperLip_RollIn_L",
  "CTRL_expressions_mouthUpperLipRollInR": "Mouth_UpperLip_RollIn_R",
  "CTRL_expressions_mouthUpperLipRollOutL": "Mouth_UpperLip_Roll_Out_L",
  "CTRL_expressions_mouthUpperLipRollOutR": "Mouth_UpperLip_Roll_Out_R",
  "CTRL_expressions_mouthUpperLipShiftLeft": "Mouth_UpperLip_Shift_Left",
  "CTRL_expressions_mouthUpperLipShiftRight": "Mouth_UpperLip_Shift_Right",
  "CTRL_expressions_mouthUpperLipTowardsTeethL": "Mouth_UpperLip_Towards_Teeth_L",
  "CTRL_expressions_mouthUpperLipTowardsTeethR": "Mouth_UpperLip_Towards_Teeth_R",
  "CTRL_expressions_neckDigastricDown": "Neck_Digastric_Down",
  "CTRL_expressions_neckDigastricUp": "Neck_Digastric_Up",
  "CTRL_expressions_neckMastoidContractL": "Neck_Mastoid_Contract_L",
  "CTRL_expressions_neckMastoidContractR": "Neck_Mastoid_Contract_R",
  "CTRL_expressions_neckStretchL": "Neck_Stretch_L",
  "CTRL_expressions_neckStretchR": "Neck_Stretch_R",
  "CTRL_expressions_neckSwallowPh1": "Neck_Swallow_Ph1",
  "CTRL_expressions_neckSwallowPh2": "Neck_Swallow_Ph2",
  "CTRL_expressions_neckSwallowPh3": "Neck_Swallow_Ph3",
  "CTRL_expressions_neckSwallowPh4": "Neck_Swallow_Ph4",
  "CTRL_expressions_neckThroatDown": "Neck_Throat_Down",
  "CTRL_expressions_neckThroatExhale": "Neck_Throat_Exhale",
  "CTRL_expressions_neckThroatInhale": "Neck_Throat_Inhale",
  "CTRL_expressions_neckThroatUp": "Neck_Throat_Up",
  "CTRL_expressions_noseNasolabialDeepenL": "Nose_Nasolabial_Deepen_L",
  "CTRL_expressions_noseNasolabialDeepenR": "Nose_Nasolabial_Deepen_R",
  "CTRL_expressions_noseNostrilCompressL": "Nose_Nostril_Compress_L",
  "CTRL_expressions_noseNostrilCompressR": "Nose_Nostril_Compress_R",
  "CTRL_expressions_noseNostrilDepressL": "Nose_Nostril_Depress_L",
  "CTRL_expressions_noseNostrilDepressR": "Nose_Nostril_Depress_R",
  "CTRL_expressions_noseNostrilDilateL": "Nose_Nostril_Dilate_L",
  "CTRL_expressions_noseNostrilDilateR": "Nose_Nostril_Dilate_R",
  "CTRL_expressions_noseWrinkleL": "Nose_Wrinkle_L",
  "CTRL_expressions_noseWrinkleR": "Nose_Wrinkle_R",
  "CTRL_expressions_noseWrinkleUpperL": "Nose_Wrinkle_Upper_L",
  "CTRL_expressions_noseWrinkleUpperR": "Nose_Wrinkle_Upper_R"
};

/**
 * Convert MetaHuman blendshapes to CC5 format using direct 1:1 mapping
 * with special handling for symmetrical blendshapes and bilateral expressions.
 * 
 * Special cases:
 * 1. BLINKING: Always bilateral - combines L/R blink values
 * 2. SYMMETRICAL PAIRS: Averages L/R values to prevent exaggeration
 * 3. LIPS TOGETHER: Reduced to 30% intensity to prevent extreme lip closing (P/B/M sounds)
 * 
 * @param {Object} metahumanBlendshapes - Object with CTRL_expressions_* keys and numeric values (0-1)
 * @returns {Object} CC5 blendshapes with processed values
 * 
 * @example
 * const metahuman = {
 *   "CTRL_expressions_eyeBlinkL": 0.8,
 *   "CTRL_expressions_eyeBlinkR": 0.6,
 *   "CTRL_expressions_mouthLipsTogetherUL": 1.0,
 *   "CTRL_expressions_jawOpen": 0.5
 * };
 * const cc5 = convertMetaHumanToCC5Direct(metahuman);
 * // Result: {
 * //   "Eye_Blink_L": 0.7,  // (0.8 + 0.6) / 2 - synchronized
 * //   "Eye_Blink_R": 0.7,  // (0.8 + 0.6) / 2 - synchronized
 * //   "Mouth_Lips_Together_UL": 0.3,  // 1.0 * 0.3 - reduced intensity
 * //   "Jaw_Open": 0.5
 * // }
 */
export function convertMetaHumanToCC5Direct(metahumanBlendshapes) {
  const cc5Blendshapes = {};

  // Special handling for bilateral blinking - always sync both eyes
  const blinkL = metahumanBlendshapes["CTRL_expressions_eyeBlinkL"] || 0;
  const blinkR = metahumanBlendshapes["CTRL_expressions_eyeBlinkR"] || 0;
  
  // Only process if there's actual blink value
  if (blinkL > 0 || blinkR > 0) {
    const blinkAvg = (blinkL + blinkR) / 2;
    cc5Blendshapes["Eye_Blink_L"] = blinkAvg;
    cc5Blendshapes["Eye_Blink_R"] = blinkAvg;
  }

  // Define symmetrical pairs that should be averaged to prevent exaggeration
  const symmetricalPairs = [
    // Brow expressions
    ["CTRL_expressions_browDownL", "CTRL_expressions_browDownR"],
    ["CTRL_expressions_browLateralL", "CTRL_expressions_browLateralR"],
    ["CTRL_expressions_browRaiseInL", "CTRL_expressions_browRaiseInR"],
    ["CTRL_expressions_browRaiseOuterL", "CTRL_expressions_browRaiseOuterR"],
    
    // Eye expressions (excluding blinks - handled above)
    ["CTRL_expressions_eyeCheekRaiseL", "CTRL_expressions_eyeCheekRaiseR"],
    ["CTRL_expressions_eyeSquintInnerL", "CTRL_expressions_eyeSquintInnerR"],
    ["CTRL_expressions_eyeWidenL", "CTRL_expressions_eyeWidenR"],
    
    // Nose expressions
    ["CTRL_expressions_noseWrinkleL", "CTRL_expressions_noseWrinkleR"],
    
    // Mouth corner expressions
    ["CTRL_expressions_mouthCornerPullL", "CTRL_expressions_mouthCornerPullR"],
    ["CTRL_expressions_mouthDimpleL", "CTRL_expressions_mouthDimpleR"],
    ["CTRL_expressions_mouthStretchL", "CTRL_expressions_mouthStretchR"],
    
    // Upper lip
    ["CTRL_expressions_mouthUpperLipRaiseL", "CTRL_expressions_mouthUpperLipRaiseR"],
    
    // Lower lip
    ["CTRL_expressions_mouthLowerLipDepressL", "CTRL_expressions_mouthLowerLipDepressR"],
  ];

  // Process symmetrical pairs - average L/R values
  // Performance: Only process if at least one side has a value
  for (const [leftKey, rightKey] of symmetricalPairs) {
    const leftValue = metahumanBlendshapes[leftKey];
    const rightValue = metahumanBlendshapes[rightKey];
    
    // Skip if both are zero/undefined
    if (!leftValue && !rightValue) continue;
    
    const avgValue = ((leftValue || 0) + (rightValue || 0)) / 2;
    
    const leftTarget = METAHUMAN_TO_CC5_DIRECT_MAPPING[leftKey];
    const rightTarget = METAHUMAN_TO_CC5_DIRECT_MAPPING[rightKey];
    
    if (leftTarget) cc5Blendshapes[leftTarget] = avgValue;
    if (rightTarget) cc5Blendshapes[rightTarget] = avgValue;
  }

  // Define problematic blendshapes that need special handling
  // These cause extreme lip closing for P/B/M sounds - reduce intensity
  const lipTogetherKeys = [
    "CTRL_expressions_mouthLipsTogetherDL",
    "CTRL_expressions_mouthLipsTogetherDR",
    "CTRL_expressions_mouthLipsTogetherUL",
    "CTRL_expressions_mouthLipsTogetherUR",
  ];
  
  // Reduce intensity of lips together blendshapes (scale to 30%)
  for (const key of lipTogetherKeys) {
    const value = metahumanBlendshapes[key];
    if (value !== undefined) {
      const target = METAHUMAN_TO_CC5_DIRECT_MAPPING[key];
      if (target) {
        // Scale down to 30% to prevent extreme lip pressing while maintaining some closure
        cc5Blendshapes[target] = value * 0.4;
      }
    }
  }

  // Process all other blendshapes normally (skip already processed ones)
  // Performance: Only process non-zero values
  const processedKeys = new Set([
    "CTRL_expressions_eyeBlinkL",
    "CTRL_expressions_eyeBlinkR",
    ...symmetricalPairs.flat(),
    ...lipTogetherKeys,
  ]);

  for (const [metahumanKey, value] of Object.entries(metahumanBlendshapes)) {
    // Skip if already processed or zero
    if (processedKeys.has(metahumanKey) || !value) continue;
    
    // Look up the CC5 target name
    const cc5Target = METAHUMAN_TO_CC5_DIRECT_MAPPING[metahumanKey];
    
    // If mapping exists, apply the value directly
    if (cc5Target) {
      cc5Blendshapes[cc5Target] = value;
    }
  }

  return cc5Blendshapes;
}

/**
 * Get all MetaHuman source channel names from the direct mapping
 * @returns {Array<string>} Array of CTRL_expressions_* channel names
 */
export function getMetaHumanChannelNamesDirect() {
  return Object.keys(METAHUMAN_TO_CC5_DIRECT_MAPPING).sort();
}

/**
 * Get all CC5 target channel names from the direct mapping
 * @returns {Array<string>} Array of CC5 channel names (without C_ prefix)
 */
export function getCC5ChannelNamesDirect() {
  return Object.values(METAHUMAN_TO_CC5_DIRECT_MAPPING).sort();
}

/**
 * Check if a MetaHuman blendshape name is supported in the direct mapping
 * @param {string} metahumanName - CTRL_expressions_* name to check
 * @returns {boolean} True if the blendshape is in the mapping
 */
export function isMetaHumanBlendshapeSupported(metahumanName) {
  return metahumanName in METAHUMAN_TO_CC5_DIRECT_MAPPING;
}

/**
 * Get the CC5 target name for a given MetaHuman source name
 * @param {string} metahumanName - CTRL_expressions_* source name
 * @returns {string|undefined} CC5 target name, or undefined if not found
 */
export function getCC5TargetName(metahumanName) {
  return METAHUMAN_TO_CC5_DIRECT_MAPPING[metahumanName];
}
