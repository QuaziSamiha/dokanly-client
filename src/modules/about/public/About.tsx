import React from "react";

export default function About() {
  return (
    <section className="container mx-auto px-4 md:px-6 py-10 lg:py-20">
      {/* Grid transitions:
          - Default: 1 column (mobile)
          - lg breakpoint: 3 columns (laptop/desktop)
      */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left Side: Header Section */}
        <div className="flex flex-col gap-4 text-center lg:text-left">
          <div className="flex flex-col gap-2">
            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-textTeal">
              About
            </p>
            <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-textTeal leading-tight">
              Natura Care Limited
            </p>
          </div>
        </div>

        {/* Right Side: Content Section */}
        <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8">
          <p className="text-textBlack text-sm md:text-base lg:text-lg leading-7 md:leading-8 text-justify lg:text-left">
            Natura Care Limited is a fast-growing personal care company
            dedicated to creating effective solutions powered by the goodness of
            natural ingredients. We are committed to redefining the personal
            care landscape of Bangladesh and beyond. With a strong foundation in
            Hair Care and Skin Care, our purpose is to deliver high-quality,
            innovative, and accessible personal care solutions that cater to the
            evolving needs of modern consumers.
          </p>

          <p className="text-textBlack text-sm md:text-base lg:text-lg leading-7 md:leading-8 text-justify lg:text-left">
            In collaboration with our formulation and technology partner, Shea
            Olein (USA), Natura Care combines global expertise with the power of
            natural ingredients. This partnership enables us to deliver
            world-class personal care solutions designed for the needs of modern
            consumers.
          </p>

          <p className="text-textBlack text-sm md:text-base lg:text-lg leading-7 md:leading-8 text-justify lg:text-left">
            As a proud concern of Padma Group of Converters (PGC)—a leading
            conglomerate in packaging and converting— Natura Care is supported
            by the scale, innovation, and infrastructure of one of the most
            respected industrial groups in Bangladesh. This unique synergy
            allows us to seamlessly integrate world-class product development
            with cutting-edge packaging and distribution capabilities, giving us
            a competitive edge in delivering value to our consumers.
          </p>

          <p className="text-textBlack text-sm md:text-base lg:text-lg leading-7 md:leading-8 text-justify lg:text-left">
            At Natura Care, we believe that every product tells a story of
            trust, innovation, and care. Our portfolio has been thoughtfully
            crafted to combine natural ingredients with advanced formulations,
            ensuring that each product delivers not only functional benefits but
            also an experience that inspires confidence and well-being. Designed
            to be affordable, accessible, and aspirational, our offerings are
            tailored to the needs of today&apos;s consumers who seek both
            quality and value.
          </p>

          <p className="text-textBlack text-sm md:text-base lg:text-lg leading-7 md:leading-8 text-justify lg:text-left font-medium">
            Driven by innovation, guided by consumer insight, and committed to
            sustainable growth, Natura Care Limited aspires to become one of the
            most trusted names in the FMCG sector in Bangladesh. Our journey has
            only just begun, and with an unwavering focus on excellence,
            affordability, and relevance, we are building a brand that will
            stand the test of time.
          </p>
        </div>
      </div>
    </section>
  );
}
// import React from "react";

// export default function About() {
//   return (
//     <section className="grid grid-cols-3">
//       <div className="flex flex-col gap-4">
//         {/* <p className="text-lg font-semibold text-textTeal">
//           A b o u t <span className="ml-1.5"> u s</span>
//         </p> */}
//         <div className="flex flex-col gap-2">
//           <p className="max-md:text-xl text-3xl font-bold text-textTeal">
//             About
//           </p>
//           <p className="max-md:text-2xl text-4xl font-bold text-textTeal">
//             Natura Care Limited
//           </p>
//         </div>
//       </div>
//       <div className="col-span-2 flex flex-col gap-8">
//         <p className="text-textBlack leading-8">
//           Natura Care Limited is a fast-growing personal care company dedicated
//           to creating effective solutions powered by the goodness of natural
//           ingredients. We are committed to redefining the personal care
//           landscape of Bangladesh and beyond. With a strong foundation in Hair
//           Care and Skin Care, our purpose is to deliver high-quality,
//           innovative, and accessible personal care solutions that cater to the
//           evolving needs of modern consumers.
//         </p>
//         <p className="text-textBlack leading-8">
//           In collaboration with our formulation and technology partner, Shea
//           Olein (USA), Natura Care combines global expertise with the power of
//           natural ingredients. This partnership enables us to deliver
//           world-class personal care solutions designed for the needs of modern
//           consumers.
//         </p>
//         <p className="text-textBlack leading-8">
//           As a proud concern of Padma Group of Converters (PGC)—a leading
//           conglomerate in packaging and converting— Natura Care is supported by
//           the scale, innovation, and infrastructure of one of the most respected
//           industrial groups in Bangladesh. This unique synergy allows us to
//           seamlessly integrate world-class product development with cutting-edge
//           packaging and distribution capabilities, giving us a competitive edge
//           in delivering value to our consumers.
//         </p>
//         <p className="text-textBlack leading-8">
//           At Natura Care, we believe that every product tells a story of trust,
//           innovation, and care. Our portfolio has been thoughtfully crafted to
//           combine natural ingredients with advanced formulations, ensuring that
//           each product delivers not only functional benefits but also an
//           experience that inspires confidence and well-being. Designed to be
//           affordable, accessible, and aspirational, our offerings are tailored
//           to the needs of today&apos;s consumers who seek both quality and
//           value.
//         </p>
//         <p className="text-textBlack leading-8">
//           Driven by innovation, guided by consumer insight, and committed to
//           sustainable growth, Natura Care Limited aspires to become one of the
//           most trusted names in the FMCG sector in Bangladesh. Our journey has
//           only just begun, and with an unwavering focus on excellence,
//           affordability, and relevance, we are building a brand that will stand
//           the test of time.
//         </p>
//       </div>
//     </section>
//   );
// }
