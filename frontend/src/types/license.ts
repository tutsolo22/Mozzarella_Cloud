export enum LicenseStatus {
  Active = 'active',
  Expired = 'expired',
  Revoked = 'revoked',
}

export interface License {
  id: string;
  key: string;
  status: LicenseStatus;
  userLimit: number;
  branchLimit: number;
  expiresAt: string; // ISO date string
}

export interface GenerateLicenseDto {
  userLimit: number;
  branchLimit: number;
  durationInDays: number;
}