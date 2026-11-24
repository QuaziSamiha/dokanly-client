import Image from "next/image";
import React from "react";

export default function LoadingPage() {
  return (
    <div className="flex justify-center items-center min-h-[85vh] max-lg:min-h-[90vh]">
      <div className="py-12 max-lg:py-24 max-lg:p-4">
        <Image
          src="/images/brand/logo-hero.png"
          alt="Hero Image"
          width={640}
          height={250}
          className="h-64 w-auto mx-auto "
        />

        <p className="font-normal text-4xl text-neutralPrimary-700 text-center">
          প্রকৃতির স্পর্শে <br /> যত্ন প্রতিদিন
        </p>
      </div>
    </div>
  );
}
