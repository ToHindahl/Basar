export function checkChecksum(number: number): boolean {
  return !!number && number % 10 === calculateChecksum(Math.floor(number / 10));
}

export function calculateChecksum(number: number): number {
  if (number < 10) return number;
  else
    return calculateChecksum(
      (number % 10) + calculateChecksum(Math.floor(number / 10))
    );
}
export function addChecksum(number: number) {
  return number * 10 + calculateChecksum(number);
}
export function calcuateRangeFromLowerbound(
  lowerbound: number,
  countSeller: number
) {
  return {
    lowestSellerNumber: lowerbound,
    highestSellerNumber: lowerbound + countSeller - 1,
  };
}
export function calcuateRangeFromLowerboundWithChecksum(
  lowerbound: number,
  countSeller: number
) {
  const withoutChecksum = calcuateRangeFromLowerbound(lowerbound, countSeller);
  return {
    lowestSellerNumber: addChecksum(withoutChecksum.lowestSellerNumber),
    highestSellerNumber: addChecksum(withoutChecksum.highestSellerNumber),
  };
}
