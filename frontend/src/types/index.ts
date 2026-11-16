// Core Entity Types matching SRS specifications

export interface Estate {
  id: string;
  name: string;
  timeZone: string;
  createdAt: string;
}

export interface Division {
  id: string;
  estateId: string;
  code: string;
  name: string;
}

export interface Field {
  id: string;
  estateId: string;
  divisionId?: string;
  code: string;
  name: string;
  areaHectares: number;
  isActive: boolean;
}

export interface Plucker {
  id: string;
  estateId: string;
  employeeCode: string;
  fullName: string;
  isActive: boolean;
}

export interface PluckerIntake {
  id: string;
  fieldId: string;
  pluckerId: string;
  intakeDate: string;
  session?: string;
  weightKg: number;
  notes?: string;
}

export interface FieldWeight {
  id: string;
  fieldId: string;
  weightDate: string;
  session?: string;
  weightKg: number;
  notes?: string;
}

export interface ReconciliationSummary {
  fieldId: string;
  date: string;
  totalFieldWeightKg: number;
  totalPluckerIntakeKg: number;
  varianceKg: number;
  variancePercentage: number | null;
}
