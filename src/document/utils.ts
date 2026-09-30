export function scaleRealWorldMillimetresToPageMillimetres(
  realWorldMillimetres: number,
  scaleDenominator: number,
): number {
  return realWorldMillimetres / scaleDenominator;
}
