
/**
 * Loads signature data from localStorage for a specific contract
 */
export function loadSignaturesFromStorage(contractId: string): any[] {
  const signatures: any[] = []
  try {
    // Try to get signatures from the new format first
    const savedSignatures = localStorage.getItem(`contract-signatures-${contractId}`)
    if (savedSignatures) {
      const parsedSignatures = JSON.parse(savedSignatures)
      // Filter only signatures with actual signature data
      const validSignatures = parsedSignatures.filter((s: any) => s.signature)
      signatures.push(...validSignatures)
    }

    // If no signatures found, try the old format
    if (signatures.length === 0) {
      const savedSignatories = localStorage.getItem(`contract-signatories-${contractId}`)
      if (savedSignatories) {
        const signatories = JSON.parse(savedSignatories)
        // Filter only signed signatories with signature data
        const signedSignatories = signatories.filter((s: any) => s.signed && s.signatureData)

        // Convert to the expected format
        const convertedSignatures = signedSignatories.map((s: any) => ({
          partyId: s.id,
          partyName: s.name,
          partyRole: s.role,
          signature: s.signatureData,
          stamp: s.stampData,
          timestamp: s.signedAt || new Date().toISOString(),
        }))

        signatures.push(...convertedSignatures)
      }
    }
  } catch (error) {
    console.error("Error loading signatures:", error)
  }
  
  return signatures
}
