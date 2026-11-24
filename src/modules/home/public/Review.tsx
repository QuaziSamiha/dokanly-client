"use client";

import { CustomAutoCarousel } from "@/components/data-display/carousel/CustomAutoCarousel";
import { reviewData } from "@/modules/home/constants/home.constants";
import { MdStar } from "react-icons/md";
import { BiSolidQuoteAltLeft } from "react-icons/bi";

export default function Review() {
  return (
    <section className="mx-2 2xl:mx-0">
      <main className="flex flex-col gap-3 md:gap-6 lg:gap-8">
        <p className="text-center text-neutralPrimary-700 text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
          <span className="font-medium">Natura Works</span> -{" "}
          <span className="font-bold">Loved by Our Customers</span>
        </p>

        <CustomAutoCarousel
          data={reviewData}
          delay={4000}
          className="w-full"
          renderItem={(review) => (
            <div
              className="
                border border-greenPrimary-200 rounded-lg bg-white
                p-3 sm:p-4 lg:p-6
                flex flex-col justify-between items-center gap-2
                h-full
              "
            >
              <BiSolidQuoteAltLeft className="text-greenPrimary-300 font-bold h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />

              <div className="flex-1 flex flex-col justify-center text-center">
                <p className="text-greenPrimary-700 mb-2 text-xs sm:text-sm lg:text-base line-clamp-6 break-words">
                  {review.review}
                </p>
              </div>

              <div className="flex flex-col items-center gap-1">
                <h4 className="font-semibold text-greenPrimary-500 uppercase text-xs sm:text-sm lg:text-base break-words text-center">
                  {review.customerName}
                </h4>
                <div className="text-greenPrimary-500 flex items-center justify-center gap-1">
                  <MdStar className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  <p className="font-medium text-xs sm:text-sm lg:text-base">
                    {review.starNo}
                  </p>
                </div>
              </div>
            </div>
          )}
        />
      </main>
    </section>
  );
}

// "use client";

// import { CustomAutoCarousel } from "@/components/data-display/carousel/CustomAutoCarousel";
// import { reviewData } from "@/modules/home/constants/home.constants";
// import { MdStar } from "react-icons/md";
// import { BiSolidQuoteAltLeft } from "react-icons/bi";

// export default function Review() {
//   return (
//     <section className="w-full mx-auto">
//       <main className="flex flex-col gap-4 lg:gap-8">
//         <p className="text-center text-neutralPrimary-700 text-2xl lg:text-5xl">
//           <span className="font-medium">Natura Works</span> - <span className="font-bold">Loved by Our Customers</span>
//         </p>
//         <CustomAutoCarousel
//           data={reviewData}
//           delay={4000}
//           className="w-full"
//           renderItem={(review) => (
//             <div className="border border-greenPrimary-200 p-10 rounded-lg bg-white flex flex-col justify-center items-center gap-4 h-[440px]">
//               <BiSolidQuoteAltLeft className="text-greenPrimary-300 font-bold h-8 w-8" />
//               <div className="flex flex-col gap-8">
//                 <p className="text-greenPrimary-700 mb-4 text-center">
//                   {review.review}
//                 </p>
//                 <div>
//                   <h4 className="font-semibold text-center text-greenPrimary-500 uppercase">
//                     {review.customerName}
//                   </h4>
//                   <div className="text-greenPrimary-500 flex items-center justify-center gap-1">
//                     <MdStar className="w-4 h-4" />
//                     <p className="font-medium">{review.starNo}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         />
//       </main>
//     </section>
//   );
// }
