export type DashboardPeriod = "day" | "week" | "month" | "quarter" | "year";

export type OrderStatusKey =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentMethodKey = "CASH_ON_DELIVERY" | "SSLCOMMERZ";

//* change: % for amounts and counts, percentage points for rates.
export interface IKpi {
  value: number | null;
  previous: number | null;
  change: number | null;
}

export interface IDashboardKpis {
  netSales: IKpi;
  orders: IKpi;
  avgOrderValue: IKpi;
  newCustomers: IKpi;
  itemsSold: IKpi;
  collected: IKpi;
  outstanding: IKpi;
  discounts: IKpi;
  cancellationRate: IKpi;
  grossProfit: IKpi;
  grossMargin: IKpi;
  marginCoverage: number;
  avgDeliveryHours: IKpi;
}

export interface ISeriesPoint {
  label: string;
  start: string;
  revenue: number;
  orders: number;
  prevRevenue: number;
  prevOrders: number;
}

export interface IStatusCount {
  status: OrderStatusKey;
  count: number;
}

export interface IPaymentMethodRow {
  method: PaymentMethodKey;
  orders: number;
  revenue: number;
}

export interface ICategoryRow {
  categoryId: number | null;
  name: string;
  revenue: number;
  units: number;
}

export interface ICityRow {
  city: string;
  orders: number;
  revenue: number;
}

export interface ITopProduct {
  productId: number | null;
  productName: string;
  image: string | null;
  units: number;
  revenue: number;
  share: number;
}

export interface IHeatmap {
  days: number;
  cells: number[][];
  max: number;
}

export type IPipeline = Record<OrderStatusKey, number> & {
  stalePending: number;
};

export interface ILowStockItem {
  id: number;
  sid: string;
  slug: string;
  name: string;
  quantity: number;
  image: string | null;
}

export interface IInventory {
  totalProducts: number;
  activeProducts: number;
  outOfStock: number;
  lowStock: number;
  lowStockThreshold: number;
  alerts: ILowStockItem[];
}

export interface ICustomers {
  totalCustomers: number;
  buyers: number;
  repeatBuyers: number;
  repeatRate: number;
}

export interface IRecentOrder {
  id: number;
  sid: string;
  orderId: string | null;
  customerName: string;
  phone: string;
  city: string;
  grandTotal: number;
  paymentMethod: PaymentMethodKey;
  paymentStatus: string;
  status: OrderStatusKey;
  createdAt: string;
  previewProductName: string | null;
  previewProductImage: string | null;
  totalItems: number;
}

export interface IDashboardOverview {
  period: DashboardPeriod;
  generatedAt: string;
  window: { start: string; end: string; prevStart: string; prevEnd: string };
  kpis: IDashboardKpis;
  series: ISeriesPoint[];
  statusBreakdown: IStatusCount[];
  paymentMethods: IPaymentMethodRow[];
  categories: ICategoryRow[];
  cities: ICityRow[];
  topProducts: ITopProduct[];
  heatmap: IHeatmap;
  pipeline: IPipeline;
  inventory: IInventory;
  customers: ICustomers;
  lifetime: { totalOrders: number; lifetimeSales: number };
  recentOrders: IRecentOrder[];
}
