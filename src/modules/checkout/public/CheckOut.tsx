"use client";

import CustomBreadCrumb from "@/components/primitives/CustomBreadCrumb";
import Hero from "@/components/layout/hero/Hero";
import React, { useEffect, useMemo, useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { Lock } from "lucide-react";
import PersonalInformation from "./PersonalInformation";
import DeliveryAddress from "@/modules/checkout/public/DeliveryAddress";
import DeliveryMethod from "@/modules/checkout/public/DeliveryMethod";
import PaymentMethod from "@/modules/checkout/public/PaymentMethod";
import CheckoutSummary from "./CheckoutSummary";
import ConfirmOrderDialog, { IOrderReview } from "./ConfirmOrderDialog";
import { IPromotionInfo } from "./Promotion";
import { useLocalCart } from "@/modules/cart/hooks/useLocalCart";
import { usePost } from "@/hooks/api/usePost";
import { ResponseSuccessType } from "@/types";
import { useDeliveryPricing } from "@/modules/delivery-pricing/hooks/useDeliveryPricing";
import { CheckoutFormData, getCheckoutSchema } from "@/modules/checkout/schemas/checkout.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { localCart } from "@/modules/cart/utils/local-cart.utils";
import { cartTotals, formatTk } from "@/modules/cart/utils/cart-pricing.utils";
import { useCurrentUser } from "@/modules/user/hooks/useCurrentUser";
import { toast } from "sonner";
import EmptyCart from "@/modules/cart/public/EmptyCart";
import CheckoutSteps from "@/modules/cart/public/CheckoutSteps";
import FreeDeliveryProgress from "@/modules/cart/public/FreeDeliveryProgress";
import CustomModal2 from "@/components/primitives/modal/CustomModal2";
import { IInvoice } from "@/modules/order/types/order.types";
import Invoice from "./Invoice";
import { orderDeliveryRegions } from "@/modules/checkout/constants/checkout.constants";
import { useUserAddress } from "@/modules/address/hooks/useUserAddress";
import { useFreeDelivery } from "@/modules/free-delivery/hooks/useFreeDelivery";
// import * as pixel from "@/lib/analytics/fpixel"; // * LEGACY: direct Meta Pixel call — superseded by GTM dataLayer push below
import { trackEvent } from "@/lib/analytics/gtm.events";

const ZONE_LABELS: Record<string, string> = {
  INSIDE_DHAKA: "Inside Dhaka",
  OUTSIDE_DHAKA: "Outside Dhaka",
};

/** Fields checked before the confirm dialog, in page order, with their section. */
const REQUIRED_FIELDS: { name: keyof CheckoutFormData; section: string }[] = [
  { name: "firstName", section: "checkout-contact" },
  { name: "phone", section: "checkout-contact" },
  { name: "userEmail", section: "checkout-contact" },
  { name: "addressId", section: "checkout-address" },
  { name: "street", section: "checkout-address" },
  { name: "region", section: "checkout-address" },
  { name: "city", section: "checkout-address" },
  { name: "zipCode", section: "checkout-address" },
  { name: "deliveryMethod", section: "checkout-delivery" },
  { name: "paymentMethod", section: "checkout-payment" },
];

export default function CheckOut() {
  // * ============= ALL STATES ==============
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openInvoice, setOpenInvoice] = useState<boolean>(false);
  const hasTrackedCheckout = React.useRef(false);
  const [invoiceData, setInvoiceData] = useState<IInvoice>();
  const [promotionInfo, setPromotionInfo] = useState<IPromotionInfo>({
    promotionId: null,
    promotionAmount: 0,
  });
  // * =========== CART | LOCAL STORAGE DATA =========
  const { cartItems, cartItemsForOrder, subTotal, totalCartItems } = useLocalCart();
  // * ========== DATA FROM DB | USER DATA | ADDRESS DATA | DELIVERY PRICING DATA | FREE DELIVERY ===========
  const { userId, currentUserData, isCurrentUserLoading } = useCurrentUser();
  const { deliveryPricingOptions, isDeliveryPricingLoading } = useDeliveryPricing();
  const { customerAddresses } = useUserAddress();
  const { freeDelivery, isFreeDeliveryAvailable } = useFreeDelivery();
  // * ========== STATE =========
  const [addNewAddress, setAddNewAddress] = useState<boolean>(userId ? false : true);

  // * =============== REACT HOOK FORM METHODS ===========
  const methods = useForm<CheckoutFormData>({
    resolver: zodResolver(getCheckoutSchema(!!userId, addNewAddress)),
    // * ========== DEFAULT FORM VALUES ==========
    defaultValues: {
      firstName: "",
      lastName: "",
      userEmail: "",
      phone: "",
      addressId: undefined,
      street: "",
      city: "",
      region: orderDeliveryRegions[0].id, // Default DHAKA
      zipCode: "",
      country: "",
      deliveryMethod: deliveryPricingOptions[0]?.value || "",
      paymentMethod: "CASH_ON_DELIVERY",
      promotionId: undefined,
    },
  });

  // * RHF METHODS
  const { trigger, setValue, watch, handleSubmit, getFieldState, getValues } = methods;

  // * ====== WATCHING RHF FIELD'S VALUES =======
  const [deliveryMethod, deliveryRegion, addressId] = watch([
    "deliveryMethod",
    "region",
    "addressId",
  ]);

  // * ========= INITIATE CHECKOUT EVENT ===========
  useEffect(() => {
    if (cartItems.length > 0 && !hasTrackedCheckout.current) {
      hasTrackedCheckout.current = true;
      trackEvent({
        name: "begin_checkout",
        params: {
          value: subTotal,
          currency: "BDT",
          items: cartItems.map((item) => ({
            item_id: String(item.id),
            item_name: item.name,
            quantity: item.quantity,
            price: Number(item.price),
          })),
        },
      });
    }
  }, [cartItems, subTotal]);

  // * ========= SETTING LOGGED IN USER INFO ===========
  useEffect(() => {
    if (userId && currentUserData && !isCurrentUserLoading) {
      setValue("firstName", currentUserData.firstName || "");
      setValue("lastName", currentUserData.lastName || "");
      setValue("userEmail", currentUserData.email || "");
      setValue("phone", currentUserData.phone || "");
    }
  }, [userId, currentUserData, isCurrentUserLoading, setValue]);

  // * ========== SET REGION BASED ON CONDITIONS ==========
  useEffect(() => {
    // * Case 1: Guest user (no userId)
    if (!userId) {
      if (!deliveryRegion) {
        setValue("region", orderDeliveryRegions[0].id); // Default DHAKA
      }
    }
    // * Case 2: Logged-in user
    else if (userId) {
      // * Sub-case 2a: Logged-in user wants to add NEW address OR has no saved addresses
      if (addNewAddress || customerAddresses?.length === 0) {
        if (!deliveryRegion) {
          setValue("region", orderDeliveryRegions[0].id); // Default DHAKA
        }
        if (addNewAddress) {
          setValue("addressId", undefined); // Clear addressId when adding new address
        }
      }
      // * Sub-case 2b: Logged-in user with saved addresses AND not adding new address
      else if (!addNewAddress && customerAddresses?.length > 0) {
        if (addressId) {
          const selectedAddress = customerAddresses.find((address) => address.id === addressId);
          if (selectedAddress?.state) {
            setValue("region", selectedAddress.state);
          } else {
            setValue("region", orderDeliveryRegions[0].id);
          }
        }
        // If no addressId yet, set to first address's state
        else if (!addressId && customerAddresses[0]?.state) {
          const defaultAddress = customerAddresses[0];
          setValue("addressId", defaultAddress.id);
          setValue("region", defaultAddress.state ?? undefined);
        } else {
          // If first address has no state, default to DHAKA
          setValue("region", orderDeliveryRegions[0].id);
        }
      }
    }
  }, [userId, addNewAddress, addressId, customerAddresses, deliveryRegion, setValue]);

  //* ========= DELIVERY METHOD BASED ON REGION OR DIVISION ========
  // * Dhaka division → INSIDE_DHAKA, every other division → OUTSIDE_DHAKA. Matched by
  // * value; the old position-based pick ([1] for Dhaka) is the fallback.
  useEffect(() => {
    if (deliveryRegion && deliveryPricingOptions.length > 0) {
      const isDhaka = deliveryRegion === orderDeliveryRegions[0].id;
      const wanted = isDhaka ? "INSIDE_DHAKA" : "OUTSIDE_DHAKA";
      const newDeliveryMethod =
        deliveryPricingOptions.find((option) => option.value === wanted)?.value ??
        (isDhaka ? deliveryPricingOptions[1]?.value : deliveryPricingOptions[0]?.value);
      setValue("deliveryMethod", newDeliveryMethod);
    }
  }, [deliveryRegion, deliveryPricingOptions, setValue]);

  //* =========== DELIVERY CHARGE ========
  const deliveryCharge = useMemo(() => {
    if (!deliveryMethod || !Array.isArray(deliveryPricingOptions)) {
      return 200; // fallback default
    }
    const selectedOption = deliveryPricingOptions.find((item) => item.value === deliveryMethod);
    return selectedOption ? Number(selectedOption.deliveryCharge) : 200;
  }, [deliveryMethod, deliveryPricingOptions]);

  // * =========== TOTALS (the server recalculates them when the order is placed) ===========
  const totals = cartTotals(cartItems);
  const freeDeliveryThreshold = Number(freeDelivery?.[0]?.minimumOrder ?? 0);
  const isFreeDelivery = isFreeDeliveryAvailable && totals.total >= freeDeliveryThreshold;
  const deliveryFee = isFreeDelivery ? 0 : deliveryCharge;
  const grandTotal = totals.total - promotionInfo.promotionAmount + deliveryFee;
  const zoneLabel = ZONE_LABELS[deliveryMethod] ?? undefined;

  //* ========== HANDLE ORDER NOW | SET CONFIRM MODAL ===========
  const handleOrderNow = async () => {
    const isValid = await trigger(REQUIRED_FIELDS.map((field) => field.name));
    if (isValid) {
      setOpenModal(true);
      return;
    }
    // * Take the shopper to the first problem instead of leaving them to hunt for it.
    const firstInvalid = REQUIRED_FIELDS.find((field) => getFieldState(field.name).invalid);
    if (firstInvalid) {
      const input = document.querySelector<HTMLElement>(`[name="${firstInvalid.name}"]`);
      (input ?? document.getElementById(firstInvalid.section))?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      input?.focus({ preventScroll: true });
    }
    toast.error("Please complete the highlighted fields.");
  };

  // * ========== WHAT THE CONFIRM DIALOG SHOWS ===========
  const review = useMemo<IOrderReview>(() => {
    if (!openModal) {
      return { name: "", phone: "", address: "", units: 0, grandTotal: 0 };
    }
    const values = getValues();
    const saved =
      userId && !addNewAddress ? customerAddresses.find((a) => a.id === values.addressId) : undefined;
    const regionName = orderDeliveryRegions.find((r) => r.id === values.region)?.name;
    const address = saved
      ? [saved.street, saved.city, saved.zipCode].filter(Boolean).join(", ")
      : [values.street, values.city, regionName, values.zipCode].filter(Boolean).join(", ");
    return {
      name: [values.firstName, values.lastName].filter(Boolean).join(" "),
      phone: values.phone,
      address,
      zoneLabel,
      units: totals.units,
      grandTotal,
    };
  }, [openModal, getValues, userId, addNewAddress, customerAddresses, zoneLabel, totals.units, grandTotal]);

  // * ========== ORDER POST API ========
  const { mutate: placeOrder, isPending } = usePost(
    "/order/create-order",
    (data: ResponseSuccessType) => {
      if (data.statusCode >= 200 && data.statusCode < 300) {
        const invoice = data?.data as IInvoice;

        localCart.clear();
        setOpenModal(false);
        setInvoiceData(invoice);
        setOpenInvoice(true);

        // * LEGACY: direct Meta Pixel call — kept for rollback safety, superseded by trackEvent() below
        // pixel.event("Purchase", {
        //   content_ids: invoice.orderItems.map(
        //     (item) => item.sku || `PROD_${item.productId}`,
        //   ),
        //   content_type: "product",
        //   value: Number(invoice.grandTotal),
        //   currency: "BDT",
        // });

        trackEvent({
          name: "purchase",
          params: {
            transaction_id: invoice.orderId || invoice.sid,
            value: Number(invoice.grandTotal),
            currency: "BDT",
            items: invoice.orderItems.map((item) => ({
              item_id: item.sku || `PROD_${item.productId}`,
              item_name: item.productName,
              quantity: item.quantity,
              price: Number(item.price),
            })),
          },
        });
      }
    },
  );

  // * ======== ORDER FORM SUBMIT FUNCTIONALITY =========
  const onSubmit: SubmitHandler<CheckoutFormData> = (data) => {
    if (cartItemsForOrder.length === 0) {
      toast.error("Your cart is empty. Please add items to place an order.");
      return;
    }

    let addressPayload = {};
    if (userId) {
      // * ==== FOR LOGGED IN USERS ======
      if (data?.street || data?.city || data?.zipCode) {
        addressPayload = {
          newAddress: {
            street: data?.street,
            city: data?.city,
            state: data?.region,
            zipCode: data?.zipCode,
            country: data?.country,
          },
        };
      } else {
        addressPayload = {
          addressId: addressId,
        };
      }
    } else {
      // * ==== FOR GUEST USERS ======
      addressPayload = {
        newAddress: {
          street: data?.street,
          city: data?.city,
          state: data?.region,
          zipCode: data?.zipCode,
          country: data?.country,
        },
      };
    }

    const orderPayload = {
      firstName: data?.firstName,
      lastName: data?.lastName,
      email: data?.userEmail,
      phone: data?.phone,
      ...addressPayload,
      deliveryMethod: data?.deliveryMethod,
      paymentMethod: data?.paymentMethod,
      items: cartItemsForOrder,
      promotionId: promotionInfo?.promotionId ? promotionInfo?.promotionId : null,
      isFreeDelivery: isFreeDelivery,
      freeDeliverySettingId: isFreeDeliveryAvailable ? freeDelivery?.[0]?.id : null,
    };

    placeOrder(orderPayload);
  };

  return (
    <section className="w-full">
      <Hero
        heroHeading="Checkout"
        customBreadCrumb={
          <CustomBreadCrumb
            previousItemLinks={[{ label: "Cart", link: "/my-cart" }]}
            currentItem="Checkout"
          />
        }
      />
      {/* Extra bottom space on small screens so the pinned order bar never covers content */}
      <main className={`container mx-auto px-4 pt-6 lg:pt-8 ${totalCartItems > 0 ? "pb-32 lg:pb-16" : "pb-12"}`}>
        {totalCartItems > 0 ? (
          <FormProvider {...methods}>
            <form id="checkout-form" className="flex w-full flex-col gap-6" onSubmit={handleSubmit(onSubmit)} noValidate>
              <CheckoutSteps current={1} />

              {isFreeDeliveryAvailable && freeDeliveryThreshold > 0 && (
                <FreeDeliveryProgress subtotal={totals.total} threshold={freeDeliveryThreshold} compact />
              )}

              <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px] xl:gap-8">
                <div className="flex min-w-0 flex-col gap-5">
                  <PersonalInformation />
                  <DeliveryAddress setAddNewAddress={setAddNewAddress} addNewAddress={addNewAddress} />
                  <DeliveryMethod isFreeDelivery={isFreeDelivery} />
                  <PaymentMethod />
                </div>

                <aside className="lg:sticky lg:top-32">
                  <CheckoutSummary
                    items={cartItems}
                    totals={totals}
                    deliveryCharge={deliveryCharge}
                    isFreeDelivery={isFreeDelivery}
                    zoneLabel={zoneLabel}
                    isDeliveryLoading={isDeliveryPricingLoading}
                    promotionInfo={promotionInfo}
                    setPromotionInfo={setPromotionInfo}
                    grandTotal={grandTotal}
                    onPlaceOrder={handleOrderNow}
                    isPending={isPending}
                  />
                </aside>
              </div>

              <ConfirmOrderDialog
                open={openModal}
                onOpenChange={setOpenModal}
                review={review}
                isPending={isPending}
              />
            </form>
          </FormProvider>
        ) : (
          <EmptyCart />
        )}
      </main>

      {/* Phones and tablets: total and the order button stay in reach */}
      {totalCartItems > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutralPrimary-200 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-neutralPrimary-500">
                Total · {totals.units} item{totals.units === 1 ? "" : "s"}
              </p>
              <p className="text-lg font-extrabold tabular-nums text-neutralPrimary-800">
                {formatTk(grandTotal)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleOrderNow}
              disabled={isPending}
              className="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-greenPrimary-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-greenPrimary-600 disabled:opacity-70"
            >
              <Lock size={15} />
              Place order
            </button>
          </div>
        </div>
      )}

      <CustomModal2
        open={openInvoice}
        onOpenChange={setOpenInvoice}
        dialogHeight="h-[70vh]"
        dialogWidth="w-[95vw] sm:w-[90vw] lg:w-[65vw]"
      >
        {invoiceData && <Invoice invoiceData={invoiceData} setOpenInvoice={setOpenInvoice} />}
      </CustomModal2>
    </section>
  );
}

// ! ============ KEEP IT ==============
// ? ====================== CART API IMPLEMENTED VERSION ======================
// "use client";

// import CustomBreadCrumb from "@/components/primitives/CustomBreadCrumb";
// import Hero from "@/components/layout/hero/Hero";
// import React, { useMemo, useState } from "react";
// import { FormProvider, useForm } from "react-hook-form";
// import PersonalInformation from "./PersonalInformation";
// import DeliveryAddress from "@/modules/checkout/public/DeliveryAddress";
// import DeliveryMethod from "@/modules/checkout/public/DeliveryMethod";
// import PaymentMethod from "@/modules/checkout/public/PaymentMethod";
// import CustomModal from "@/components/primitives/modal/CustomModal";
// import SubmitButton from "@/components/form/SubmitButton";
// import { Separator } from "@/components/ui/separator";
// import CheckOutItem from "./CheckOutItem";
// import { useCart } from "@/modules/cart/hooks/useCart";
// import CheckOutItemSkeleton from "./CheckoutItemSkeleton";
// import OrderSummarySkeleton from "@/modules/cart/public/OrderSummarySkeleton";
// import Promotion from "./Promotion";

// export default function CheckOut() {
//   const [openModal, setOpenModal] = useState<boolean>(false);
//   // ============== CART DATA ==============
//   const { cartData, isCartLoading } = useCart();
//   const discount = 0;
//   // console.log(cartData);
//   const subTotal = useMemo(() => {
//     if (!cartData?.items) return 0;

//     return cartData?.items.reduce((acc, item) => {
//       const quantity = Number(item.quantity);
//       const price = Number(item.product?.price);
//       // console.log(price * quantity);
//       return acc + quantity * price;
//     }, 0);
//   }, [cartData]);

//   // =============== FORM METHODS ===========
//   const methods = useForm();
//   const { trigger, watch } = methods;
//   // =========== DELIVERY CHARGE ========
//   const [deliveryMethod] = watch(["deliveryMethod"]);
//   const deliveryCharge = useMemo(() => {
//     if (!deliveryMethod) return 60; // fallback default
//     return Number(deliveryMethod);
//   }, [deliveryMethod]);

//   const {
//     handleSubmit,
//     formState: { errors },
//   } = methods;
//   console.log(errors);

//   const handleOrderNow = async () => {
//     let isValid = false;
//     isValid = await trigger([
//       "firstName",
//       "phone",
//       "streetNameHouseNo",
//       "deliveryMethod",
//     ]);

//     if (isValid) {
//       setOpenModal(true);
//     }
//   };

//   const onSubmit = (data: unknown) => {
//     console.log(data);
//     setOpenModal(false);
//   };

//   return (
//     <section className="w-full">
//       <Hero
//         heroHeading="Order Details"
//         customBreadCrumb={
//           <CustomBreadCrumb
//             previousItemLinks={[{ label: "Cart", link: "/my-cart" }]}
//             currentItem="Checkout"
//           />
//         }
//       />
//       <main className="container mx-auto lg:mt-6">
//         <FormProvider {...methods}>
//           <form
//             id="checkout-form"
//             className="w-full"
//             onSubmit={handleSubmit(onSubmit)}
//           >
//             <section className="w-full flex max-lg:flex-col lg:flex-row gap-6 lg:gap-14 justify-center items-start lg:pt-8 max-xl:px-4 mb-8">
//               <section className="max-lg:w-full lg:basis-2/3">
//                 <div className="flex flex-col max-md:gap-6 gap-10">
//                   <PersonalInformation />
//                   <DeliveryAddress />
//                   <Promotion />
//                   <DeliveryMethod />
//                   <PaymentMethod />
//                 </div>
//               </section>
//               <section className="max-lg:w-full lg:basis-1/3">
//                 <div className="lg:border lg:border-neutralPrimary-300 lg:rounded-2xl w-full lg:p-8">
//                   <div className="text-neutralPrimary-800 flex flex-col gap-8">
//                     <p className="font-bold max-md:text-base max-lg:xl text-2xl">
//                       Order Summary
//                     </p>
//                     <section className="">
//                       {isCartLoading ? (
//                         <CheckOutItemSkeleton />
//                       ) : (
//                         <>
//                           {cartData?.items?.map((cartItem, index) => {
//                             const price = Number(cartItem.product.price);
//                             return (
//                               <CheckOutItem
//                                 key={index}
//                                 index={index}
//                                 perItemQuantity={cartItem.quantity}
//                                 name={cartItem.product.name}
//                                 imageUrl={cartItem.imageUrl ?? ""}
//                                 pricePerItem={price}
//                               />
//                             );
//                           })}
//                         </>
//                       )}
//                     </section>
//                     {isCartLoading ? (
//                       <OrderSummarySkeleton />
//                     ) : (
//                       <div className="flex flex-col gap-4 lg:gap-6">
//                         {/* <Separator /> */}
//                         <div className="flex justify-between items-center">
//                           <p>Subtotal</p>
//                           <p>৳ {subTotal}</p>
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <p>Discount</p>
//                           <p>৳ {discount}</p>
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <p>Delivery Charge</p>
//                           <p>৳ {deliveryCharge}</p>
//                         </div>
//                         <Separator />
//                         <div className="flex justify-between items-center max-lg:text-base text-xl font-semibold">
//                           <p>Grand Total</p>
//                           <p>৳ {subTotal - discount + deliveryCharge}</p>
//                         </div>
//                         <button
//                           type="button"
//                           onClick={handleOrderNow}
//                           className="bg-greenPrimary-500 text-neutralPrimary-50 font-semibold text-base rounded-[8px] w-full px-5 py-2.5 cursor-pointer"
//                         >
//                           Order Now
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </section>
//             </section>
//             <CustomModal
//               open={openModal}
//               onOpenChange={setOpenModal}
//               title="Your Order has been confirmed"
//               subTitle1="Confirmation Number:"
//               subTitle2="#2178-4155-203"
//               footerButton={
//                 <SubmitButton
//                   submitTitle="Confirm"
//                   submittedForm="checkout-form"
//                   buttonWidth="w-fit"
//                 />
//               }
//             />
//           </form>
//         </FormProvider>
//       </main>
//     </section>
//   );
// }
