export type VehicleStatus = 'active' | 'maintenance' | 'inactive';

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  status: VehicleStatus;
  mileage: number;
  fuelLevel: number; // 0 to 100 percentage
  lastServiceDate: string;
  department: string;
  image?: string;
  imageUrl?: string;
}

export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed';

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  date: string;
  type: string;
  description: string;
  cost: number;
  status: MaintenanceStatus;
}

export interface UsageLog {
  id: string;
  vehicleId: string;
  driverName: string;
  date: string;
  startTime?: string;
  endTime?: string;
  startMileage: number;
  endMileage: number;
  purpose: string;
  destination?: string;
}

export type ExpenseType = 'fuel' | 'toll' | 'maintenance' | 'insurance' | 'other';

export interface Expense {
  id: string;
  vehicleId: string;
  date: string;
  month?: string;
  type: ExpenseType;
  amount: number;
  description: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  date: string;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  isFullTank: boolean;
  mileage?: number;
  station?: string;
  notes?: string;
}

export type ReminderType = 'maintenance' | 'insurance' | 'inspection' | 'fuel' | 'tire' | 'other';

export interface Reminder {
  id: string;
  vehicleId: string;
  type: ReminderType;
  title: string;
  description?: string;
  dueDate: string;
  repeatInterval?: string;
  isCompleted: boolean;
}
