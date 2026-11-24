import React from "react";
import { SlLocationPin } from "react-icons/sl";
import { HiOutlineMail } from "react-icons/hi";
import { FiPhone } from "react-icons/fi";

const iconClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-greenPrimary-950 text-greenPrimary-600 text-lg";

export default function Map() {
  const mapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.9324285816087!2d90.3994053!3d23.7497889!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b96760c24d41%3A0xb8ae7a1c4d47380e!2sNatura%20Care%20Limited!5e0!3m2!1sen!2sbd!4v1757243489534!5m2!1sen!2sbd";
  return (
    <section className="w-full h-full">
      <div className="flex h-full flex-col gap-5 rounded-2xl border border-neutralPrimary-200 bg-white p-3 shadow-sm sm:p-4">
        <iframe
          src={mapUrl}
          title="Natura Care Limited location on Google Maps"
          width="100%"
          height="100%"
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-64 w-full flex-1 rounded-xl border-0 sm:h-80 lg:min-h-[320px]"
        ></iframe>
        <div className="grid grid-cols-1 gap-4 px-1 pb-1 sm:grid-cols-2 sm:gap-x-6">
          <a
            href="tel:+8809644556677"
            className="group flex items-center gap-3 text-neutralPrimary-800 transition-colors duration-200 hover:text-greenPrimary-600"
          >
            <span className={iconClass}>
              <FiPhone />
            </span>
            <span className="text-[15px] font-medium leading-6">
              +8809644556677
            </span>
          </a>
          <a
            href="mailto:info@naturacarebd.com"
            className="group flex min-w-0 items-center gap-3 text-neutralPrimary-800 transition-colors duration-200 hover:text-greenPrimary-600"
          >
            <span className={iconClass}>
              <HiOutlineMail />
            </span>
            <span className="truncate text-[15px] font-medium leading-6">
              info@naturacarebd.com
            </span>
          </a>
          <div className="flex items-center gap-3 text-neutralPrimary-800 sm:col-span-2">
            <span className={iconClass}>
              <SlLocationPin />
            </span>
            <address className="text-[15px] font-medium not-italic leading-6">
              Padma Center 32/1, Dilu Road, New Eskaton, Dhaka-1000, Bangladesh
            </address>
          </div>
        </div>
      </div>
    </section>
  );
}
