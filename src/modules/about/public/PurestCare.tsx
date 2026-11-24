"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { IoArrowForwardCircleOutline } from "react-icons/io5";

export default function PurestCare() {
  return (
    <section className="relative w-full h-72 mb-8">
      {/* Image */}
      <Image
        src="/images/about/harsh-chemical.jpg"
        alt="Purest Care"
        fill
        className="object-cover object-center"
        priority
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-greenPrimary-500/80"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 h-full">
        <div className="text-white text-3xl font-medium text-center flex flex-col gap-2">
          <p>
            Embrace Nature&apos;s Purest Care
          </p>
          {/* <p>
            Say Goodbye to Harsh Chemicals – Embrace Nature&apos;s Purest Care
          </p> */}
          <p>with Natura Care!</p>
        </div>
        <Link href='/product'>
          <button className="text-neutralPrimary-700 text-base font-semibold border border-neutralPrimary-300 bg-white rounded-xl flex items-center justify-center gap-2 p-4 cursor-pointer w-fit">
            View All Products <IoArrowForwardCircleOutline size={18} />
          </button>
        </Link>
      </div>
    </section>
  );
}

// import React from "react";

// export default function PurestCare() {
//   return (
//     <section className="bg-[url('/images/about/harsh-chemical.jpg')] bg-cover bg-no-repeat w-full h-76">
//       <div className="flex flex-col items-center justify-center h-full">
//         <p>
//           Say Goodbye to Harsh Chemicals – Embrace Nature&apos;s Purest Care
//         </p>
//         <p>with NaturaCare!</p>
//       </div>
//     </section>
//   );
// }
