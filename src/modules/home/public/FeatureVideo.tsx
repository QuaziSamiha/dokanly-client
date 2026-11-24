import { useHomeContent } from "@/modules/home/hooks/useHomeContent";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import { getEmbedUrl } from "@/lib/utils/url.utils";
import Image from "next/image";
import Link from "next/link";

export default function FeatureVideo() {
  const { ovc, isHomeContentLoading } = useHomeContent();

  // Get the first item from the list
  const activeMedia = ovc?.[0];

  if (isHomeContentLoading) {
    return (
      <section className="mx-4 2xl:mx-0">
        <Skeleton className="w-full aspect-video xl:aspect-auto xl:h-[550px] rounded-xl" />
      </section>
    );
  }

  if (!activeMedia) return null;

  // const isGif = activeMedia.image?.toLowerCase().endsWith(".gif");

  return (
    <Link
      href={activeMedia.redirectUrl || "/"}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <section className="mx-4 2xl:mx-0 overflow-hidden rounded-xl">
        {activeMedia.image ? (
          <div className="rounded-lg overflow-hidden border border-neutral-200 w-full bg-gray-100 flex justify-center">
            <Image
              src={activeMedia.image}
              alt={activeMedia.title || "OVC Media"}
              width={800}
              height={450}
              className="w-full xl:h-[400px] object-contain"
              unoptimized={activeMedia.image.toLowerCase().endsWith(".gif")}
            />
          </div>
        ) : activeMedia.videoUrl && activeMedia.title ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full aspect-video xl:aspect-auto xl:h-[550px] object-cover"
          >
            <source src={activeMedia.videoUrl} type="video/mp4" />
          </video>
        ) : activeMedia.videoUrl ? (
          <div className="w-full aspect-video xl:aspect-auto xl:h-[550px]">
            <iframe
              src={getEmbedUrl(activeMedia.videoUrl)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : null}
      </section>
    </Link>
  );
}

// ? ========= ONLY FOR VIDEO =============
// import { useHomeContent } from "@/modules/home/hooks/useHomeContent";
// import { Skeleton } from "@/components/ui/skeleton"; // Path to your shadcn component
// import React from "react";
// import { getEmbedUrl } from "@/lib/utils/url.utils";

// export default function FeatureVideo() {
//   const { ovc, isHomeContentLoading } = useHomeContent();

//   return (
//     <section className="max-xl:px-4 lg:mx-4 2xl:mx-0">
//       {isHomeContentLoading ? (
//         /* --- Shadcn Skeleton --- */
//         <Skeleton className="w-full xl:h-[550px] h-[300px] rounded-xl" />
//       ) : /* --- Actual Content --- */
//       ovc?.[0]?.videoUrl && ovc?.[0]?.title ? (
//         <video autoPlay muted loop className="w-full xl:h-[550px] object-cover">
//           <source src={ovc?.[0]?.videoUrl} type="video/mp4" />
//           {/* <source src="/videos/natura-care.mp4" type="video/mp4" /> */}
//         </video>
//       ) : (
//         <div className="rounded-lg overflow-hidden border border-neutral-200 w-full">
//           {ovc?.[0]?.videoUrl && (
//             <iframe
//               src={getEmbedUrl(ovc?.[0]?.videoUrl)}
//               className="w-full xl:h-[400px]"
//               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//               allowFullScreen
//             />
//           )}
//         </div>
//       )}
//     </section>
//   );
// }
