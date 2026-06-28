export type UserRole = 'super_admin' | 'user' | 'seller' | 'delivery_person';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  address?: string;
  photoURL?: string;
  createdAt: number;
  status: 'active' | 'suspended';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  stockQuantity: number;
  images: string[];
  sellerId: string;
  createdAt: number;
  updatedAt: number;
  status: 'active' | 'inactive';
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  sellerId: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  sellerId: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: string;
  paymentMethod: string;
  sellerId: string;
  deliveryPersonId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  deliveryPersonId: string;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
  pickupAddress: string;
  deliveryAddress: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
}
