export interface ICartItem {
  id: number;
  imageUrl: string;
  name: string;
  quantity: string | number;
  pricePerItem: number;
}

export const cartItems: ICartItem[] = [
  {
    id: 1,
    imageUrl: "/images/products/sample-2.png",
    name: "Natura Clear & Glow Face Wash ",
    quantity: "40 ML",
    pricePerItem: 120,
  },
  {
    id: 2,
    imageUrl: "/images/products/sample-3.png",
    name: "Natura Grow Hair Oil & Hair Density Shampoo ",
    quantity: "100 ML",
    pricePerItem: 120,
  },
  {
    id: 3,
    imageUrl: "/images/products/sample-4.png",
    name: "Natura Grow Hair Oil",
    quantity: "250 ML",
    pricePerItem: 120,
  },
];


export const products = {
  All: [
    {
      id: 1,
      name: "Natura Clear & Glow Face Wash (40 ml)",
      price: "120",
      originalPrice: "160",
      discount: "40% off",
      imageUrl: "/images/products/featured-1.png",
      category: "Face Care",
    },
    {
      id: 2,
      name: "Natura Grow Hair Oil & Hair Density Shampoo",
      price: "120",
      originalPrice: "160",
      discount: "40% off",
      imageUrl: "/images/products/featured-2.png",
      category: "Hair Care",
    },
    {
      id: 3,
      name: "Natura Clear & Glow Face Wash (40 ml)",
      price: "120",
      originalPrice: "160",
      discount: "40% off",
      imageUrl: "/images/products/featured-3.png",
      category: "Face Care",
    },
    {
      id: 4,
      name: "Natura Grow Hair Oil (250 ml)",
      price: "120",
      originalPrice: "160",
      discount: "40% off",
      imageUrl: "/images/products/featured-4.png",
      category: "Hair Care",
    },
  ],
  "Face Care": [
    {
      id: 1,
      name: "Natura Clear & Glow Face Wash (40 ml)",
      price: "120",
      originalPrice: "160",
      discount: "40% off",
      imageUrl: "/images/products/featured-2.png",
      category: "Face Care",
    },
    {
      id: 3,
      name: "Natura Clear & Glow Face Wash (40 ml)",
      price: "120",
      originalPrice: "160",
      discount: "40% off",
      imageUrl: "/images/products/featured-2.png",
      category: "Face Care",
    },
  ],
  "Hair Care": [
    {
      id: 2,
      name: "Natura Grow Hair Oil & Hair Density Shampoo",
      price: "120",
      originalPrice: "160",
      discount: "40% off",
      imageUrl: "/images/products/featured-2.png",
      category: "Hair Care",
    },
    {
      id: 4,
      name: "Natura Grow Hair Oil (250 ml)",
      price: "120",
      originalPrice: "160",
      discount: "40% off",
      imageUrl: "/images/products/featured-2.png",
      category: "Hair Care",
    },
  ],
  "Body Care": [
    {
      id: 5,
      name: "Natura Body Lotion with Saffron",
      price: "150",
      originalPrice: "200",
      discount: "25% off",
      imageUrl: "/images/products/featured-2.png",
      category: "Body Care",
    },
  ],
};
