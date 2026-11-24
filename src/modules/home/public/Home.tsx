"use client";
import React from "react";
import FollowUs from "./FollowUs";
import ShopBenefits from "./ShopBenefits";
import ProductSpotlight from "./ProductSpotlight";
// import NewArrival from "./NewArrival";
import FeatureVideo from "./FeatureVideo";
import OurMustHaves from "./OurMustHaves";
import Review from "./Review";
import HomeHero from "./HomeHero";

export default function Home() {
  return (
    <div className="flex flex-col max-lg:gap-4 gap-8">
      <HomeHero />
      <main className="container mx-auto max-lg:pt-3 pt-8 flex flex-col gap-10 lg:gap-14 mb-20">
        <OurMustHaves />
        <FeatureVideo />
        <Review />
        {/* <NewArrival /> */}
        <ProductSpotlight /> {/* //? DISCOVER MORE /> */}
        <ShopBenefits />
        <FollowUs />
      </main>
    </div>
  );
}
