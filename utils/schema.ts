// schemas/index.ts
import { z } from 'zod';

// ============ ENUMS ============
export const yearsOfExperienceEnum = z.enum(['0-5', '5-10', '10+']);
export const jobNatureEnum = z.enum(['remote', 'fullTime', 'partTime', 'hybrid', 'freelance', 'contractor']);
export const entityTypeEnum = z.enum(['company', 'applicant', 'job_requirement']);
export const applicantStatusEnum = z.enum(['unseen', 'seen', 'reviewed', 'selected', 'done']);

export const paginationSchema=z.object ({
    currentPage: z.number(),
    limit: z.number(),
    numberOfPages: z.number(),
    totalCount: z.number()})
  
// ============ BASE SCHEMAS ============
export const RegionSchema = z.object({
    id: z.string().uuid(),
    name: z.string().max(100),
    code: z.string().max(10),
});

export const JobFieldSchema = z.object({
    id: z.string().uuid(),
    name: z.string().max(100),
});

export const JobTitleSchema = z.object({
    id: z.string().uuid(),
    title: z.string().max(100),
    fieldId: z.string().uuid(),
});

export const ReferralSourceSchema = z.object({
    id: z.string().uuid(),
    name: z.string().max(100),
    // Add other fields if they exist in your ReferralSource table
});

export const CompanySchema = z.object({
    id: z.string().uuid(),
    name: z.string().max(255),
    description: z.string().nullable(),
    isArchived: z.boolean().default(false),
    createdAt: z.date().nullable(),
});

export const ApplicantSchema = z.object({
    id: z.string().uuid(),
    firstName: z.string().max(100),
    lastName: z.string().max(100),
    phone: z.string().max(20),
    email: z.string().email().max(255).nullable(),
    yearsOfExperience: yearsOfExperienceEnum,
    jobTitleId: z.string().uuid(),
    jobFieldId: z.string().uuid().nullable(),
    referralSourceId: z.string().uuid(),
    experienceDescription: z.string().nullable(),
    googleDriveUrl: z.string().max(500).nullable(),
    lastCompany: z.string().max(255).nullable(),
    applicationDate: z.date().nullable(),
    status: applicantStatusEnum.default('unseen'),
    createdAt: z.date().nullable(),
    updatedAt: z.date().nullable(),
    isArchived: z.boolean().default(false),
});

export const JobRequirementSchema = z.object({
    id: z.string().uuid(),
    companyId: z.string().uuid(),
    jobTitleId: z.string().uuid(),
    jobFieldId: z.string().uuid(),
    yearsOfExperience: yearsOfExperienceEnum,
    jobNature: jobNatureEnum,
    numberOfApplicantsNeeded: z.number().int().positive(),
    numberOfApplicantsSelected: z.number().int().min(0).default(0),
    createdAt: z.date().nullable(),
});

// ============ JUNCTION TABLE SCHEMAS ============
export const ApplicantRegionSchema = z.object({
    applicantId: z.string().uuid(),
    regionId: z.string().uuid(),
});

export const JobRequirementApplicantSchema = z.object({
    jobRequirementId: z.string().uuid(),
    applicantId: z.string().uuid(),
});

export const JobRequirementRegionSchema = z.object({
    jobRequirementId: z.string().uuid(),
    regionId: z.string().uuid(),
});

// ============ COMPOSITE SCHEMAS (for API responses) ============
export const ApplicantWithRelationsSchema = ApplicantSchema.extend({
    regions: z.array(RegionSchema).optional(),
    jobTitle: JobTitleSchema.optional(),
    jobField: JobFieldSchema.optional(),
    referralSource: ReferralSourceSchema.optional(),
});

export const JobRequirementWithRelationsSchema = JobRequirementSchema.extend({
    company: CompanySchema.optional(),
    jobTitle: JobTitleSchema.optional(),
    jobField: JobFieldSchema.optional(),
    regions: z.array(RegionSchema).optional(),
    selectedApplicants: z.array(ApplicantSchema).optional(),
});

// ============ CREATE SCHEMAS (omit auto-generated fields) ============
export const CreateRegionSchema = RegionSchema.omit({ id: true });
export const CreateJobFieldSchema = JobFieldSchema.omit({ id: true });
export const CreateJobTitleSchema = JobTitleSchema.omit({ id: true });
export const CreateCompanySchema = CompanySchema.omit({ id: true, createdAt: true });
export const CreateApplicantSchema = ApplicantSchema.omit({ 
    id: true, 
    applicationDate: true, 
    createdAt: true, 
    updatedAt: true 
}).partial({
    jobFieldId: true,
    experienceDescription: true,
    googleDriveUrl: true,
    lastCompany: true,
});
export const CreateJobRequirementSchema = JobRequirementSchema.omit({ 
    id: true, 
    createdAt: true,
    numberOfApplicantsSelected: true 
});
// ============ TYPES (inferred from schemas) ============
export type Region = z.infer<typeof RegionSchema>;
export type JobField = z.infer<typeof JobFieldSchema>;
export type JobTitle = z.infer<typeof JobTitleSchema>;
export type ReferralSource = z.infer<typeof ReferralSourceSchema>;
export type Company = z.infer<typeof CompanySchema>;
export type Applicant = z.infer<typeof ApplicantSchema>;
export type JobRequirement = z.infer<typeof JobRequirementSchema>;
export type pagination = z.infer<typeof paginationSchema>;

// Junction table types
export type ApplicantRegion = z.infer<typeof ApplicantRegionSchema>;
export type JobRequirementApplicant = z.infer<typeof JobRequirementApplicantSchema>;
export type JobRequirementRegion = z.infer<typeof JobRequirementRegionSchema>;


// Enum types
export type YearsOfExperience = z.infer<typeof yearsOfExperienceEnum>;
export type JobNature = z.infer<typeof jobNatureEnum>;
export type EntityType = z.infer<typeof entityTypeEnum>;
export type ApplicantStatus = z.infer<typeof applicantStatusEnum>;
// Composite types
export type ApplicantWithRelations = z.infer<typeof ApplicantWithRelationsSchema>;
export type JobRequirementWithRelations = z.infer<typeof JobRequirementWithRelationsSchema>;

// ============ UPDATE SCHEMAS (all fields optional) ============
// export const UpdateRegionSchema = CreateRegionSchema.partial();
// export const UpdateJobFieldSchema = CreateJobFieldSchema.partial();
// export const UpdateJobTitleSchema = CreateJobTitleSchema.partial();
// export const UpdateCompanySchema = CreateCompanySchema.partial();
// export const UpdateApplicantSchema = CreateApplicantSchema.partial();
// export const UpdateJobRequirementSchema = CreateJobRequirementSchema.partial();



// Create types
// export type CreateRegion = z.infer<typeof CreateRegionSchema>;
// export type CreateJobField = z.infer<typeof CreateJobFieldSchema>;
// export type CreateJobTitle = z.infer<typeof CreateJobTitleSchema>;
// export type CreateCompany = z.infer<typeof CreateCompanySchema>;
// export type CreateApplicant = z.infer<typeof CreateApplicantSchema>;
// export type CreateJobRequirement = z.infer<typeof CreateJobRequirementSchema>;

// // Update types
// export type UpdateRegion = z.infer<typeof UpdateRegionSchema>;
// export type UpdateJobField = z.infer<typeof UpdateJobFieldSchema>;
// export type UpdateJobTitle = z.infer<typeof UpdateJobTitleSchema>;
// export type UpdateCompany = z.infer<typeof UpdateCompanySchema>;
// export type UpdateApplicant = z.infer<typeof UpdateApplicantSchema>;
// export type UpdateJobRequirement = z.infer<typeof UpdateJobRequirementSchema>;