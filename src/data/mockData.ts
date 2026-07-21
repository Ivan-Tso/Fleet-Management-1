import { Vehicle, MaintenanceRecord, UsageLog, Expense } from '../types';

export const mockVehicles: Vehicle[] = [
  {
    id: 'V-1001',
    make: 'Ford',
    model: 'Transit',
    year: 2021,
    licensePlate: 'ABC-1234',
    vin: '1FTBR1YTXMKA12345',
    status: 'active',
    mileage: 45200,
    fuelLevel: 85,
    lastServiceDate: '2023-11-15',
    department: 'Logistics',
  },
  {
    id: 'V-1002',
    make: 'Toyota',
    model: 'Hilux',
    year: 2022,
    licensePlate: 'XYZ-9876',
    vin: 'JTEBU1YTXMKA98765',
    status: 'maintenance',
    mileage: 32100,
    fuelLevel: 40,
    lastServiceDate: '2023-09-10',
    department: 'Engineering',
  },
  {
    id: 'V-1003',
    make: 'Mercedes-Benz',
    model: 'Sprinter',
    year: 2020,
    licensePlate: 'DEF-5678',
    vin: 'WDBBR1YTXMKA56789',
    status: 'active',
    mileage: 89000,
    fuelLevel: 60,
    lastServiceDate: '2023-12-01',
    department: 'Logistics',
  },
  {
    id: 'V-1004',
    make: 'Ford',
    model: 'F-150',
    year: 2023,
    licensePlate: 'GHI-3456',
    vin: '1FTDW1YTXMKA34567',
    status: 'inactive',
    mileage: 12000,
    fuelLevel: 10,
    lastServiceDate: '2024-01-20',
    department: 'Sales',
  },
  {
    id: 'V-1005',
    make: 'Chevrolet',
    model: 'Express',
    year: 2019,
    licensePlate: 'JKL-7890',
    vin: '1GDBR1YTXMKA78901',
    status: 'active',
    mileage: 110500,
    fuelLevel: 95,
    lastServiceDate: '2023-10-05',
    department: 'Logistics',
  }
];

export const mockMaintenance: MaintenanceRecord[] = [
  {
    id: 'M-101',
    vehicleId: 'V-1002',
    date: '2024-05-08',
    type: 'Routine',
    description: 'Oil change, tire rotation, brake inspection',
    cost: 350,
    status: 'in_progress',
  },
  {
    id: 'M-102',
    vehicleId: 'V-1001',
    date: '2023-11-15',
    type: 'Repair',
    description: 'Replaced alternator',
    cost: 850,
    status: 'completed',
  },
  {
    id: 'M-103',
    vehicleId: 'V-1004',
    date: '2024-06-15',
    type: 'Inspection',
    description: 'Annual safety and emissions inspection',
    cost: 150,
    status: 'scheduled',
  }
];

export const mockUsageLogs: UsageLog[] = [
  { id: 'L-001', vehicleId: 'V-1001', driverName: 'Mark Thompson', date: '2024-05-08', startMileage: 45150, endMileage: 45200, purpose: 'Delivery Route A' },
  { id: 'L-002', vehicleId: 'V-1003', driverName: 'Sarah Jenkins', date: '2024-05-08', startMileage: 88940, endMileage: 89000, purpose: 'Warehouse Transfer' },
  { id: 'L-003', vehicleId: 'V-1002', driverName: 'Elena Rossi', date: '2024-05-07', startMileage: 32050, endMileage: 32100, purpose: 'Client Meeting' },
];

export const mockExpenses: Expense[] = [
  { id: 'E-001', vehicleId: 'V-1001', date: '2024-05-08', type: 'fuel', amount: 85.50, description: 'Gas station refill' },
  { id: 'E-002', vehicleId: 'V-1002', date: '2024-05-07', type: 'maintenance', amount: 350.00, description: 'Routine checkup' },
  { id: 'E-003', vehicleId: 'V-1004', date: '2024-05-01', type: 'insurance', amount: 1200.00, description: 'Annual premium' },
  { id: 'E-004', vehicleId: 'V-1003', date: '2024-05-05', type: 'toll', amount: 15.00, description: 'Highway toll' },
];
