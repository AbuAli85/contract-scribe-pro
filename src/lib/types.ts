
/**
 * Type definitions for the contract data structure
 */

// Bilingual text structure used throughout the contract
export interface BilingualText {
  en: string;
  ar: string;
}

// Contract party information
export interface ContractParty {
  name?: BilingualText;
  crn?: BilingualText;  // Commercial Registration Number
}

// Promoter information
export interface Promoter {
  name?: BilingualText;
  id?: BilingualText;
}

// Complete contract data structure
export interface ContractData {
  id?: string;
  refNumber?: string;
  firstParty?: ContractParty;
  secondParty?: ContractParty;
  promoter?: Promoter;
  product?: BilingualText;
  location?: BilingualText;
  startDate?: BilingualText;
  endDate?: BilingualText;
  letterhead?: string | null;
  promoterPhoto?: string | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Signature data structure
export interface SignatureData {
  partyId: string;
  partyName: string;
  partyRole: string;
  signature: string;
  stamp?: string;
  timestamp: string;
}

// Print options interface
export interface PrintOptions {
  contractId: string;
  language?: "en" | "ar";
  documents?: string[];
  includeSignatures?: boolean;
}
