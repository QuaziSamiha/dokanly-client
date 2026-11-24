"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-[var(--color-backgroundPrimary)] text-[var(--color-blackPrimary)]">
      {/* Background gradient circles */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[var(--color-greenPrimary-100)] opacity-30 blur-3xl rounded-full -translate-x-20 -translate-y-20"></div>
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-[var(--color-greenPrimary-400)] opacity-20 blur-3xl rounded-full translate-x-16 translate-y-16"></div>

      {/* Leafy decorative border lines */}
      <div className="absolute top-10 left-10 border-l-[8px] border-b-[8px] border-[var(--color-greenPrimary-500)] rounded-bl-3xl w-20 h-20"></div>
      <div className="absolute bottom-10 right-10 border-r-[8px] border-t-[8px] border-[var(--color-greenPrimary-500)] rounded-tr-3xl w-20 h-20"></div>

      {/* 404 Content */}
      <div className="z-10 flex flex-col items-center text-center px-6">
        <h1 className="text-[12rem] font-extrabold leading-none bg-gradient-to-br from-[var(--color-greenPrimary-500)] to-[var(--color-greenPrimary-700)] text-transparent bg-clip-text drop-shadow-xl">
          404
        </h1>

        <h2 className="text-3xl font-semibold text-[var(--color-greenPrimary-700)] mt-4">
          Oops! Page Not Found
        </h2>

        <p className="max-w-lg text-[var(--color-neutralPrimary-600)] mt-3 mb-8 text-lg">
          Looks like you wandered off the trail 🌿 The page you’re looking for
          doesn’t exist. Let’s take you back to greener paths.
        </p>

        <Link href="/" passHref>
          <Button className="cursor-pointer flex items-center gap-2 px-6 py-2 rounded-full text-white font-medium bg-gradient-to-r from-[var(--color-greenPrimary-400)] to-[var(--color-greenPrimary-600)] hover:from-[var(--color-greenPrimary-600)] hover:to-[var(--color-greenPrimary-400)] shadow-md transition-all duration-300">
            <ArrowLeft className="h-5 w-5" />
            Go Back Home
          </Button>
        </Link>
      </div>

      {/* Subtle floating leaf icons */}
      <div className="absolute top-1/3 left-10 text-[var(--color-greenPrimary-400)] text-6xl rotate-12 select-none">
        🍃
      </div>
      <div className="absolute bottom-1/4 right-12 text-[var(--color-greenPrimary-300)] text-5xl -rotate-12 select-none">
        🌱
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-sm text-[var(--color-neutralPrimary-500)]">
        © {new Date().getFullYear()} — <span className="font-semibold text-[var(--color-greenPrimary-600)]">Natura Care Limited</span>
      </div>
    </div>
  );
}