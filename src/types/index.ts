export type UserRole = 'CUSTOMER' | 'MECHANIC';

export type RequestStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type VehicleType = 'Car' | 'Bike' | 'SUV' | 'Truck' | 'Van';

export type FuelType = 'Petrol' | 'Diesel' | 'Electric' | 'CNG' | 'Hybrid';

export type ProblemType =
  | 'BATTERY'
  | 'ENGINE'
  | 'FLAT TYRE'
  | 'FUEL'
  | 'OVERHEATING'
  | 'BRAKE'
  | 'ELECTRICAL'
  | 'ACCIDENT'
  | 'OTHER';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
}

export interface Vehicle {
  id: string;
  userId: string;
  type: VehicleType;
  brand: string;
  model: string;
  year: number;
  fuelType: FuelType;
  registrationNumber: string;
  color: string;
  isDefault?: boolean;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationInfo {
  coords: Coordinates;
  address: string;
  city: string;
}

export interface MechanicServiceItem {
  id: string;
  name: string;
  description: string;
  price: number; // in INR
  estimatedMinutes: number;
}

export interface MechanicShop {
  id: string;
  ownerId: string;
  shopName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  coords: Coordinates;
  rating: number;
  reviewsCount: number;
  yearsOfExperience: number;
  isVerified: boolean;
  isAvailable: boolean;
  description: string;
  imageUrl: string;
  supportedVehicles: VehicleType[];
  supportedProblems: ProblemType[];
  skills: string[];
  services: MechanicServiceItem[];
  pricingRange: { min: number; max: number };
  emergencyAvailable: boolean;
}

export interface AssistanceRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  mechanicId: string;
  mechanicShopName: string;
  mechanicOwnerName: string;
  mechanicPhone: string;
  vehicle: Vehicle;
  problem: ProblemType;
  problemDescription?: string;
  status: RequestStatus;
  customerLocation: LocationInfo;
  mechanicLocation: Coordinates;
  distanceKm: number;
  etaMinutes: number;
  estimatedPrice: { min: number; max: number };
  finalPrice?: number;
  serviceNotes?: string;
  createdAt: string;
  updatedAt: string;
  rating?: number;
  review?: string;
  paymentStatus?: 'PENDING' | 'PAID';
  paymentMethod?: 'UPI' | 'CARD' | 'NETBANKING' | 'CASH';
  transactionId?: string;
  invoiceNumber?: string;
  paidAt?: string;
  paymentBreakdown?: {
    baseAmount: number;
    platformFee: number;
    gstAmount: number;
    totalAmount: number;
    methodTitle?: string;
    accountReference?: string;
  };
  timeline: {
    requestedAt: string;
    acceptedAt?: string;
    onTheWayAt?: string;
    arrivedAt?: string;
    inProgressAt?: string;
    completedAt?: string;
    cancelledAt?: string;
  };
}

export interface ChatMessage {
  id: string;
  requestId: string;
  senderId: string;
  senderRole: UserRole;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  timestamp: string;
  read: boolean;
  requestId?: string;
}

export interface MechanicStats {
  todayJobs: number;
  completedJobs: number;
  activeJobs: number;
  totalEarnings: number;
}
