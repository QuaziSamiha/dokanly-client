"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Image from "next/image";
import { useHomeContent } from "@/modules/home/hooks/useHomeContent";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function HomeHero() {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false }),
  );

  const { heroSliders, isHomeContentLoading } = useHomeContent();

  const [api, setApi] = React.useState<CarouselApi | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [slideCount, setSlideCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    setSlideCount(api.scrollSnapList().length);
    setSelectedIndex(api.selectedScrollSnap());

    const onSelect = () => setSelectedIndex(api.selectedScrollSnap());
    api.on("select", onSelect);
    api.on("reInit", () => {
      setSlideCount(api.scrollSnapList().length);
      setSelectedIndex(api.selectedScrollSnap());
    });
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <section className="relative w-full overflow-hidden max-lg:mt-0 mt-12 bg-white">
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        className="w-full aspect-[1736/554]"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent className="aspect-[1736/554]">
          {isHomeContentLoading ? (
            <CarouselItem className="w-full h-full">
              <Skeleton className="w-full h-full rounded-none" />
            </CarouselItem>
          ) : (
            heroSliders.map((item, index) => (
              <CarouselItem key={index} className="relative h-full w-full">
                <Link
                  href={item.redirectUrl || "/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full"
                >
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={"Hero Image"}
                      fill
                      sizes="100vw"
                      priority={index === 0}
                      className="object-cover object-center"
                    />
                  )}
                </Link>
              </CarouselItem>
            ))
          )}
        </CarouselContent>
        <CarouselPrevious className="max-sm:hidden absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 bg-black/20 text-white hover:bg-black/50 cursor-pointer" />
        <CarouselNext className="max-sm:hidden absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 bg-black/20 text-white hover:bg-black/50 cursor-pointer" />

        {slideCount > 1 && (
          <div className="absolute bottom-2 sm:bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-10">
            {Array.from({ length: slideCount }).map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => api?.scrollTo(i)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  i === selectedIndex
                    ? "w-6 bg-greenPrimary-500"
                    : "w-2 bg-white/70 hover:bg-white"
                }`}
              />
            ))}
          </div>
        )}
      </Carousel>
    </section>
  );
}

// ? =========  STATIC ===========
// "use client";

// import * as React from "react";
// import Autoplay from "embla-carousel-autoplay";
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
// } from "@/components/ui/carousel";
// import Image from "next/image";
// import { heroData } from "@/modules/home/constants/home.constants";
// import { useHomeContent } from "@/modules/home/hooks/useHomeContent";

// export default function HomeHero() {
//   const plugin = React.useRef(
//     Autoplay({ delay: 3000, stopOnInteraction: false }),
//   );
//   const { heroSliders, isHomeContentLoading } = useHomeContent();
//   return (
//     <section className="relative w-full overflow-hidden max-lg:mt-0 mt-12">
//       <Carousel
//         plugins={[plugin.current]}
//         className="w-full h-full"
//         onMouseEnter={plugin.current.stop}
//         onMouseLeave={plugin.current.reset}
//       >
//         <CarouselContent className="h-full">
//           {isHomeContentLoading ? (
//             <p></p>
//           ) : (
//             <>
//               {" "}
//               {heroSliders.map((item, index) => (
//                 <CarouselItem key={index} className="relative h-full w-full">
//                   {item.image && (
//                     <Image
//                       src={item?.image}
//                       alt={"Hero Image"}
//                       width={1736}
//                       height={554}
//                       className="object-cover w-full h-auto"
//                     />
//                   )}
//                 </CarouselItem>
//               ))}
//             </>
//           )}
//         </CarouselContent>

//         <CarouselPrevious
//           className={`absolute left-5 top-1/2 -translate-y-1/2 bg-black/20 text-white hover:bg-black/50 cursor-pointer`}
//         />
//         <CarouselNext
//           className={`absolute right-5 top-1/2 -translate-y-1/2 bg-black/20 text-white hover:bg-black/50 cursor-pointer`}
//         />
//       </Carousel>
//     </section>
//   );
// }
