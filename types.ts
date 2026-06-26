export interface Appointment {
  id?: string;
  title: string;
  dateTime: string;
  patientName: string;
  patientEmail: string;
  type: 'Clinical' | 'Wellness' | 'ForensicRegular' | 'AttorneyAssist';
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
  googleEventId?: string;
}

export interface DriveDoc {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  thumbnailLink?: string;
  category?: 'Exams' | 'Reports' | 'CourtDocs' | 'General';
}

export interface BodilyInjuryCategory {
  id: string;
  name: string;
  description: string;
  weight: number; // Maximum percentage according to the Tabela Nacional de Incapacidades (TNI)
  estimatedLoss: number; // Selected loss (e.g., 0 to 1)
}

export interface ForensicLaudoAnalysis {
  clientName: string;
  caseNumber: string;
  expertName: string;
  comarca?: string;
  injuries: BodilyInjuryCategory[];
  notes: string;
  rehabilitationRequired: boolean;
  finalIncapacityPct: number;
}

export interface PatientProfile {
  userId: string;
  email: string;
  fullName: string;
  phone?: string;
  primaryArea?: 'Clinica' | 'Juridico' | 'Ambos';
  preferredContactMethod?: 'email' | 'whatsapp' | 'phone';
  notificationsEnabled?: boolean;
  medicalHistoryNotes?: string;
  updatedAt?: string;
}

