/** One QR code per A4 page for easy print-and-cut. */
export const QR_CODES_PER_A4_PAGE = 1;

export function getUniqueBatches(
  serialNumbers: Array<{ batchNumber?: string; status: string }>
): string[] {
  const batches = new Set<string>();
  serialNumbers
    .filter((s) => s.status === 'active' && s.batchNumber)
    .forEach((s) => batches.add(s.batchNumber!));
  return Array.from(batches).sort();
}
