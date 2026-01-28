// Admin User Types
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'editor';
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin: string;
}

export interface LoginLog {
  id: string;
  userId: string;
  username: string;
  ip: string;
  status: 'success' | 'failed';
  timestamp: string;
}

// Product Types
export type FragranceFamily = 'floral' | 'woody' | 'oriental' | 'fresh' | 'citrus' | 'fruity' | 'spicy' | 'gourmand' | 'aquatic';
export type Concentration = 'edp' | 'edt' | 'edc' | 'parfum' | 'body_mist';
export type Gender = 'male' | 'female' | 'unisex' | 'kids';

export interface ProductScentNotes {
  top: string[];
  middle: string[];
  base: string[];
}

export interface Product {
    id: string;
    name: string;
    description: string;
    shortDescription: string;
    price: number;
    discountedPrice?: number;
    currency: string;
    vatRate: number;
    stock: number;
    sku: string;
    barcode?: string;
    categoryId: string;
    categoryName: string;
    variants?: ProductVariant[];
    images: string[];
    isFeatured: boolean;
    isActive: boolean;
    metaTitle?: string;
    metaDescription?: string;
    slug: string;
    
    // Perfume Specific Attributes
    scentNotes?: ProductScentNotes;
    fragranceFamily?: FragranceFamily;
    concentration?: Concentration;
    gender?: Gender;
    volume?: number; // in ml
    
    // Inventory & Batch Tracking
    batchCode?: string;
    productionDate?: string;
    expirationDate?: string;

    createdAt: string;
    updatedAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  priceModifier: number;
  stock: number;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  slug: string;
  productCount: number;
}

// Order Types
export type OrderStatus =
  | 'pending'
  | 'payment_confirmed'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variant?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Address;
  billingAddress: Address;
  items: OrderItem[];
  subtotal: number;
  vatAmount: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  paymentDate?: string;
  orderDate: string;
  shippingCompany?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  notes?: string;
  history: OrderHistory[];
}

export interface OrderHistory {
  id: string;
  action: string;
  status: OrderStatus;
  note?: string;
  createdBy: string;
  createdAt: string;
}

export interface Address {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postalCode: string;
  country: string;
}

// Customer Types
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  addresses: Address[];
  orderCount: number;
  totalSpent: number;
  notes?: string;
  createdAt: string;
  lastOrderDate?: string;
}

// Banner Types
export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface Showcase {
  id: string;
  type: 'featured_products' | 'campaign' | 'text_block';
  title: string;
  content?: string;
  productIds?: string[];
  isActive: boolean;
  order: number;
}

// Review Types
export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  createdAt: string;
}

// Legal Text Types
export interface LegalText {
  id: string;
  type:
  | 'privacy_policy'
  | 'kvkk'
  | 'cookie_policy'
  | 'distance_sales'
  | 'preliminary_info'
  | 'terms_of_use'
  | 'return_policy';
  title: string;
  content: string;
  isActive: boolean;
  updatedAt: string;
}

// Dashboard Types
export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  shippedOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  threshold: number;
}

export interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  createdAt: string;
}
