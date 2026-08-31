export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'DRIVER';
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type VehicleStatus = 'ACTIVE' | 'INACTIVE';
export type TripStatus = 'ACTIVE' | 'COMPLETED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    trips: number;
  };
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  vehicleName: string;
  model: string;
  status: VehicleStatus;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    trips: number;
  };
}

export interface Trip {
  id: string;
  driverId: string;
  vehicleId: string;
  destination: string;
  startKm: string | number;
  closingKm?: string | number | null;
  totalKm?: string | number | null;
  cashAmount?: string | number | null;
  startTime: string;
  endTime?: string | null;
  status: TripStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
  driver?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  vehicle?: {
    id: string;
    vehicleNumber: string;
    vehicleName: string;
    model: string;
  };
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalDrivers: number;
  activeDrivers: number;
  totalVehicles: number;
  activeVehicles: number;
  activeTrips: number;
  completedTrips: number;
  totalKm: number;
  totalCash: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: Pagination;
  error?: string;
}
