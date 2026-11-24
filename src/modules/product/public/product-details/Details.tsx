import React from "react";

export default function Details() {
  return (
    <section className="flex flex-col gap-6 max-lg:px-4">
      <p className="text-neutralPrimary-800 max-lg:text-base lg:text-4xl font-bold">
        Natura Grow Hair Oil and Hair Density Shampoo Combo: Your Complete
        Solution for Hair Fall Control and Density
      </p>
      <div className="flex flex-col gap-6 max-md:text-sm text-base">
        <p>
          {" "}
          Experience a transformative change in your hair health with the Natura
          Grow Hair Oil and Hair Density Shampoo Combo. This powerful duo is
          meticulously crafted to work synergistically, offering a comprehensive
          approach to tackle hair fall, promote new hair growth, and
          significantly enhance hair density and overall vitality. If
          you&apos;re struggling with thinning hair, excessive shedding, or
          simply desire stronger, fuller, and more lustrous locks, this combo is
          designed for you.
        </p>
        <div>
          <p className="font-bold">What&apos;s Inside the Combo:</p>
          <ul className="list-decimal list-inside">
            <li>Natura Grow Hair Oil</li>
            <li>Natura Grow Hair Fall Control & Hair Density Shampoo</li>
          </ul>
        </div>

        <p>
          <span className="font-bold">The Promise of Natura Grow: </span>{" "}
          Visible Results in Weeks Both products in this combo are formulated
          with potent natural ingredients and are engineered to deliver
          noticeable improvements rapidly. Users can expect to see a significant
          reduction in hair fall and the beginning of new hair growth within
          just 3 weeks of consistent use.
        </p>
        <div>
          <p className="font-bold">How to Use for Best Results:</p>
          <ul className="flex flex-col gap-3 list-inside list-decimal">
            <li>
              Natura Grow Hair Oil: Gently massage the hair oil into your scalp
              and hair, focusing on the roots. Leave it on for a few hours or
              overnight for maximum absorption.
            </li>
            <li>
              Natura Grow Hair Fall Control & Hair Density Shampoo: Wash your
              hair thoroughly with the shampoo, ensuring a good lather. Rinse
              well. The shampoo acts as a 2-in-1, often eliminating the need for
              a separate conditioner due to its rich conditioning properties.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
