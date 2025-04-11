
import * as z from "zod";

// Helper function to create bilingual validation schema 
export const createBilingualSchema = (nameEn: string, nameAr: string) => {
  return z.object({
    en: z.string().min(1, { message: `${nameEn} in English is required` }),
    ar: z.string().min(1, { message: `${nameAr} in Arabic is required` }),
  });
};

// Schema for a party (client, employer)
export const partySchema = z.object({
  name: z.object({
    en: z.string().min(2, { message: "Name in English must be at least 2 characters" }),
    ar: z.string().min(2, { message: "Name in Arabic must be at least 2 characters" }),
  }),
  crn: z.object({
    en: z.string().optional(),
    ar: z.string().optional(),
  }).optional(),
  address: z.object({
    en: z.string().optional(),
    ar: z.string().optional(),
  }).optional(),
  contact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email({ message: "Invalid email address" }).optional(),
  }).optional(),
});

// Schema for a promoter - Updated to include nationality field
export const promoterSchema = z.object({
  name: z.object({
    en: z.string().min(2, { message: "Name in English must be at least 2 characters" }),
    ar: z.string().min(2, { message: "Name in Arabic must be at least 2 characters" }),
  }),
  id: z.object({
    en: z.string().min(1, { message: "ID in English is required" }),
    ar: z.string().min(1, { message: "ID in Arabic is required" }),
  }),
  nationality: z.object({
    en: z.string().optional(),
    ar: z.string().optional(),
  }).optional(),
  contact: z.object({
    phone: z.string().optional(),
    email: z.string().email({ message: "Invalid email address" }).optional(),
  }).optional(),
});

// Schema for contract details
export const contractDetailsSchema = z.object({
  product: z.object({
    en: z.string().min(1, { message: "Product in English is required" }),
    ar: z.string().min(1, { message: "Product in Arabic is required" }),
  }),
  location: z.object({
    en: z.string().min(1, { message: "Location in English is required" }),
    ar: z.string().min(1, { message: "Location in Arabic is required" }),
  }),
  startDate: z.object({
    en: z.string().min(1, { message: "Start date in English is required" }),
    ar: z.string().min(1, { message: "Start date in Arabic is required" }),
  }),
  endDate: z.object({
    en: z.string().min(1, { message: "End date in English is required" }),
    ar: z.string().min(1, { message: "End date in Arabic is required" }),
  }),
  duration: z.object({
    en: z.string().optional(),
    ar: z.string().optional(),
  }).optional(),
  paymentTerms: z.object({
    en: z.string().optional(),
    ar: z.string().optional(),
  }).optional(),
});

// Schema for contract attachments - Updated to handle Oman ID card
export const contractAttachmentsSchema = z.object({
  letterhead: z.string().optional(),
  promoterPhoto: z.string().optional(), // ID card photo
  passportPhoto: z.string().optional(), // Additional passport photo
  additionalDocuments: z.array(
    z.object({
      name: z.string(),
      file: z.string(),
      type: z.string(),
      description: z.string().optional(),
    })
  ).optional(),
});

// Complete contract schema
export const contractSchema = z.object({
  refNumber: z.string(),
  firstParty: partySchema,
  secondParty: partySchema,
  promoter: promoterSchema,
  details: contractDetailsSchema,
  attachments: contractAttachmentsSchema.optional(),
  status: z.enum(["draft", "pending", "approved", "rejected", "expired"]).default("draft"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  language: z.enum(["en", "ar"]).default("en"),
});

// Form validation schema - Updated to include nationality fields and match Oman requirements
export const contractFormSchema = z.object({
  firstParty: z.string().min(1, { message: "Please select the first party" }),
  secondParty: z.string().min(1, { message: "Please select the second party" }),
  promoter: z.string().min(1, { message: "Please select the promoter" }),
  nationality: z.string().optional(), // Added nationality field
  product: z.string().min(1, { message: "Please select the product" }),
  location: z.string().min(1, { message: "Please select the location" }),
  startDate: z.date({ required_error: "Please select a start date" }),
  endDate: z.date({ required_error: "Please select an end date" })
    .refine(date => date > new Date(), { message: "End date must be in the future" }),
  letterhead: z.string().optional(),
  promoterPhoto: z.string().optional(),
  additionalTerms: z.string().optional(),
  paymentDetails: z.string().optional(),
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

// Schema for document validation - Including types relevant to Oman
export const documentSchema = z.object({
  name: z.string().min(1, { message: "Document name is required" }),
  file: z.string().min(1, { message: "Document file is required" }),
  type: z.enum(["passport", "id", "visa", "license", "certificate", "other"]),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  size: z.number().optional(),
  uploadedAt: z.date().optional(),
});

