export type User = {
  id: number;
  name: string;
  email: string;
  age: number;
};

// export interface ICategory {
//   id: number;
//   categoryName: string;
//   numberOfProducts: number;
//   status: number | string;
// }

export const categoryStatus = [
  {
    id: "ACTIVE",
    name: "Active",
  },
  {
    id: "INACTIVE",
    name: "Inactive",
  },
  // Archiving is turned off for now
  // {
  //   id: "ARCHIVED",
  //   name: "Archived",
  // },
];

export const categories = [
  {
    id: 1,
    categoryName: "Hair Care",
    numberOfProducts: 24,
    status: "Active",
  },
  {
    id: 2,
    categoryName: "Skin Care",
    numberOfProducts: 18,
    status: "Active",
  },
  {
    id: 3,
    categoryName: "Body Care",
    numberOfProducts: 7,
    status: "Inactive",
  },
  {
    id: 4,
    categoryName: "Combos & Gift Packs",
    numberOfProducts: 12,
    status: "Active",
  },
  {
    id: 5,
    categoryName: "Herbal Essentials",
    numberOfProducts: 5,
    status: "Active",
  },
  {
    id: 6,
    categoryName: "Face Wash & Cleansers",
    numberOfProducts: 4,
    status: "Inactive",
  },
  {
    id: 7,
    categoryName: "Baby Care",
    numberOfProducts: 6,
    status: "Inactive",
  },
  {
    id: 8,
    categoryName: "Body & Bath",
    numberOfProducts: 2,
    status: "Active",
  },
  {
    id: 9,
    categoryName: "Seasonal Offers",
    numberOfProducts: 0,
    status: "Inactive",
  },
];

export const users: User[] = [
  { id: 1, name: "Alice", email: "alice@example.com", age: 25 },
  { id: 2, name: "Bob", email: "bob@example.com", age: 30 },
  { id: 3, name: "Charlie", email: "charlie@example.com", age: 28 },
  { id: 4, name: "David", email: "david@example.com", age: 35 },
  { id: 5, name: "Eve", email: "eve@example.com", age: 22 },
];
