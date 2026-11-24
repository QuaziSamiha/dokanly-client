import React from "react";

const SSLCommerzCard = () => {
  return (
    <div className="relative w-full max-w-2xl mx-auto border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <input type="radio" disabled className="accent-blue-500" />
          <span className="font-semibold text-gray-800">SSLCOMMERZ</span>
        </div>
        <div className="flex items-center gap-2">
          {/* <img src="/visa.png" alt="Visa" className="h-5" />
          <img src="/mastercard.png" alt="MasterCard" className="h-5" />
          <img src="/nagad.png" alt="Nagad" className="h-5" />
          <img src="/bkash.png" alt="bKash" className="h-5" /> */}
          <span className="text-sm text-gray-500 font-medium">+2</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative flex flex-col items-center justify-center py-10 text-center text-gray-500">
        {/* Browser Mock */}
        <div className="w-36 h-24 border border-gray-300 rounded-lg flex flex-col justify-between items-center">
          <div className="w-full h-5 border-b border-gray-200 flex items-center px-2 gap-1">
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
          </div>
          <div className="w-8 h-[2px] bg-gray-400 mb-5 rounded-full" />
        </div>

        <p className="mt-5 text-sm text-gray-600 max-w-sm">
          After clicking <span className="font-medium">“Pay Now”</span>, you will
          be redirected to SSLCOMMERZ to complete your purchase securely.
        </p>
      </div>

      {/* Overlay */}
      {/* <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
        <span className="text-gray-800 font-semibold text-base">
          🚧 Service under development
        </span>
        <p className="text-sm text-gray-600 mt-1">
          This payment option will be available soon
        </p>
      </div> */}
    </div>
  );
};

export default SSLCommerzCard;
