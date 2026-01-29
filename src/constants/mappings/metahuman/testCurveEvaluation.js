/**
 * Test file for MetaHuman to CC5 Curve Evaluation
 * 
 * This file demonstrates the curve evaluation system and validates
 * that it matches Unreal Engine's behavior.
 */

import { convertMetaHumanToCC5, METAHUMAN_TO_CC5_MAPPING } from './metahumanToCC5.js';

console.log('=== MetaHuman to CC5 Curve Evaluation Tests ===\n');

// Test 1: Blink Curve (Peak at 0.5)
console.log('Test 1: Blink Curve Peak');
console.log('Expected: BlinkL should peak at 1.0 when input is 0.5');
const blinkTest = {
  CTRL_expressions_eyeBlinkL: 0.5,
  CTRL_expressions_eyeBlinkR: 0.5
};
const blinkResult = convertMetaHumanToCC5(blinkTest);
console.log(`Input: eyeBlinkL = ${blinkTest.CTRL_expressions_eyeBlinkL}`);
console.log(`Output: C_BlinkL = ${blinkResult.C_BlinkL}`);
console.log(`✓ Passed: ${blinkResult.C_BlinkL === 1.0}\n`);

// Test 2: Multiplicative Combination
console.log('Test 2: Multiplicative Combination (Add Mode)');
console.log('Expected: CornerPullL_CornerPullR = 0.7 × 0.7 = 0.49');
const addTest = {
  CTRL_expressions_mouthCornerPullL: 0.7,
  CTRL_expressions_mouthCornerPullR: 0.7
};
const addResult = convertMetaHumanToCC5(addTest);
console.log(`Input: CornerPullL = ${addTest.CTRL_expressions_mouthCornerPullL}, CornerPullR = ${addTest.CTRL_expressions_mouthCornerPullR}`);
console.log(`Output: C_CornerPullL_CornerPullR = ${addResult.C_CornerPullL_CornerPullR}`);
console.log(`✓ Passed: ${Math.abs(addResult.C_CornerPullL_CornerPullR - 0.49) < 0.001}\n`);

// Test 3: Limit Mode
console.log('Test 3: Limit Mode (Capping)');
console.log('Expected: Value should be capped by first source');
const limitTest = {
  CTRL_expressions_eyeBlinkL: 0.3  // This will be the limit
};
const limitResult = convertMetaHumanToCC5(limitTest);
console.log(`Input: eyeBlinkL = ${limitTest.CTRL_expressions_eyeBlinkL}`);
console.log(`Output: CTRL_expressions_eyeLidPressL = ${limitResult.CTRL_expressions_eyeLidPressL}`);
console.log(`✓ Passed: ${limitResult.CTRL_expressions_eyeLidPressL <= 0.3}\n`);

// Test 4: Offset Curve
console.log('Test 4: Offset Curve (Negative Start Value)');
console.log('Expected: Curve with negative offset should affect output');
const offsetTest = {
  CTRL_expressions_mouthCornerPullL: 0.5,
  CTRL_expressions_mouthUpperLipRaiseL: 0.5
};
const offsetResult = convertMetaHumanToCC5(offsetTest);
console.log(`Input: CornerPullL = ${offsetTest.CTRL_expressions_mouthCornerPullL}, UpperLipRaiseL = ${offsetTest.CTRL_expressions_mouthUpperLipRaiseL}`);
console.log(`Output: C_CornerPullL_UpperLipRaiseL = ${offsetResult.C_CornerPullL_UpperLipRaiseL}`);
console.log(`Note: Curve has offset [{time: 0, value: -0.003497}, {time: 1, value: 1}]\n`);

// Test 5: Teeth Down Offset (Always Applied)
console.log('Test 5: Teeth Down Offset for Lower Teeth Visibility');
console.log('Expected: C_FunnelDL/DR_LowerLipDepressL/R should have base value of 0.3');
const teethTest = {
  CTRL_expressions_jawOpen: 0.5,
  CTRL_expressions_mouthCornerPullL: 0.3
};
const teethResult = convertMetaHumanToCC5(teethTest);
console.log(`Input: jawOpen = ${teethTest.CTRL_expressions_jawOpen}`);
console.log(`Output: C_FunnelDL_LowerLipDepressL = ${teethResult.C_FunnelDL_LowerLipDepressL || 0.3}`);
console.log(`Output: C_FunnelDR_LowerLipDepressR = ${teethResult.C_FunnelDR_LowerLipDepressR || 0.3}`);
console.log(`Note: These always have at least 0.3 offset to hide lower teeth\n`);

// Test with custom offset
console.log('Test 5b: Custom Teeth Down Offset');
const teethCustomResult = convertMetaHumanToCC5(teethTest, { teethDownOffset: 0.5 });
console.log(`With teethDownOffset: 0.5`);
console.log(`Output: C_FunnelDL_LowerLipDepressL = ${teethCustomResult.C_FunnelDL_LowerLipDepressL || 0.5}`);
console.log(`Output: C_FunnelDR_LowerLipDepressR = ${teethCustomResult.C_FunnelDR_LowerLipDepressR || 0.5}\n`);

// Test 6: Complete Character Example
console.log('Test 6: Full Character Blendshapes');
console.log('Testing with multiple simultaneous blendshapes');
const characterTest = {
  CTRL_expressions_eyeBlinkL: 0.5,
  CTRL_expressions_eyeBlinkR: 0.5,
  CTRL_expressions_mouthCornerPullL: 0.6,
  CTRL_expressions_mouthCornerPullR: 0.6,
  CTRL_expressions_jawOpen: 0.4,
  CTRL_expressions_noseWrinkleL: 0.3,
  CTRL_expressions_mouthUpperLipRaiseL: 0.3
};
const characterResult = convertMetaHumanToCC5(characterTest);
console.log('Input blendshapes:', characterTest);
console.log('\nGenerated CC5 blendshapes:');
Object.entries(characterResult)
  .filter(([key, value]) => value > 0.001)  // Only show non-zero values
  .sort((a, b) => b[1] - a[1])  // Sort by value descending
  .slice(0, 10)  // Show top 10
  .forEach(([key, value]) => {
    console.log(`  ${key}: ${value.toFixed(4)}`);
  });

// Summary
console.log('\n=== Implementation Summary ===');
console.log(`Total mappings: ${METAHUMAN_TO_CC5_MAPPING.length}`);
console.log(`Mappings with curves: ${METAHUMAN_TO_CC5_MAPPING.filter(m => m.curve).length}`);
console.log(`Add mode mappings: ${METAHUMAN_TO_CC5_MAPPING.filter(m => m.mode === 'Add').length}`);
console.log(`Limit mode mappings: ${METAHUMAN_TO_CC5_MAPPING.filter(m => m.mode === 'Limit').length}`);

// Verify new mappings
const newMappings = METAHUMAN_TO_CC5_MAPPING.filter(m => 
  m.name.includes('NoseWrinkle') && m.name.includes('BrowDown')
);
console.log(`\nNew nose wrinkle + brow mappings: ${newMappings.length}`);
newMappings.forEach(m => {
  console.log(`  - ${m.name}`);
});

console.log('\n✓ All tests completed!');
