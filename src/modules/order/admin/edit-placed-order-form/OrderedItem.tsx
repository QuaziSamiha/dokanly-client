"use client";

import React, { useState } from "react";

export interface IItemQuantity {
  itemId: number;
  quantity: number;
}

interface IProps {
  itemId: number;
  itemQuantity: number;
  index: number;
  name: string;
  imageUrl?: string;
  pricePerItem: number;
  isLastItem: boolean;
  setRemovedOrderItem: React.Dispatch<React.SetStateAction<number[]>>;
  setItemQuantity: React.Dispatch<React.SetStateAction<IItemQuantity[]>>;
}

export default function OrderedItem({
  itemId,
  itemQuantity,
  index,
  name,
  // imageUrl,
  pricePerItem,
  isLastItem,
  setRemovedOrderItem,
  setItemQuantity,
}: IProps) {
  const [totalItem, setTotalItem] = useState<IItemQuantity>({
    itemId,
    quantity: itemQuantity,
  });

  const handleIncrease = (itemId: number) => {
    console.log("change quantity", itemId);
    const newQuantity = totalItem.quantity + 1;
    setTotalItem({ itemId, quantity: newQuantity });
    setItemQuantity((prev) => {
      const filtered = prev.filter((i) => i.itemId !== itemId);
      return [...filtered, { itemId, quantity: newQuantity }];
    });
  };

  const handleDecrease = (itemId: number) => {
    if (totalItem.quantity <= 1) return; // prevent going below 1

    const newQuantity = totalItem.quantity - 1;
    setTotalItem({ itemId, quantity: newQuantity });

    setItemQuantity((prev) => {
      const filtered = prev.filter((i) => i.itemId !== itemId);
      return [...filtered, { itemId, quantity: newQuantity }];
    });
  };

  const handleRemove = (itemId: number) => {
    const removedItems = [];
    removedItems.push(itemId);
    setRemovedOrderItem((prev) => Array.from(new Set([...prev, itemId])));

    setItemQuantity((prev) => prev.filter((i) => i.itemId !== itemId));
  };

  return (
    <div
      className={`w-full border-b border-neutralPrimary-300
      `}
      key={index}
    >
      <div className="flex items-stretch justify-between my-6 lg:m-6">
        {/* ========== LEFT SIDE (DESCRIPTION PART) =========== */}
        <div className="flex items-start gap-6 lg:gap-8">
          {/* ============== IMAGE PART ============= */}
          {/* <div className="bg-backgroundPeach p-6 rounded-xl">
            <Image
              src={imageUrl ?? "/placeholder.png"}
              alt={name ?? "Product image"}
              width={160}
              height={160}
              className="w-40 h-40"
            />
          </div> */}

          {/* =================== NAME | QUANTITY | BUTTONS ================= */}
          <div className="flex flex-col gap-2 lg:gap-4 h-full">
            {/* ============ PRODUCT NAME =========== */}
            <p className="max-md:text-xs text-lg font-semibold text-greenPrimary-500">
              {name}
            </p>

            <p className="text-neutralPrimary-800 max-lg:text-sm lg:text-base font-semibold lg:hidden">
              ৳ {pricePerItem}
            </p>

            {/* ============== BUTTONS  */}
            <div className="flex gap-6 items-center mt-auto">
              <div className="flex items-center gap-6 border border-neutralPrimary-300 rounded text-neutralPrimary-800 font-semibold p-2">
                <button
                  type="button"
                  onClick={() => handleDecrease(itemId)}
                  className={`mx-2 cursor-pointer text-xl ${
                    totalItem.quantity === 1 && "cursor-not-allowed opacity-50"
                  }`}
                  disabled={totalItem.quantity === 1}
                >
                  -
                </button>

                <div className="max-md:text-sm text-base">{totalItem.quantity}</div>

                <button
                  type="button"
                  onClick={() => handleIncrease(itemId)}
                  className="mx-2 cursor-pointer text-xl"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleRemove(itemId)}
                disabled={isLastItem}
                className={`max-lg:text-sm lg:text-base font-semibold text-destructive-500 ${isLastItem ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        {/* ========= RIGHT SIDE (PRICE PART) =========== */}
        <div className="max-lg:hidden">
          <p className="text-neutralPrimary-800 font-semibold">
            ৳ {pricePerItem}
          </p>
        </div>
      </div>
    </div>
  );
}
