export type LabRole = 'hod' | 'incharge' | 'instructor' | 'student';

export interface LabUser {
  id: string;
  name: string;
  email: string;
  role: LabRole;
  designation: string;
  department: string;
  avatarUrl?: string;
}

export type ComponentCategory =
  | 'Microcontrollers & SoC'
  | 'Sensors & Modules'
  | 'Test & Measurement'
  | 'Motors & Actuators'
  | 'Power & Batteries'
  | 'Discrete & ICs'
  | 'Prototyping & Tools';

export type ComponentCondition = 'New' | 'Good' | 'Fair' | 'Needs Calibration' | 'Damaged';

export interface ElectronicComponent {
  id: string;
  name: string;
  modelNumber: string;
  category: ComponentCategory;
  description: string;
  specifications: Record<string, string>;
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  rentedQuantity: number;
  inMaintenanceQuantity: number;
  location: {
    rack: string;
    shelf: string;
    bin: string;
  };
  dailyRentRate: number; // in INR or academic units (0 = free for coursework)
  securityDeposit: number;
  condition: ComponentCondition;
  isHighValueEquipment: boolean; // e.g. DSO, Spectrum Analyzer
  maxRentalDays: number;
  datasheetUrl?: string;
  imageUrl?: string;
  lastAuditedAt: string;
  serialNumbers?: string[];
}

export type RentalStatus = 'active' | 'returned' | 'overdue' | 'damaged';

export interface RentalRecord {
  id: string;
  componentId: string;
  componentName: string;
  componentModel: string;
  quantity: number;
  studentRollNo: string;
  studentName: string;
  studentEmail: string;
  studentDepartment: string;
  studentSemester: string;
  studentPhone: string;
  issuedBy: {
    id: string;
    name: string;
    role: 'incharge' | 'instructor';
  };
  issuedAt: string; // ISO date
  expectedReturnDate: string; // ISO date
  actualReturnDate?: string; // ISO date
  status: RentalStatus;
  conditionOnIssue: ComponentCondition;
  conditionOnReturn?: ComponentCondition;
  returnInspectedBy?: {
    id: string;
    name: string;
    role: 'incharge' | 'instructor';
  };
  accessoriesIssued: string[]; // e.g., ["10x Probe", "USB-C Cable", "Ground Clip"]
  fineAmount: number;
  fineStatus?: 'none' | 'pending' | 'paid' | 'waived';
  notes?: string;
  gatePassNumber: string;
}

export type ReservationStatus = 'pending' | 'approved' | 'rejected' | 'fulfilled' | 'cancelled';

export interface ComponentReservation {
  id: string;
  componentId: string;
  componentName: string;
  componentModel: string;
  quantity: number;
  studentRollNo: string;
  studentName: string;
  studentEmail: string;
  purpose: string; // e.g. "Final Year Capstone Project"
  labCourseCode?: string; // e.g. "ECE401 Embedded Systems Lab"
  reservedFrom: string; // ISO date
  reservedUntil: string; // ISO date
  status: ReservationStatus;
  requestedAt: string;
  reviewedBy?: {
    id: string;
    name: string;
    role: 'incharge' | 'instructor';
  };
  reviewedAt?: string;
  rejectionReason?: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'under_review' | 'completed';
export type TaskCategory =
  | 'Calibration'
  | 'Testing & Verification'
  | 'Restocking'
  | 'Maintenance'
  | 'Kit Preparation'
  | 'Inventory Audit';

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface LabTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: {
    id: string;
    name: string;
    designation: 'Lab Incharge' | 'Lab Instructor';
  };
  assignedBy: {
    id: string;
    name: string;
  };
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  checklist: TaskChecklistItem[];
  relatedComponentId?: string;
  relatedComponentName?: string;
  benchNotes?: string;
}

export interface LabAuditLog {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  role: LabRole;
  details: string;
  category: 'inventory' | 'rental' | 'reservation' | 'task' | 'system';
}

export type NavigationTab = 'inventory' | 'rentals' | 'reservations' | 'tasks' | 'audit' | 'logs';
