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

export function EurFormatter(price: number): string {
    let EUR = new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
    });
    return EUR.format(price);
}