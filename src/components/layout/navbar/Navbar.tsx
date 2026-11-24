"use client";

import { Button } from "@/components/ui/button";
import { Heart, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { LiaShoppingBagSolid } from "react-icons/lia";
import CustomNavDropdown from "@/components/primitives/CustomNavDropdown";
import { useLocalCart } from "@/modules/cart/hooks/useLocalCart";
import { useCurrentUser } from "@/modules/user/hooks/useCurrentUser";
import { useHasOpenCareers } from "@/modules/career/hooks/usePublicCareer";
import { useWishlistIds } from "@/modules/wishlist/hooks/useWishlist";
import { useHasMounted } from "@/hooks/useHasMounted";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalCartItems } = useLocalCart();
  const { userId, isUserAdmin, isUserEmployee } = useCurrentUser();
  const { hasOpenCareers } = useHasOpenCareers();
  const { wishlistCount } = useWishlistIds();
  const hasMounted = useHasMounted();
  const pathName = usePathname();

  const navLinks = [
    { label: "Home", href: "/", isActive: pathName === "/" },
    { label: "About Us", href: "/about-us", isActive: pathName === "/about-us" },
    { label: "Product", href: "/product", isActive: pathName === "/product" },
    // { label: "Media & News", href: "/media-news", isActive: pathName === "/media-news" },
    { label: "Blog", href: "/blog", isActive: pathName.startsWith("/blog") },
    // Career is only advertised while there are open positions
    ...(hasOpenCareers
      ? [{ label: "Career", href: "/career", isActive: pathName === "/career" }]
      : []),
    {
      label: "Contact Us",
      href: "/contact-us",
      isActive: pathName === "/contact-us",
    },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-neutralPrimary-100 bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
        <div className="container mx-auto px-4 sm:px-6">
          {/* ===== DESKTOP & TABLET ===== */}
          <div className="flex items-center justify-between h-24 gap-6">
            {/* ===== LOGO ======= */}
            <Link href="/" aria-label="Natura Care home" className="shrink-0">
              <Image
                src="/images/brand/logo.png"
                alt="Natura Logo"
                height={66}
                width={176}
                priority
                className="h-auto w-[132px] sm:w-[150px] xl:w-[176px]"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {/* ========== LINKS ========= */}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={link.isActive ? "page" : undefined}
                  className={`${
                    link.isActive
                      ? "text-greenPrimary-600 after:scale-x-100"
                      : "text-neutralPrimary-700 after:scale-x-0"
                  } relative px-3 py-2 text-[15px] xl:text-base font-medium tracking-[-0.01em] whitespace-nowrap transition-colors duration-200 hover:text-greenPrimary-600 hover:after:scale-x-100 after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-greenPrimary-500 after:origin-center after:transition-transform after:duration-300 focus-visible:outline-none focus-visible:text-greenPrimary-600 cursor-pointer`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* ============= SEARCH =========== */}
              {/* <div className="hidden lg:flex items-center space-x-2">
                <div className="relative ">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutralPrimary-500 w-5 h-5" />
                  <Input
                    placeholder="Search for products..."
                    className="pl-10 w-64 bg-neutralPrimary-50 rounded-full placeholder:text-neutralPrimary-400"
                  />
                </div>
              </div> */}

              {/* ============= WISHLIST (SIGNED-IN CUSTOMERS) =========== */}
              {hasMounted && userId && !isUserAdmin && !isUserEmployee && (
                <Link
                  href="/my-account/wishlist"
                  aria-label={`Wishlist${
                    wishlistCount > 0 ? `, ${wishlistCount} items` : ""
                  }`}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full text-neutralPrimary-800 transition-colors duration-200 hover:bg-greenPrimary-950 hover:text-greenPrimary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenPrimary-500/40"
                >
                  <Heart className="w-[22px] h-[22px]" />
                  {wishlistCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-semibold leading-none text-white ring-2 ring-white">
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              {!isUserAdmin && !isUserEmployee && (
                <Link
                  href="/my-cart"
                  aria-label={`Cart${
                    totalCartItems > 0 ? `, ${totalCartItems} items` : ""
                  }`}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full text-neutralPrimary-800 transition-colors duration-200 hover:bg-greenPrimary-950 hover:text-greenPrimary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenPrimary-500/40"
                >
                  <LiaShoppingBagSolid className="w-6 h-6" />
                  {totalCartItems > 0 && (
                    <span className="absolute top-0.5 right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-greenPrimary-500 px-1 text-[11px] font-semibold leading-none text-white ring-2 ring-white">
                      {totalCartItems > 99 ? "99+" : totalCartItems}
                    </span>
                  )}
                </Link>
              )}

              {/* ============ LOGIN ========== */}
              {/* //* ==== THE SERVER CAN'T READ THE LOGIN COOKIE: HOLD THE SPACE UNTIL MOUNT,
                  //* OR SIGNED-IN USERS GET A HYDRATION ERROR (SERVER "LOGIN" VS CLIENT MENU) ==== */}
              {!hasMounted ? (
                <span aria-hidden="true" className="block h-10 w-10" />
              ) : userId ? (
                <CustomNavDropdown />
              ) : (
                <Link href="/login" className="">
                  <button className="text-base font-semibold text-neutral-700 ml-4 cursor-pointer max-sm:hidden">
                    Login
                  </button>
                </Link>
              )}

              {/* ========== Mobile Menu Button ========== */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-10 w-10 rounded-full text-neutralPrimary-800 hover:bg-greenPrimary-950 hover:text-greenPrimary-600"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>

          {/* ========= MOBILE VIEW ========== */}
          {isMenuOpen && (
            <div className="lg:hidden max-h-[calc(100dvh-8rem)] overflow-y-auto border-t border-neutralPrimary-100 py-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col gap-1">
                {/* ========= MOBILE SEARCH BAR ======== */}
                {/* <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search for products..."
                    className="pl-10 bg-neutralPrimary-50 rounded-full placeholder:text-neutralPrimary-400"
                  />
                </div> */}
                {/* =========== LINKS ============= */}
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    href={link.href}
                    aria-current={link.isActive ? "page" : undefined}
                    className={`${
                      link.isActive
                        ? "bg-greenPrimary-950 text-greenPrimary-600 font-semibold"
                        : "text-neutralPrimary-800 font-medium hover:bg-neutralPrimary-50"
                    } rounded-lg px-3 py-3 text-base transition-colors duration-200`}
                  >
                    {link.label}
                  </Link>
                ))}
                {/* =========== LOGIN ====== */}
                {!userId && (
                  <Link
                    onClick={() => setIsMenuOpen(false)}
                    href="/login"
                    className="mt-3 inline-flex h-11 items-center justify-center rounded-full bg-greenPrimary-500 px-6 text-base font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-greenPrimary-600"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

// ! ============ KEEP IT ==============
// ? ====================== CART API IMPLEMENTED VERSION ======================
// "use client";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Skeleton } from "@/components/ui/skeleton";
// // import { useCart } from "@/modules/cart/hooks/useCart";
// import { getUserInfo } from "@/modules/auth/services/auth.service";
// import { Menu, Search, X } from "lucide-react";
// import Image from "next/image";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import React, { useState } from "react";
// import { LiaShoppingBagSolid } from "react-icons/lia";
// import CustomNavDropdown from "@/components/primitives/CustomNavDropdown";
// import { useGet } from "@/hooks/api/useGet";
// import { ICart } from "@/modules/cart/types/cart.types";

// export default function Navbar() {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   // const { totalCartItems, isCartLoading } = useCart();
//   const pathName = usePathname();

//   const userInfo =
//     (getUserInfo() as {
//       sub?: number;
//       email?: string;
//       role?: number;
//     }) || {};

//   const { sub: userId } = userInfo;

//   const shouldFetchCategory = !!userId;
//   const { data: totalCartItems, isLoading: isCartLoading } = useGet<ICart>(
//     `/cart`,
//     [`getAllCartData`],
//     undefined,
//     shouldFetchCategory
//   );

//   // console.log("totalCartItems", totalCartItems.items);

//   const cartData = totalCartItems?.items?.length;

//   console.log("cartData", cartData);

//   // `/cart`, ["getAllCartData"]

//   console.log("ok", userId);

//   // console.log("current user info:", userId, email, role);

//   return (
//     <>
//       <nav className="sticky top-0 z-50 border-b border-border">
//         <div className="container mx-auto px-4">
//           <div className="flex items-center justify-between h-24 py-6">
//             {/* ===== LOGO ======= */}
//             <Link href="/">
//               <Image
//                 src="/images/brand/logo.png"
//                 alt="Natura Logo"
//                 height={66}
//                 width={176}
//               />
//             </Link>

//             {/* Desktop Navigation */}
//             <nav className="hidden lg:flex items-center space-x-8">
//               {/* ========== LINKS ========= */}
//               <Link
//                 href="/"
//                 className={`${
//                   pathName === "/"
//                     ? "text-greenPrimary-500"
//                     : "text-neutralPrimary-800"
//                 } hover:text-greenPrimary-500 text-lg font-medium cursor-pointer`}
//               >
//                 Home
//               </Link>
//               <Link
//                 href="/about-us"
//                 className={`${
//                   pathName === "/about-us"
//                     ? "text-greenPrimary-500"
//                     : "text-neutralPrimary-800"
//                 } hover:text-greenPrimary-500 text-lg font-medium cursor-pointer`}
//               >
//                 About Us
//               </Link>
//               <Link
//                 href="/product"
//                 className={`${
//                   pathName === "/product"
//                     ? "text-greenPrimary-500"
//                     : "text-neutralPrimary-800"
//                 } hover:text-greenPrimary-500 text-lg font-medium cursor-pointer`}
//               >
//                 Product
//               </Link>
//               {/* <Link
//                 href="/media-news"
//                 className={`${
//                   pathName === "/media-news"
//                     ? "text-greenPrimary-500"
//                     : "text-neutralPrimary-800"
//                 } hover:text-greenPrimary-500 text-lg font-medium cursor-pointer`}
//               >
//                 Media & News
//               </Link>
//                 <Link
//                 href="/career"
//                 className={`${
//                   pathName === "/career"
//                     ? "text-greenPrimary-500"
//                     : "text-neutralPrimary-800"
//                 } hover:text-greenPrimary-500 text-lg font-medium cursor-pointer`}
//               >
//                 Career
//               </Link> */}
//               <Link
//                 href="/dashboard"
//                 className={`${
//                   pathName === "/dashboard"
//                     ? "text-greenPrimary-500"
//                     : "text-neutralPrimary-800"
//                 }text-neutralPrimary-800 text-lg font-medium py-2`}
//               >
//                 Dashboard
//               </Link>
//               <Link
//                 href="/contact-us"
//                 className={`${
//                   pathName === "/contact-us"
//                     ? "text-greenPrimary-500"
//                     : "text-neutralPrimary-800"
//                 } hover:text-greenPrimary-500 text-lg font-medium cursor-pointer`}
//               >
//                 Contact Us
//               </Link>
//             </nav>

//             <div className="flex items-center space-x-4">
//               {/* ============= SEARCH =========== */}
//               <div className="hidden lg:flex items-center space-x-2">
//                 <div className="relative ">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutralPrimary-500 w-5 h-5" />
//                   <Input
//                     placeholder="Search for products..."
//                     className="pl-10 w-64 bg-neutralPrimary-50 rounded-full placeholder:text-neutralPrimary-400"
//                   />
//                 </div>
//               </div>

//               <Link href="/my-cart" className="relative">
//                 <LiaShoppingBagSolid className="w-5 h-5" />

//                 {isCartLoading ? (
//                   <Skeleton className="absolute -top-2 -right-5 bg-gray-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" />
//                 ) : (
//                   Number(cartData) > 0 && (
//                     <span className="absolute -top-2 -right-5 bg-greenPrimary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//                       {cartData}
//                     </span>
//                   )
//                 )}
//               </Link>

//               {/* ============ LOGIN ========== */}
//               {userId ? (
//                 <CustomNavDropdown />
//               ) : (
//                 <Link href="/login" className="">
//                   <button className="text-base font-semibold text-neutral-700 ml-4 cursor-pointer max-sm:hidden">
//                     Login
//                   </button>
//                 </Link>
//               )}
//               {/* <Link href="/login" className="">
//                 <button className="text-base font-semibold text-neutral-700 ml-4 cursor-pointer max-sm:hidden">
//                   Login
//                 </button>
//               </Link> */}

//               {/* ========== Mobile Menu Button ========== */}
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="lg:hidden"
//                 onClick={() => setIsMenuOpen(!isMenuOpen)}
//               >
//                 {isMenuOpen ? (
//                   <X className="w-5 h-5" />
//                 ) : (
//                   <Menu className="w-5 h-5" />
//                 )}
//               </Button>
//             </div>
//           </div>

//           {/* Mobile Menu */}
//           {isMenuOpen && (
//             <div className="lg:hidden py-4 border-t border-border">
//               <div className="flex flex-col space-y-4">
//                 {/* ========= MOBILE SEARCH BAR ======== */}
//                 <div className="relative mb-4">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
//                   <Input
//                     placeholder="Search for products..."
//                     className="pl-10 bg-neutralPrimary-50 rounded-full placeholder:text-neutralPrimary-400"
//                   />
//                 </div>
//                 {/* =========== LINKS ============= */}
//                 <Link
//                   href="/"
//                   className={`${
//                     pathName === "/"
//                       ? "text-greenPrimary-500"
//                       : "text-neutralPrimary-800"
//                   }text-neutralPrimary-800 text-lg font-medium py-2`}
//                 >
//                   Home
//                 </Link>
//                 <Link
//                   href="/about-us"
//                   className={`${
//                     pathName === "/about-us"
//                       ? "text-greenPrimary-500"
//                       : "text-neutralPrimary-800"
//                   }text-neutralPrimary-800 text-lg font-medium py-2`}
//                 >
//                   About Us
//                 </Link>
//                 <Link
//                   href="/product"
//                   className={`${
//                     pathName === "/product"
//                       ? "text-greenPrimary-500"
//                       : "text-neutralPrimary-800"
//                   }text-neutralPrimary-800 text-lg font-medium py-2`}
//                 >
//                   Product
//                 </Link>
//                 {/* <Link
//                   href="/media-news"
//                   className={`${
//                     pathName === "/media-news"
//                       ? "text-greenPrimary-500"
//                       : "text-neutralPrimary-800"
//                   }text-neutralPrimary-800 text-lg font-medium py-2`}
//                 >
//                   Media & News
//                 </Link>
//                 <Link
//                   href="/career"
//                   className={`${
//                     pathName === "/career"
//                       ? "text-greenPrimary-500"
//                       : "text-neutralPrimary-800"
//                   }text-neutralPrimary-800 text-lg font-medium py-2`}
//                 >
//                   Career
//                 </Link> */}

//                 <Link
//                   href="/contact-us"
//                   className={`${
//                     pathName === "/contact-us"
//                       ? "text-greenPrimary-500"
//                       : "text-neutralPrimary-800"
//                   }text-neutralPrimary-800 text-lg font-medium py-2`}
//                 >
//                   Contact Us
//                 </Link>
//                 {/* =========== LOGIN ====== */}
//                 <Link href="/login" className="">
//                   <button
//                     className={`${
//                       pathName === "/login"
//                         ? "text-greenPrimary-500"
//                         : "text-neutralPrimary-800"
//                     }text-neutralPrimary-800 text-lg font-medium py-2`}
//                   >
//                     Login
//                   </button>
//                 </Link>
//               </div>
//             </div>
//           )}
//         </div>
//       </nav>
//     </>
//   );
// }
