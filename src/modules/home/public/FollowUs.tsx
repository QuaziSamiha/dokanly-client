"use client";

import { useHomeContent } from "@/modules/home/hooks/useHomeContent";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
} from "react-icons/fa";

export default function FollowUs() {
  const { platformRedirects, isHomeContentLoading } = useHomeContent();

  // Helper function to render the correct icon based on platformType
  const renderIcon = (type?: string) => {
    switch (type) {
      case "FACEBOOK":
        return <FaFacebookF className="text-greenPrimary-500 text-xl" />;
      case "INSTAGRAM":
        return <FaInstagram className="text-greenPrimary-500 text-xl" />;
      case "YOUTUBE":
        return <FaYoutube className="text-greenPrimary-500 text-xl" />;
      case "LINKEDIN":
        return <FaLinkedinIn className="text-greenPrimary-500 text-xl" />;
      default:
        return <FaLinkedinIn className="text-greenPrimary-500 text-xl" />;
    }
  };

  return (
    <section className="mx-4 2xl:mx-0">
      <main className="flex flex-col gap-4 lg:gap-8">
        <p className="text-center text-neutralPrimary-700 text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-medium">
          Stay Close to Natura
        </p>

        <div className="w-full rounded-2xl overflow-hidden">
          {isHomeContentLoading ? (
            /* --- Shadcn Skeleton Grid --- */
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="aspect-square w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4">
              {platformRedirects?.map((item, index) => (
                <main
                  key={index}
                  className="relative aspect-square overflow-hidden group cursor-pointer"
                >
                  <div className="relative w-full h-full">
                    {item?.image && (
                      <Image
                        src={item?.image}
                        alt={item?.platformName || "Social Media"}
                        fill
                        className="object-cover"
                      />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10 transition-all duration-500" />
                    <div className="absolute inset-0 z-20 opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-greenPrimary-900/40 via-transparent to-transparent mix-blend-overlay" />
                  </div>

                  <Link
                    href={item?.redirectUrl || "/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 z-30 flex items-center justify-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg transition-transform duration-300 md:group-hover:scale-125">
                      <div className="bg-neutralPrimary-200 w-10 h-10 rounded-full flex items-center justify-center">
                        {renderIcon(item?.platformType)}
                      </div>
                    </div>
                  </Link>
                </main>
              ))}
            </div>
          )}
        </div>
      </main>
    </section>
  );
}