export function checkChecksum(number: number): boolean {
    return number % 10 === calculateChecksum(Math.floor(number / 10));
  }
  
export function calculateChecksum(number: number): number {
    if (number < 10) return number;
    else
    return calculateChecksum(
        (number % 10) + calculateChecksum(Math.floor(number / 10))
    );
}