"use client";
import Image from "next/image";
import React, { useState } from "react";

export default function NewArrival() {
  const [isHovered, setIsHovered] = useState(true);

  return (
    <section
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="z-10 flex items-center justify-center max-md:h-[580px] max-lg:h-[700px] lg:h-[800px] lg:group overflow-hidden max-xl:mx-4"
    >
      <div className="flex justify-center items-center relative w-full lg:w-1/2 cursor-pointer h-full">
        {/* Image container */}
        <div
          className={`
            absolute h-fit max-md:top-[75%] md:top-[55%] lg:top-[28%] left-[53%] -translate-x-1/2 -translate-y-1/2
           transition-all duration-1000 ease-in-out z-20
            ${
              isHovered
                ? "lg:translate-y-[-12%]"
                : "-translate-y-5/6 lg:-translate-y-full"
            }`}
        >
          <Image
            src="/images/home/new-arrival.png"
            alt="New Item"
            width={407}
            height={584}
            className="relative z-5 h-[480px] w-full lg:w-[60vw]"
          />
        </div>

        {/* Text + Button */}
        <div
          className={`
            absolute bottom-6 lg:bottom-14 text-center w-full lg:w-1/2 h-fit 
            transition-all duration-700 ease-in-out
            ${
              isHovered
                ? "lg:-translate-y-[20%]"
                : "translate-y-1/6 lg:translate-y-full"
            }
          `}
        >
          <div className=" text-neutralPrimary-700 text-5xl font-semibold flex flex-col gap-2">
            <p>New</p>
            <p
            //  className={`${isHovered ? "z-10" : "-z-10"}`}
            >
              Natura Grow
            </p>
            <p
            // className={`${isHovered ? "display" : "hidden"}`}
            >
              Hair Oil
            </p>
          </div>
          <button
            className={`mt-6 px-4 py-2 text-neutralPrimary-700 font-semibold text-lg cursor-pointer hover:text-greenPrimary-500 hover:underline `}
          >
            View Details
          </button>
        </div>
      </div>
    </section>
  );
}
// "use client";
// import Image from "next/image";
// import React, { useState } from "react";

// export default function NewArrival() {
//   const [isHovered, setIsHovered] = useState(false);

//   return (
//     <section
//       className="flex items-center justify-center min-h-screen group border-4 border-blue-500 max-xl:mx-4"
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       <div className="relative w-full lg:w-[40vw] max-md:h-full h-[500px] overflow-hidden cursor-pointer">
//         {/* Image container */}
//         <div
//           className={`
//             absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
//             transition-all duration-700 ease-in-out x-[9999]
//             ${
//               isHovered
//                 ? "lg:translate-y-[-70%]"
//                 : "-translate-y-5/6 lg:-translate-y-full"
//             }
//           `}
//         >
//           {/* Shadow behind image */}
//           {/* <div className="absolute inset-0 bg-neutralPrimary-100/10 blur-2xl rounded-lg"></div> */}

//           <Image
//             src="/images/home/new-arrival.png"
//             alt="New Item"
//             width={407}
//             height={584}
//             className="relative z-5 h-80 w-full lg:w-[60vw]"
//           />
//         </div>

//         {/* Text + Button */}
//         <div
//           className={`
//             absolute bottom-12 left-1/2 -translate-x-1/2 text-center
//             transition-all duration-700 ease-in-out w-full lg:w-[20vw]
//             ${
//               isHovered
//                 ? "lg:translate-y-1/6"
//                 : "translate-y-1/6 lg:translate-y-full"
//             }
//           `}
//         >
//           <div className="text-neutralPrimary-700 text-5xl font-semibold flex flex-col gap-2">
//             <p>New</p>
//             <p>Natura Grow</p>
//             <p>Hair Oil</p>
//           </div>
//           <button className="mt-12 px-4 py-2 text-neutralPrimary-700 font-semibold text-lg cursor-pointer hover:text-greenPrimary-700 hover:underline">
//             View Details
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// }
