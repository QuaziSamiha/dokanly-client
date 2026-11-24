import { ICartCard } from "@/modules/cart/types/cart.types";
import Image from "next/image";
import React from "react";

export default function CheckOutItem({
  imageUrl,
  name,
  pricePerItem,
  discountPricePerItem,
  index,
  perItemQuantity,
}: ICartCard) {
  return (
    <div
      key={index}
      className="py-6 border-b border-neutralPrimary-300 last:border-0"
    >
      <div className="flex justify-between items-start gap-4">
        {/* === LEFT SIDE: IMAGE + NAME + QUANTITY === */}
        <div className="flex items-start gap-4">
          <div className="bg-backgroundPeach rounded-lg min-w-[70px] p-2 flex items-center justify-center">
            <Image
              src={imageUrl ?? ""}
              alt={name ?? ""}
              width={60}
              height={60}
              className="w-full xl:w-[60px] h-[60px] object-contain lg:object-cover rounded-md"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="max-md:line-clamp-1 line-clamp-2 text-base font-semibold text-neutralPrimary-800">
              {name}
            </p>
            <p className="text-neutralPrimary-500 font-medium text-sm">
              X{perItemQuantity}
            </p>
          </div>
        </div>

        {/* === RIGHT SIDE: PRICE === */}
        <div className="flex items-start">
          <p className="text-neutralPrimary-800 font-semibold whitespace-nowrap">
            ৳ {discountPricePerItem && discountPricePerItem > 0 ? discountPricePerItem : pricePerItem}
          </p>
        </div>
      </div>
    </div>
  );
}

// import { ICartCard } from "@/modules/cart/types/cart.types";
// import Image from "next/image";
// import React from "react";

// export default function CheckOutItem({
//   imageUrl,
//   name,
//   pricePerItem,
//   index,
//   perItemQuantity,
// }: ICartCard) {
//   return (
//     <div
//       key={index}
//       className="py-6 border-b border-neutralPrimary-300 last:border-0"
//     >
//       <div className="flex justify-between items-start gap-4">
//         {/* === LEFT SIDE: IMAGE + NAME + QUANTITY === */}
//         <div className="flex items-start gap-4">
//           <div className="bg-backgroundPeach rounded-lg w-fit p-2 flex items-center justify-center">
//             <Image
//               src={imageUrl ?? ""}
//               alt={name ?? ""}
//               width={60}
//               height={60}
//               className="w-[60px] h-[60px] object-cover rounded-md"
//             />
//           </div>

//           <div className="flex flex-col gap-1.5">
//             <p className="line-clamp-2 text-base font-semibold text-neutralPrimary-800">
//               {name}
//             </p>
//             <p className="text-neutralPrimary-500 font-medium text-sm">
//               X{perItemQuantity}
//             </p>
//           </div>
//         </div>

//         {/* === RIGHT SIDE: PRICE === */}
//         <div className="flex items-start">
//           <p className="text-neutralPrimary-800 font-semibold whitespace-nowrap">
//             ৳ {pricePerItem}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
