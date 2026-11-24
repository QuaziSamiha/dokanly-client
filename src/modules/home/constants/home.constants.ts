import { ITabList } from "@/types";
import { FaFacebookF } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa";

export const tabList: ITabList[] = [
  { label: "All", value: "all" },
  { label: "Hair Care", value: "hair care" },
  { label: "Skin Care", value: "skin care" },
  { label: "Body Care", value: "body care" },
  { label: "Other", value: "other" },
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

export const heroData = [
  { imageUrl: "/images/home/hero/hero-1.png" },
  { imageUrl: "/images/home/hero/hero-2.png" },
  { imageUrl: "/images/home/hero/hero-3.png" },
  { imageUrl: "/images/home/hero/hero-4.png" },
  { imageUrl: "/images/home/hero/hero-5.png" },
];

export const reviewData = [
  {
    id: 1,
    customerName: "Jhumur Sayeda",
    starNo: 5,
    review:
      "These are some amazing hair care and skin care product from Natura Care. Specially the Hair oil works really well in controlling Hair Fall problem. My mother has become super fan of the Hair Oil and Daughter really likes the Body Lotion by the way! Looking forward to use the New Products.",
  },
  {
    id: 2,
    customerName: "Faria Tabassum Nabila",
    starNo: 5,
    review:
      "I have been using Natura Grow Shampoo, Clear & Glow Face Wash and Grow Hair Oil and all the products are really good. Specially Grow Oil is just amazing—after using it twice, I could already see the difference! I noticed a lot of baby hair growth, a visible shine in my hair, especially when combined with Grow Shampoo. I really hope the quality of these products remain the same in the future. Thank you Natura Care. ",
  },
  {
    id: 3,
    customerName: "Md. Taief",
    starNo: 4.5,
    review:
      "The packaging of Grow shampoo is just excellent. I’ve been using it for a week, and here’s my review — both the shampoo and oil are of very good quality. After using the shampoo and applying the oil, my hair fall has reduced a lot compared to before. The delivery person and seller were also very well-behaved. Considering the price, I think the product quality is amazing. It came in 3-part packaging, and both the shampoo and oil have a really nice fragrance. I highly recommend this product.",
  },
  {
    id: 4,
    customerName: "Sanjida Rahman",
    starNo: 4.5,
    review:
      "Alhamdulillah, I received the parcel today — the delivery was really fast, which was great. After using Clear and Glow face wash, I’m absolutely loving it! The texture is nice, and it suits my skin perfectly. I’d give it a solid 9/10. Thank you to the seller for providing an original product and excellent service.",
  },
  {
    id: 5,
    customerName: "Nahin Ferdous",
    starNo: 4.5,
    review:
      "Alhamdulillah, I received Expert Care Body Lotion safely. It smells really nice, and I never thought I would get such a good lotion at this price. Highly recommended for everyone! Thanks to the seller for the great packaging.",
  },
  {
    id: 6,
    customerName: "Umma Tisha",
    starNo: 5,
    review:
      "Expert Care lotion is really good! It keeps my skin soft and moisturized for hours, and the mild fragrance is so refreshing. At this price, the seller has provided a great product. I’m very happy with this product.",
  },
  {
    id: 7,
    customerName: "Md. Zubair",
    starNo: 5,
    review:
      "Clear and Glow face wash making my skin glow! I think I will buy it again. No side effects, suitable for every skin type, and it feels so smooth.",
  },
  {
    id: 8,
    customerName: "Tamanna Zannat",
    starNo: 5,
    review:
      "Finally, I found a suitable shampoo for my low-porosity hair within my budget. It’s so reasonable and controls my hair fall quickly. I love Natura Grow Shampoo!",
  },
  {
    id: 9,
    customerName: "Samiya Ariya",
    starNo: 5,
    review:
      "At first, I ordered one Daily Moisturizing Body Lotion just to try it. I really liked the texture and moisture, so next time I ordered three more for my family and friends. It’s very good, and I totally recommend it!",
  },
];

export const productSpotlightData = [
  {
    id: 1,
    title: "Onion & Ginger: Nature’s Secret to Strong, Healthy Hair",
    subtitle1: "",
    subtitle2:
      "Onion and Ginger are two of nature’s most powerful ingredients for controlling hair fall and promoting healthy growth. Onion strengthens hair roots, improves blood circulation in the scalp. Its natural antibacterial properties also help keep the scalp clean and free from infections, reducing breakage and hair fall. Ginger, on the other hand, nourishes hair follicles, and keeps dandruff and dryness under control.",
    subtitle3: "",
    subtitle4: "",
    subtitle5: "Natura Grow Hair Oil and Natura Grow Shampoo",
    subtitle6:
      ", enriched with the natural goodness of Onion and Ginger, deeply nourishes from root to tip — reducing hair fall, strengthening every strand, and bringing back your hair’s natural strength.",
    textColor: "text-greenPrimary-600",
    bgColor: "bg-linear-to-r from-[#F7FAE7] to-[#E4F0C6]",
    buttonColor: "bg-greenPrimary-600",
    pageLink: "discover-more/onion-ginger",
    imageUrl: "/images/home/spotlight/spotlight-1.png",
  },
  {
    id: 2,
    title:
      "Cocoa Butter & Shea Butter: The Natural Remedy for Dry, Damaged Skin",
    subtitle1: "",
    subtitle2:
      "During winter, skin often becomes dry, rough, and loses its natural softness. To restore moisture and repair damaged skin naturally, ",
    subtitle3: " Cocoa Butter and Shea Butter",
    subtitle4:
      " offer a deeply nourishing solution. These rich natural emollients penetrate deep into the skin, replenishing lost moisture, healing dryness, and providing long-lasting softness — making them the perfect ingredients for effective winter skincare.",
    subtitle5: "Natura Expert Care Body Lotion",
    subtitle6:
      ", enriched with Cocoa Butter and Shea Butter, provides deep repair and ultimate comfort — the perfect care your skin deserves in winter.",
    textColor: "text-[#624300]",
    bgColor: "bg-linear-to-r from-[#FFF7EA] to-[#E7DCC4]",
    buttonColor: "bg-[#624300]",
    pageLink: "discover-more/cocoa-butter",
    imageUrl: "/images/home/spotlight/spotlight-2.png",
  },
  {
    id: 3,
    title: "Complete Natural Care for Clear, Glowing Skin",
    subtitle1: "",
    subtitle2:
      "Daily exposure to pollution, sun, and dust can make skin dull, uneven, and prone to pimples. Over time, tanning, excess oil, and dryness take away the skin’s natural glow and freshness. To bring back a clean, healthy, and radiant complexion, nature offers a complete solution through ",
    subtitle3: "Rice Powder, Neem, Honey, and Saffron —",
    subtitle4:
      " a powerful blend that gently cleanses, protects, and nourishes your skin from within.",
    subtitle5: "Natura Clear & Glow Complete Care Face Wash",
    subtitle6:
      ", enriched with these natural ingredients, purifies, nourishes, and brightens — giving your skin a fresh, glowing, and flawless look every day.",
    textColor: "text-greenPrimary-600",
    bgColor: "bg-linear-to-r from-[#E4F2E0] to-[#A5C39D]",
    buttonColor: "bg-greenPrimary-600",
    pageLink: "discover-more/glowing-skin",
    imageUrl: "/images/home/spotlight/spotlight-3.png",
  },
];

export const followUsData = [
  {
    icon: FaFacebookF,
    imageUrl: "/images/home/follow-us/follow-us-1.jpg",
    link: "https://www.facebook.com/NaturaCareLtd",
  },
  {
    icon: FaInstagram,
    imageUrl: "/images/home/follow-us/follow-us-2.jpg",
    link: "https://www.instagram.com/naturacareltd/",
  },
  {
    icon: FaYoutube,
    imageUrl: "/images/home/follow-us/follow-us-3.jpg",
    link: "https://www.youtube.com/@NaturaCareLimited",
  },
  {
    icon: FaLinkedinIn,
    imageUrl: "/images/home/follow-us/follow-us-4.jpg",
    link: "https://www.linkedin.com/company/naturacareltd/",
  },
];

export const shopBenefitsData = [
  {
    id: 1,
    icon: "/images/home/shop-benefits/benefit-1.png",
    title: "With the Goodness of Natural Ingredients",
    // subTitle: "",
  },
  {
    id: 2,
    icon: "/images/home/shop-benefits/benefit-2.png",
    title: "Dermatologically Tested",
  },
  {
    id: 3,
    icon: "/images/home/shop-benefits/benefit-3.png",
    title: "Clinically Tested",
  },
  {
    id: 4,
    icon: "/images/home/shop-benefits/benefit-4.png",
    title: "Consumers Research-Based",
  },
  {
    id: 5,
    icon: "/images/home/shop-benefits/benefit-5.png",
    title: "Formulation and Technology Partner Shea Olein USA",
  },
  // {
  //   id: 1,
  //   icon: "/images/home/shop-benefits/free-delivery.png",
  //   title: "Home Delivery",
  //   subTitle: "Enjoy standard delivery on all orders",
  // },
];
