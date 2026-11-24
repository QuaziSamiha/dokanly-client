export interface IOrder {
  id: number;
  sid: string;
  orderId: string;
  // Customer Information
  customerId?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // Delivery Address
  street: string; // ? STREET AND HOUSE NO
  city: string;
  state?: string; // ? STATE
  zipCode: string; //? ZIP CODE
  country?: string;
  deliveryMethod: "INSIDE_DHAKA" | "OUTSIDE_DHAKA";
  deliveryCharge: number;
  estimatedDays: number; // 3 days for inside Dhaka, 7 for outside
  paymentMethod: "CASH_ON_DELIVERY" | "SSLCOMMERZ";
  paymentStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REFUNDED";
  transactionId?: string; // For online payments
  // Order Summary
  subtotal: number;
  discount: number;
  grandTotal: number;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED";
  statusHistory: IOrderStatusHistory[];
  notes: string;
  // Timestamps
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  deliveredAt?: string;
  // Relations
  orderItems: IOrderItem[];
  trackingId?: string; // <--- The Steadfast Consignment ID
  courierStatus?: string;
  promotionId?: number;
  couponCode?: string | null;
  couponTitle?: string | null;
  /** Minimum order of the free delivery offer that waived the charge; null when delivery wasn't free. */
  freeDeliveryMinOrderAmount?: number | null;
  freeDeliverySettingId?: number;
  isFreeDelivery?: boolean;
  lastTrackingMsg?: string | null; // admin only: last Steadfast webhook message
  appliedFreeDelivery?: {
    minOrderAmount: number;
    status: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
}

// ========================================
// ADMIN ORDER PAGE
// ========================================
export type OrderStatus = IOrder["status"];
export type PaymentStatus = IOrder["paymentStatus"];
export type PaymentMethod = IOrder["paymentMethod"];
export type DeliveryMethod = IOrder["deliveryMethod"];
export type CustomerType = "GUEST" | "REGISTERED";

/** GET /order/order-details/:id: the admin order plus its status history. */
export interface IOrderDetails extends IOrder {
  statusHistory: IOrderStatusHistory[];
}

/** GET /order/:id/delivery-status */
export interface IOrderLiveStatus extends IOrder {
  liveCourierStatus: string;
}

/** GET /order/stats */
export interface IOrderStats {
  totalOrders: number;
  statusCounts: Record<OrderStatus, number>;
  revenue: number;
  averageOrderValue: number;
  todayOrders: number;
  todayRevenue: number;
  unpaidOrders: number;
  guestOrders: number;
}

/** Filters of the admin order table, sent as GET /order query parameters. */
export interface IOrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  deliveryMethod?: DeliveryMethod;
  customerType?: CustomerType;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
}

// ========================================
// ORDER ITEM export interface
// ========================================
export interface IOrderItem {
  id: number;
  sid: string;
  orderId: number;
  productId?: number;
  productName: string; // Snapshot of product name at time of purchase (includes the size)
  variantId?: number | null; // Size bought, for a product that comes in sizes
  variantSize?: string | null; // Snapshot of that size ("100ml")
  price: number; // Price at time of purchase
  quantity: number;
  total: number; // price * quantity
  // Product details snapshot
  sku: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface IOrderStatusHistory {
  id: number;
  sid: string;
  orderId: number;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED";
  notes?: string;
  createdAt: string;
  changedBy?: number; // User ID who changed the status
  changedByUser?: { name: string; email: string; role: string } | null;
}

/** What the invoice renders: the order as the server returns it (checkout, "My orders", admin). */
export type IInvoice = Omit<IOrder, "statusHistory">;


// ========================================
// CUSTOMER "MY ORDERS"
// ========================================

/** The tabs of "My orders"; sent as GET /order/user-order?group= */
export type CustomerOrderGroup = "ACTIVE" | "DELIVERED" | "CANCELLED";

/** GET /order/user-order/summary */
export interface ICustomerOrderSummary {
  totalOrders: number;
  activeOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalSpent: number;
  statusCounts: Record<OrderStatus, number>;
  lastOrderAt: string | null;
}

export interface ICustomerOrderItem extends IOrderItem {
  /** null if the product no longer exists */
  productSlug: string | null;
  /** On sale and in stock right now ("Buy again") */
  isAvailable: boolean;
}

export interface IOrderTimelineEntry {
  status: OrderStatus;
  createdAt: string;
}

/** GET /order/user-order/:id */
export interface ICustomerOrderDetails
  extends Omit<IOrder, "orderItems" | "statusHistory"> {
  orderItems: ICustomerOrderItem[];
  statusHistory: IOrderTimelineEntry[];
  canCancel: boolean;
}
