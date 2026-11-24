"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BadgePercent, CheckCircle2, Loader2, X } from "lucide-react";
import { IPromotion } from "@/modules/promotion/types/promotion.types";
import { axiosInstance } from "@/lib/axios/axiosInstance";
import { IGenericErrorResponse, ResponseSuccessType } from "@/types";
import { formatTk } from "@/modules/cart/utils/cart-pricing.utils";
import { useCurrentPromotion } from "@/modules/promotion/hooks/useCurrentPromotion";
import {
  formatDiscount,
  isUsedUp,
  startOfDay,
} from "@/modules/promotion/utils/promotion.utils";

export interface IPromotionInfo {
  promotionId?: number | null;
  promotionAmount: number;
}

interface IProps {
  setPromotionInfo: React.Dispatch<React.SetStateAction<IPromotionInfo>>;
  /** Subtotal of the items: what the coupon's limits and percentage apply to. */
  subTotal: number;
  promotionAmount: number;
}

/**
 * Coupon box for the order summary. Looked up by code on the server so private
 * (non-public) codes work too. The discount is worked out the same way the
 * server does when the order is placed.
 */
export default function Promotion({ setPromotionInfo, subTotal, promotionAmount }: IProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<IPromotion | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);
  const { promotions } = useCurrentPromotion();

  // * Public coupons usable today, offered as one-tap suggestions.
  const suggestions = promotions.filter(
    (p) =>
      !isUsedUp(p) &&
      !(p.isUpcoming ?? startOfDay(p.startDate) > startOfDay(new Date())),
  );

  const applyCode = async (codeToApply: string = code) => {
    const trimmed = codeToApply.trim();
    if (!trimmed) {
      setError("Enter a coupon code");
      return;
    }

    setError(null);
    setIsChecking(true);
    let found: IPromotion | undefined;
    try {
      const response = (await axiosInstance.get(
        `/promotions/by-code/${encodeURIComponent(trimmed)}`,
      )) as unknown as ResponseSuccessType;
      found = response?.data as IPromotion | undefined;
    } catch (err) {
      setError((err as IGenericErrorResponse)?.message || "This code isn't valid");
      return;
    } finally {
      setIsChecking(false);
    }

    if (!found) {
      setError("This code isn't valid");
      return;
    }
    if (found.minPurchase && subTotal < Number(found.minPurchase)) {
      setError(
        `Add ${formatTk(Number(found.minPurchase) - subTotal)} more to use this code (minimum ${formatTk(Number(found.minPurchase))}).`,
      );
      return;
    }
    if (found.maxPurchase && subTotal > Number(found.maxPurchase)) {
      setError(`This code works on orders up to ${formatTk(Number(found.maxPurchase))}.`);
      return;
    }

    setPromotionInfo({
      promotionId: found.id,
      promotionAmount:
        found.discountType === "PERCENTAGE"
          ? (subTotal * found.discountValue) / 100
          : found.discountValue || 0,
    });
    setAppliedPromo(found);
    setCode("");
  };

  const removeCode = () => {
    setPromotionInfo({ promotionAmount: 0 });
    setAppliedPromo(null);
    setError(null);
  };

  if (appliedPromo) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-greenPrimary-400 bg-greenPrimary-950 p-3 animate-in fade-in zoom-in-95 duration-300 motion-reduce:animate-none">
        <CheckCircle2 size={20} className="shrink-0 text-greenPrimary-500" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-sm font-bold tracking-wide text-greenPrimary-700">
            {appliedPromo.couponCode}
          </p>
          <p className="text-xs text-greenPrimary-600">
            {appliedPromo.discountType === "PERCENTAGE"
              ? `${appliedPromo.discountValue}% off`
              : `${formatTk(appliedPromo.discountValue)} off`}{" "}
            · you save {formatTk(promotionAmount)}
          </p>
        </div>
        <button
          type="button"
          onClick={removeCode}
          aria-label="Remove coupon"
          className="cursor-pointer rounded-lg p-1.5 text-neutralPrimary-500 transition-colors hover:bg-white hover:text-destructive-500"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-greenPrimary-600 underline-offset-2 hover:underline"
      >
        <BadgePercent size={16} />
        Have a coupon code?
        {suggestions.length > 0 && (
          <span className="rounded-full bg-greenPrimary-950 px-2 py-0.5 text-xs text-greenPrimary-600">
            {suggestions.length} available
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="checkout-coupon" className="text-sm font-medium text-neutralPrimary-700">
        Coupon code
      </label>
      <div className="flex gap-2">
        <input
          id="checkout-coupon"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            if (error) setError(null);
          }}
          // * Enter applies the code instead of submitting the order form.
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              applyCode();
            }
          }}
          placeholder="e.g. EID10"
          autoComplete="off"
          autoFocus
          aria-invalid={!!error}
          aria-describedby={error ? "checkout-coupon-error" : undefined}
          className={`h-11 min-w-0 flex-1 rounded-lg border bg-white px-3 font-mono text-sm uppercase tracking-wide text-neutralPrimary-800 outline-none transition-all placeholder:font-sans placeholder:normal-case placeholder:tracking-normal focus:ring-4 ${
            error
              ? "border-destructive-500 focus:ring-destructive-500/10"
              : "border-neutralPrimary-300 focus:border-greenPrimary-400 focus:ring-greenPrimary-500/10"
          }`}
        />
        <button
          type="button"
          onClick={() => applyCode()}
          disabled={isChecking || !code.trim()}
          className="inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-neutralPrimary-800 px-4 text-sm font-semibold text-white transition-colors hover:bg-neutralPrimary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isChecking && <Loader2 size={14} className="animate-spin" />}
          Apply
        </button>
      </div>
      {error && (
        <p id="checkout-coupon-error" role="alert" className="text-xs text-destructive-500">
          {error}
        </p>
      )}

      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-neutralPrimary-500">Available coupons</p>
            <Link
              href="/all-promotions"
              target="_blank"
              className="text-xs font-semibold text-greenPrimary-600 underline-offset-2 hover:underline"
            >
              View details
            </Link>
          </div>
          <ul className="flex flex-col gap-2">
            {suggestions.map((p) => {
              const shortBy = p.minPurchase ? Number(p.minPurchase) - subTotal : 0;
              const overMax = !!p.maxPurchase && subTotal > Number(p.maxPurchase);
              const eligible = shortBy <= 0 && !overMax;
              return (
                <li
                  key={p.id}
                  className="flex items-center gap-3 rounded-lg border border-dashed border-neutralPrimary-300 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-sm font-bold tracking-wide text-neutralPrimary-800">
                      {p.couponCode}
                      <span className="ml-2 font-sans text-xs font-semibold tracking-normal text-greenPrimary-600">
                        {formatDiscount(p)} off
                      </span>
                    </p>
                    <p
                      className={`text-xs ${eligible ? "text-neutralPrimary-500" : "text-warningPrimary-600"}`}
                    >
                      {overMax
                        ? `For orders up to ${formatTk(Number(p.maxPurchase))}`
                        : shortBy > 0
                          ? `Add ${formatTk(shortBy)} more to use`
                          : p.minPurchase
                            ? `Min. order ${formatTk(Number(p.minPurchase))}`
                            : "No minimum order"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => applyCode(p.couponCode)}
                    disabled={!eligible || isChecking}
                    className="shrink-0 cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold text-greenPrimary-600 ring-1 ring-greenPrimary-400 transition-colors hover:bg-greenPrimary-950 disabled:cursor-not-allowed disabled:text-neutralPrimary-400 disabled:ring-neutralPrimary-300 disabled:hover:bg-transparent"
                  >
                    Apply
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

//! ================= KEEP IT -- FOR MULTIPLE PROMO CODE =============
// "use client";

// import React, { useState } from "react";
// import InputField from "@/components/form/InputField";
// import { useFormContext } from "react-hook-form";
// import { useCurrentPromotion } from "@/modules/promotion/hooks/useCurrentPromotion";
// import { formatDateToMMDDYYYY } from "@/lib/utils/date.utils";
// import { Skeleton } from "@/components/ui/skeleton";
// import { IPromotion } from "@/modules/promotion/types/promotion.types";
// import { PiSealCheckFill, PiSealPercentFill } from "react-icons/pi";

// export interface IPromotionInfo {
//   promotionId?: number | null;
//   promotionAmount: number;
// }

// interface IProps {
//   setPromotionInfo: React.Dispatch<React.SetStateAction<IPromotionInfo>>;
// }

// export default function Promotion({ setPromotionInfo }: IProps) {
//   const { control, trigger, getValues } = useFormContext();
//   const { promotionData, isPromotionLoading, currentPromotion } =
//     useCurrentPromotion();
//   console.log(currentPromotion);
//   const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
//   const [isPromoApplied, setIsPromoApplied] = useState<boolean>(false);

//   // ========= BUTTON OPTION ===========
//   const handleApplyPromoCode = (promotion: IPromotion) => {
//     setPromotionInfo({
//       promotionId: promotion.id,
//       promotionAmount: promotion.discountValue ? promotion.discountValue : 0,
//     });
//     setAppliedPromo(promotion.couponCode);
//   };

//   // ========= COPY PASTE OPTION ===========
//   const handleCopiedPromoCode = () => {
//     const code = getValues("promoCode");
//     const found = promotionData?.find(
//       (promo) => promo.couponCode.toLowerCase() === code.toLowerCase()
//     );
//     if (found) {
//       setPromotionInfo({
//         promotionId: currentPromotion?.id,
//         promotionAmount: currentPromotion?.discountValue || 0,
//       });
//       setAppliedPromo(found.couponCode);
//       setIsPromoApplied(true);
//     } else {
//       alert("Invalid promo code");
//     }
//   };

//   // ========== REMOVE PROMO =========
//   const handleRemovePromo = () => {
//     setPromotionInfo({ promotionAmount: 0 });
//     setAppliedPromo(null);
//     setIsPromoApplied(false);
//   };

//   return (
//     <section className="md:px-6 md:py-8 max-md:border-0 border border-neutralPrimary-300 rounded-2xl w-full">
//       <div className="flex flex-col gap-6">
//         <p className="text-neutralPrimary-800 max-md:text-base text-2xl font-semibold">
//           Promotion
//         </p>

//         {/* ======= TABLE HEADER ======= */}
//         {!isPromotionLoading && (
//           <div className="hidden md:flex items-center justify-between gap-4 px-3 mb-2 text-neutralPrimary-600 font-semibold text-sm">
//             <p className="w-[160px]">Coupon Code</p>
//             <p className="w-[100px] text-center">Min Purchase</p>
//             <p className="w-[100px] text-center">Discount</p>
//             <p className="w-[150px] text-center">Expiry Date</p>
//             <p className="w-[90px] text-center"></p>
//           </div>
//         )}

//         {/* ======= PROMOTION LIST ======= */}
//         <div className="flex flex-col gap-4">
//           {isPromotionLoading ? (
//             // ============ LOADING SKELETON ============
//             <>
//               {[1, 2, 3].map((i) => (
//                 <div
//                   key={i}
//                   className="flex items-center justify-between gap-4 border border-neutralPrimary-200 p-3 rounded-lg"
//                 >
//                   <Skeleton className="h-4 w-[160px]" />
//                   <Skeleton className="h-4 w-[100px]" />
//                   <Skeleton className="h-4 w-[100px]" />
//                   <Skeleton className="h-4 w-[150px]" />
//                   <Skeleton className="h-10 w-[90px] rounded-md" />
//                 </div>
//               ))}
//             </>
//           ) : (
//             promotionData?.map((promotion, index) => {
//               const isApplied = appliedPromo === promotion.couponCode;
//               return (
//                 <div key={index}>
//                   {isApplied ? (
//                     <>
//                       {/* ========= APPLIED DETAILS AND REMOVE PROMO BUTTON ========= */}
//                       <div className="relative flex flex-col gap-5 border border-neutralPrimary-200 w-full rounded-2xl p-5 shadow-promotionApplied bg-white overflow-hidden before:content-[''] before:absolute before:left-0 before:top-2/3 before:-translate-y-1/2 before:w-6 before:h-6 before:bg-gray-50 before:rounded-full before:shadow-[inset_0_0_0_1px_#e5e7eb] before:-translate-x-1/2 after:content-[''] after:absolute after:right-0 after:top-2/3 after:-translate-y-1/2 after:w-6 after:h-6 after:bg-white after:rounded-full after:shadow-[inset_0_0_0_1px_#e5e7eb] after:translate-x-1/2">
//                         {/* Left cutout */}
//                         <div className="absolute left-0 top-2/3 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-transparent rounded-full border border-neutralPrimary-200"></div>

//                         {/* Right cutout */}
//                         <div className="absolute right-0 top-2/3 -translate-y-1/2 translate-x-1/2 w-6 h-6 bg-transparent rounded-full border border-neutralPrimary-200"></div>

//                         <div className="flex items-center justify-between">
//                           <div className="flex items-start gap-2">
//                             <PiSealPercentFill className="w-7 h-7 text-warningPrimary-500" />
//                             <div className="text-sm text-neutralPrimary-800">
//                               <p>
//                                 <span className="font-semibold">
//                                   NATURACARE{" "}
//                                 </span>
//                                 <span className="font-normal">
//                                   : 120 taka off for the previous users
//                                 </span>
//                               </p>
//                               <p className="font-semibold">15%</p>
//                             </div>
//                           </div>
//                           <div className="border border-neutralPrimary-200 bg-neutralPrimary-50 rounded-[20px] text-xs text-neutralPrimary-400 flex gap-2 items-center justify-center py-1 px-2">
//                             <p>Min. order Tk 1,200</p>
//                             <p className="font-extrabold">.</p>
//                             <p>Used by Oct 31, 2025</p>
//                           </div>
//                         </div>

//                         <div className="border border-dashed w-full"></div>

//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center gap-4">
//                             <PiSealCheckFill className="w-7 h-7 text-greenPrimary-500" />
//                             <p className="text-sm text-neutralPrimary-400">
//                               Promo applied!
//                             </p>
//                             <div className="bg-blueSecondary-200 text-neutralPrimary-600 text-xs px-2 py-0.5 rounded-2xl">
//                               n left
//                             </div>
//                           </div>
//                           <button
//                             type="button"
//                             onClick={handleRemovePromo}
//                             className="text-destructive-500 text-sm font-semibold hover:cursor-pointer"
//                           >
//                             Remove
//                           </button>
//                         </div>
//                       </div>
//                     </>
//                   ) : (
//                     <div
//                       className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border p-3 rounded-lg transition-all
//                     border-neutralPrimary-200"
//                     >
//                       <p className="md:w-[160px] text-neutralPrimary-800 font-medium">
//                         {promotion.couponCode}
//                       </p>
//                       <p className="md:w-[100px] text-neutralPrimary-800 font-medium text-center">
//                         Tk {promotion.minPurchase}
//                       </p>
//                       <p className="md:w-[100px] text-neutralPrimary-800 font-medium text-center">
//                         {promotion.discountType === "PERCENTAGE"
//                           ? `${promotion.discountValue}%`
//                           : `Tk ${promotion.discountValue}`}
//                       </p>
//                       <p className="md:w-[150px] text-neutralPrimary-800 font-medium text-center">
//                         {formatDateToMMDDYYYY(promotion.endDate)}
//                       </p>
//                       <button
//                         type="button"
//                         onClick={() => handleApplyPromoCode(promotion)}
//                         className="bg-greenPrimary-500 rounded-md text-neutralPrimary-50 font-semibold text-base py-2.5 px-6 cursor-pointer disabled:cursor-not-allowed w-full md:w-auto"
//                       >
//                         Apply
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               );
//             })
//           )}
//         </div>

//         {/* ======= PROMO CODE INPUT ======= */}
//         {isPromoApplied ? (
//           <section className="relative flex flex-col gap-5 border border-neutralPrimary-200 w-full rounded-2xl p-5 shadow-promotionApplied bg-white overflow-hidden before:content-[''] before:absolute before:left-0 before:top-2/3 before:-translate-y-1/2 before:w-6 before:h-6 before:bg-gray-50 before:rounded-full before:shadow-[inset_0_0_0_1px_#e5e7eb] before:-translate-x-1/2 after:content-[''] after:absolute after:right-0 after:top-2/3 after:-translate-y-1/2 after:w-6 after:h-6 after:bg-white after:rounded-full after:shadow-[inset_0_0_0_1px_#e5e7eb] after:translate-x-1/2">
//             {/* Left cutout */}
//             <div className="absolute left-0 top-2/3 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-transparent rounded-full border border-neutralPrimary-200"></div>

//             {/* Right cutout */}
//             <div className="absolute right-0 top-2/3 -translate-y-1/2 translate-x-1/2 w-6 h-6 bg-transparent rounded-full border border-neutralPrimary-200"></div>

//             <div className="flex items-center justify-between">
//               <div className="flex items-start gap-2">
//                 <PiSealPercentFill className="w-7 h-7 text-warningPrimary-500" />
//                 <div className="text-sm text-neutralPrimary-800">
//                   <p>
//                     <span className="font-semibold">NATURACARE </span>
//                     <span className="font-normal">
//                       : 120 taka off for the previous users
//                     </span>
//                   </p>
//                   <p className="font-semibold">15%</p>
//                 </div>
//               </div>
//               <div className="border border-neutralPrimary-200 bg-neutralPrimary-50 rounded-[20px] text-xs text-neutralPrimary-400 flex gap-2 items-center justify-center py-1 px-2">
//                 <p>Min. order Tk 1,200</p>
//                 <p className="font-extrabold">.</p>
//                 <p>Used by Oct 31, 2025</p>
//               </div>
//             </div>

//             <div className="border border-dashed w-full"></div>

//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-4">
//                 <PiSealCheckFill className="w-7 h-7 text-greenPrimary-500" />
//                 <p className="text-sm text-neutralPrimary-400">
//                   Promo applied!
//                 </p>
//                 <div className="bg-blueSecondary-200 text-neutralPrimary-600 text-xs px-2 py-0.5 rounded-2xl">
//                   n left
//                 </div>
//               </div>
//               <button
//                 type="button"
//                 onClick={handleRemovePromo}
//                 className="text-destructive-500 text-sm font-semibold hover:cursor-pointer"
//               >
//                 Remove
//               </button>
//             </div>
//           </section>
//         ) : (
//           <section className="flex flex-col md:flex-row items-end justify-center gap-6">
//             <InputField
//               labelName="Promo Code"
//               placeholderText="CBSB2022"
//               name="promoCode"
//               control={control}
//               trigger={trigger}
//             />
//             <button
//               type="button"
//               onClick={handleCopiedPromoCode}
//               className="min-w-fit bg-greenPrimary-500 rounded-md text-neutralPrimary-50 font-semibold text-base py-2.5 px-6 cursor-pointer disabled:cursor-not-allowed"
//             >
//               Apply Copied Promo
//             </button>
//           </section>
//         )}
//       </div>
//     </section>
//   );
// }
