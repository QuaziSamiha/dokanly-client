import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import React from "react";
import { ProductCard } from "../../shared/ProductCard";
import { IProduct } from "@/modules/product/types/product.types";
import ProductCardSkeleton from "../../shared/ProductCardSkeleton";

interface IProps {
  title?: string;
  products: IProduct[];
  isLoading: boolean;
}

export default function CarouselWithTitle({
  products,
  title,
  isLoading = false,
}: IProps) {
  // * Show placeholders while loading so the section doesn't pop in empty
  const items: (IProduct | null)[] = isLoading
    ? Array.from({ length: 4 }, () => null)
    : products ?? [];

  if (!isLoading && items.length === 0) return null;

  return (
    <section className="w-full" aria-label={title}>
      <Carousel opts={{ align: "start" }}>
        <div className="mb-4 flex items-center justify-between gap-4 sm:mb-6">
          <h2 className="text-xl font-semibold text-neutralPrimary-800 sm:text-2xl lg:text-3xl">
            {title}
          </h2>
          <div className="flex shrink-0 gap-2 sm:gap-3">
            <CarouselPrevious className="static translate-y-0 cursor-pointer border-greenPrimary-300 text-greenPrimary-600 hover:bg-greenPrimary-50" />
            <CarouselNext className="static translate-y-0 cursor-pointer border-greenPrimary-300 text-greenPrimary-600 hover:bg-greenPrimary-50" />
          </div>
        </div>
        <CarouselContent>
          {items.map((product, index) => (
            <CarouselItem
              key={product?.id ?? index}
              className="basis-1/2 md:basis-1/3 xl:basis-1/4"
            >
              {product ? (
                <ProductCard product={product} />
              ) : (
                <ProductCardSkeleton />
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
