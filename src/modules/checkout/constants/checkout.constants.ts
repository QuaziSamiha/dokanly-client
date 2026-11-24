export interface ICartItem {
  id: number;
  imageUrl: string;
  name: string;
  quantity: string | number;
  pricePerItem: number;
  totalItem: number;
}

export const cartItems: ICartItem[] = [
  {
    id: 1,
    imageUrl: "/images/products/sample-2.png",
    name: "Natura Clear & Glow Face Wash ",
    quantity: "40 ML",
    pricePerItem: 120,
    totalItem: 3,
  },
  {
    id: 2,
    imageUrl: "/images/products/sample-3.png",
    name: "Natura Grow Hair Oil & Hair Density Shampoo ",
    quantity: "100 ML",
    pricePerItem: 120,
    totalItem: 2,
  },
  {
    id: 3,
    imageUrl: "/images/products/sample-4.png",
    name: "Natura Grow Hair Oil",
    quantity: "250 ML",
    pricePerItem: 120,
    totalItem: 4,
  },
];

export const deliveryAddress = [
  {
    value: "60", // deliveryMethod
    label: "Inside Dhaka", // region
    description: "2-3 days", // estimatedDays
    extraInfo: 60, // baseCharge
  },
  {
    value: "100",
    label: "Outside Dhaka",
    description: "4-7 days",
    extraInfo: 100,
  },
];

export const paymentMethods = [
  {
    value: "CASH_ON_DELIVERY",
    label: "Cash on Delivery",
  },
];

export const orderDeliveryRegions = [
  {
    id: "DHAKA",
    name: "Dhaka",
  },
  {
    id: "CHITTAGONG",
    name: "Chittagong",
  },
  {
    id: "KHULNA",
    name: "Khulna",
  },
  {
    id: "RAJSHAHI",
    name: "Rajshahi",
  },
  {
    id: "RANGPUR",
    name: "Rangpur",
  },
  {
    id: "MYMENSINGH",
    name: "Mymensingh",
  },
  {
    id: "SYLHET",
    name: "Sylhet",
  },
  {
    id: "BARISHAL",
    name: "Barishal",
  },
];
