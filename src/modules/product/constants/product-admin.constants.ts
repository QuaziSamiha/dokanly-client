export interface IProduct {
  id: number;
  name: string;
  category: string;
  stock: number;
  status: string;
  updateDate: string;
  image: string;
}

export const products: IProduct[] = [
  {
    id: 1,
    name: "Natura Coconut Oil",
    category: "Eye Care",
    stock: 200,
    status: "Available",
    updateDate: "July 25, 2025",
    image: "/images/products/featured-1.png",
  },
  {
    id: 2,
    name: "Natura Grow Hair Oil",
    category: "Lip Care",
    stock: 152,
    status: "Available",
    updateDate: "July 25, 2025",
    image: "/images/products/featured-1.png",
  },
  {
    id: 3,
    name: "Natura Clear & Glow Face Wash (40 ml)",
    category: "Oral Care",
    stock: 1548,
    status: "Low Stock",
    updateDate: "July 25, 2025",
    image: "/images/products/featured-1.png",
  },
  {
    id: 4,
    name: "Natura Grow Hair Oil & Hair Density Shampoo",
    category: "Skin Care",
    stock: 8458,
    status: "Out of Stock",
    updateDate: "July 25, 2025",
    image: "/images/products/featured-1.png",
  },
  {
    id: 5,
    name: "Natura Coconut Oil",
    category: "Hair Care",
    stock: 8458,
    status: "Available",
    updateDate: "July 25, 2025",
    image: "/images/products/featured-1.png",
  },
  {
    id: 6,
    name: "Natura Coconut Oil",
    category: "Body Care",
    stock: 54,
    status: "Out of Stock",
    updateDate: "July 25, 2025",
    image: "/images/products/featured-1.png",
  },
  {
    id: 7,
    name: "Natura Coconut Oil",
    category: "Body Care",
    stock: 10,
    status: "Available",
    updateDate: "July 25, 2025",
    image: "/images/products/featured-1.png",
  },
  {
    id: 8,
    name: "Natura Coconut Oil",
    category: "Body Care",
    stock: 48525,
    status: "Available",
    updateDate: "July 25, 2025",
    image: "/images/products/featured-1.png",
  },
  {
    id: 9,
    name: "Natura Coconut Oil",
    category: "Foot & Nail Care",
    stock: 45,
    status: "Low Stock",
    updateDate: "July 25, 2025",
    image: "/images/products/featured-1.png",
  },
];

export const productStatus = [
  {
    id: "DRAFT",
    name: "Draft",
  },
  {
    id: "ACTIVE",
    name: "Active",
  },
  {
    id: "INACTIVE",
    name: "Inactive (hidden from shop)",
  },
  // ARCHIVED isn't offered: a product is archived by deleting it.
];

// Shown before a product is deleted (soft delete: status becomes ARCHIVED).
export const ARCHIVE_CONFIRM_MESSAGE =
  "Delete this product? It will be archived: removed from the shop and locked from editing. Past orders keep it, and its name can be used for a new product. To only take it off sale, set its status to Inactive instead.";

export const productTypes = [
  {
    id: "SIMPLE",
    name: "Simple",
  },
  {
    id: "VARIABLE",
    name: "Variable",
  },
  {
    id: "COMBO",
    name: "Combo",
  },
];

// A size can be retired without taking the whole product down.
export const variantStatus = [
  {
    id: "ACTIVE",
    name: "Active",
  },
  {
    id: "INACTIVE",
    name: "Inactive",
  },
];

export const productStockStatus = [
  {
    id: "IN_STOCK",
    name: "In Stock",
  },
  {
    id: "OUT_OF_STOCK",
    name: "Out of Stock",
  },
  {
    id: "LOW_STOCK",
    name: "Low Stock",
  },
];
