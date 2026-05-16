import { z } from "zod";
import {
  AddressSchema,
  EntityIdSchema,
  IsoDateTimeSchema,
  PhoneSchema,
} from "./common";
import { ConsentStatusSchema } from "./compliance";

export const ContactSchema = z.object({
  id: EntityIdSchema.optional(),
  crmRecordId: EntityIdSchema.optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phone: PhoneSchema.optional(),
  address: AddressSchema.optional(),
  consentSms: ConsentStatusSchema.default("UNKNOWN"),
  consentEmail: ConsentStatusSchema.default("UNKNOWN"),
  consentVoice: ConsentStatusSchema.default("UNKNOWN"),
  doNotContact: z.boolean().default(false),
  createdAt: IsoDateTimeSchema.optional(),
  updatedAt: IsoDateTimeSchema.optional(),
});
export type Contact = z.infer<typeof ContactSchema>;

export const BorrowerSchema = ContactSchema.extend({
  leadId: EntityIdSchema.optional(),
  borrowerRole: z.enum(["PRIMARY", "CO_BORROWER"]).default("PRIMARY"),
  ssnLastFour: z
    .string()
    .regex(/^\d{4}$/)
    .optional(),
  dateOfBirth: z.string().date().optional(),
  annualIncomeCents: z.number().int().nonnegative().optional(),
  creditScore: z.number().int().min(300).max(850).optional(),
});
export type Borrower = z.infer<typeof BorrowerSchema>;

export const CoBorrowerSchema = BorrowerSchema.extend({
  borrowerRole: z.literal("CO_BORROWER").default("CO_BORROWER"),
  relationshipToPrimary: z.string().min(1).optional(),
});
export type CoBorrower = z.infer<typeof CoBorrowerSchema>;

export const RealtorPartnerSchema = z.object({
  id: EntityIdSchema.optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  company: z.string().optional(),
  email: z.string().email(),
  phone: PhoneSchema.optional(),
});
export type RealtorPartner = z.infer<typeof RealtorPartnerSchema>;
