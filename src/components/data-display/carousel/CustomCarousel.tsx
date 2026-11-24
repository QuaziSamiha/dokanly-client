import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import React from "react";
import { ProductCard } from "@/modules/product/shared/ProductCard";
import { IProduct } from "@/modules/product/types/product.types";
import ProductCardSkeleton from "@/modules/product/shared/ProductCardSkeleton";
import { EmptyState } from "@/components/feedback/placeholders/EmptyState";

export default function CustomCarousel({
  products,
  isLoading = false,
}: {
  products: IProduct[];
  isLoading: boolean;
}) {
  return (
    <div className="w-full flex justify-center items-center">
      <div className="w-full max-w-[1440px]">
        {/* 2. Check if loading is finished AND the array is empty */}
        {!isLoading && (!products || products.length === 0) ? (
          <EmptyState />
        ) : (
          <Carousel>
            <CarouselContent className="items-stretch">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <CarouselItem
                    key={`skeleton-${index}`}
                    className="basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 flex"
                  >
                    <ProductCardSkeleton />
                  </CarouselItem>
                ))
              ) : (
                <>
                  {products?.map((product, index) => (
                    <CarouselItem
                      key={index}
                      className="basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 flex"
                    >
                      <ProductCard key={product?.id} product={product} />
                    </CarouselItem>
                  ))}
                </>
              )}
            </CarouselContent>

            {/* 3. Only show controls if there are products and not loading */}
            {!isLoading && products?.length > 0 && (
              <div className="flex justify-center gap-4 mt-8">
                <CarouselPrevious className="cursor-pointer static translate-y-0 text-greenPrimary-600 border-greenPrimary-300 hover:bg-greenPrimary-50" />
                <CarouselNext className="cursor-pointer static translate-y-0 text-greenPrimary-600 border-greenPrimary-300 hover:bg-greenPrimary-50" />
              </div>
            )}
          </Carousel>
        )}
      </div>
    </div>
  );
}

// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
// } from "@/components/ui/carousel";
// import React from "react";
// import { ProductCard } from "@/modules/product/shared/ProductCard";
// import { IProduct } from "@/modules/product/types/product.types";
// import ProductCardSkeleton from "@/modules/product/shared/ProductCardSkeleton";

// export default function CustomCarousel({
//   products,
//   isLoading = false,
// }: {
//   products: IProduct[];
//   isLoading: boolean;
// }) {
//   // console.log(products);
//   return (
//     <div className="w-full flex justify-center items-center">
//       <div className="w-full max-w-[1440px]">
//         <Carousel>
//           <CarouselContent className="items-stretch">
//             {isLoading ? (
//               Array.from({ length: 4 }).map((_, index) => (
//                 <CarouselItem
//                   key={`skeleton-${index}`}
//                   className="basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 flex"
//                 >
//                   <ProductCardSkeleton />
//                 </CarouselItem>
//               ))
//             ) : (
//               <>
//                 {products?.map((product, index) => (
//                   <CarouselItem
//                     key={index}
//                     className="basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 flex"
//                   >
//                     <ProductCard key={product?.id} product={product} />
//                   </CarouselItem>
//                 ))}
//               </>
//             )}
//           </CarouselContent>
//           <div className="flex justify-center gap-4 mt-8">
//             <CarouselPrevious className="cursor-pointer static text-greenPrimary-600 border-greenPrimary-300 hover:bg-greenPrimary-50" />
//             <CarouselNext className="cursor-pointer static text-greenPrimary-600 border-greenPrimary-300 hover:bg-greenPrimary-50" />
//           </div>
//         </Carousel>
//       </div>
//     </div>
//   );
// }
