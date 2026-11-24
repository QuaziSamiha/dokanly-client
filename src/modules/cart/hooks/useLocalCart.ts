"use client";

import {
  cartLineKey,
  ILocalCartItem,
  localCart,
} from "@/modules/cart/utils/local-cart.utils";
import { useEffect, useMemo, useState } from "react";
import { useGet } from "@/hooks/api/useGet";
import { useCurrentUser } from "@/modules/user/hooks/useCurrentUser";

// ? === FOR QUERYING CURRENT PRICES ===
interface IPriceQuantity {
  id: number;
  price: number;
  discountPrice?: number;
  quantity: number;
}

interface IProductPriceQuantity extends IPriceQuantity {
  // Products that come in sizes: the sizes still on sale.
  variants?: IPriceQuantity[];
}

interface ICartItemForOrder {
  productId: number;
  variantId?: number;
  quantity: number;
}

// Current price and stock of a cart line: its size when it has one. Undefined
// when it can no longer be bought (product gone, size retired, or the product
// now comes in sizes and the line has none).
function currentOf(
  item: Pick<ILocalCartItem, "id" | "variantId">,
  prices: IProductPriceQuantity[] | undefined,
): IPriceQuantity | undefined {
  const product = prices?.find((p) => p.id === item.id);
  if (!product) return undefined;
  if (item.variantId) {
    return product.variants?.find((v) => v.id === item.variantId);
  }
  return product.variants?.length ? undefined : product;
}
export function useLocalCart() {
  const [, setInventoryData] = useState<IProductPriceQuantity[]>([]);
  const [cartItems, setCartItems] = useState<ILocalCartItem[]>([]);
  const { currentUserData } = useCurrentUser();

  // * === FOR QUERYING CURRENT PRICES ===
  const productIds = [...new Set(cartItems.map((item) => item.id))];
  const idsQueryString = productIds.join(",");

  //* ==== CHECK IF USER IS ADMIN OR EMPLOYEE ====
  const isRestrictedUser = useMemo(() => {
    return (
      currentUserData?.role === "ADMIN" || currentUserData?.role === "EMPLOYEE"
    );
  }, [currentUserData?.role]);

  //* ==== CLEAR CART IF USER IS ADMIN OR EMPLOYEE ====
  useEffect(() => {
    if (isRestrictedUser && cartItems.length > 0) {
      console.log(
        "Clearing cart for restricted user role:",
        currentUserData?.role,
      );
      localCart.clear();
      setCartItems([]);

      // Show notification (optional)
      if (typeof window !== "undefined") {
        const event = new CustomEvent("cart-cleared");
        window.dispatchEvent(event);
      }
    }
  }, [isRestrictedUser, cartItems.length, currentUserData?.role]);

  //* ==== GET API FOR CURRENT PRICES AND INVENTORY/STOCK QUANTITY OF THE PRODUCTS ======
  const {
    data: cartProductCurrentPriceQuantity,
    isLoading: isProductPriceLoading,
  } = useGet<IProductPriceQuantity[]>(
    `/products/prices?ids=${idsQueryString}`,
    ["getCartProductCurrentPrice", idsQueryString],
    undefined,
    productIds.length > 0 && !isRestrictedUser, //* Don't fetch if restricted user
  );

  // if (!isProductPriceLoading) {
  //   console.log("cart Product Current Price", cartProductCurrentPriceQuantity);
  // }

  // * ==== STORE INVENTORY DATA FOR PRODUCTS ======
  useEffect(() => {
    if (
      cartProductCurrentPriceQuantity &&
      cartProductCurrentPriceQuantity.length > 0
    ) {
      setInventoryData(cartProductCurrentPriceQuantity);
    }
  }, [cartProductCurrentPriceQuantity]);

  //* ===== UPDATE CART ITEMS WITH CURRENT PRICES =====
  useEffect(() => {
    if (
      cartProductCurrentPriceQuantity &&
      cartProductCurrentPriceQuantity?.length > 0 &&
      !isRestrictedUser
    ) {
      // Use functional update to avoid dependency on cartItems
      setCartItems((prevItems) => {
        const updatedCartItems = prevItems.map((item) => {
          const itemWithCurrentPrice = currentOf(
            item,
            cartProductCurrentPriceQuantity,
          );

          if (itemWithCurrentPrice) {
            // Check if EITHER price or discountPrice is different
            const isPriceDifferent = itemWithCurrentPrice.price !== item.price;
            const isDiscountPriceDifferent =
              itemWithCurrentPrice.discountPrice !== item.discountPrice;

            if (isPriceDifferent || isDiscountPriceDifferent) {
              return {
                ...item,
                price: itemWithCurrentPrice.price,
                discountPrice: itemWithCurrentPrice.discountPrice,
              };
            }
          }
          return item;
        });

        // Only update local storage if prices or compare price (discount price) actually changed
        const hasActualChanges = updatedCartItems.some((item, index) => {
          const prev = prevItems[index];
          return (
            item.price !== prev?.price ||
            item.discountPrice !== prev?.discountPrice
          );
        });

        if (hasActualChanges) {
          localCart.set(updatedCartItems);
        }

        return updatedCartItems;
      });
    }
  }, [cartProductCurrentPriceQuantity, isRestrictedUser]); // Removed cartItems dependency

  //* === TRANSFORM CART ITEMS FOR ORDER (EMPTY FOR RESTRICTED USERS) ====
  const cartItemsForOrder = useMemo<ICartItemForOrder[]>(() => {
    if (isRestrictedUser) return [];
    if (!cartItems || cartItems.length === 0) return [];

    return cartItems.map((item) => ({
      productId: item.id,
      ...(item.variantId ? { variantId: item.variantId } : {}),
      quantity: item.quantity,
    }));
  }, [cartItems, isRestrictedUser]);

  const updateCart = () => {
    // Don't load cart if user is restricted
    if (isRestrictedUser) {
      setCartItems([]);
      return;
    }

    const items = localCart.get();
    setCartItems(items);
  };

  useEffect(() => {
    updateCart();

    // Listen for cart changes
    window.addEventListener("cart-updated", updateCart);

    // Listen for cart cleared events
    window.addEventListener("cart-cleared", updateCart);

    return () => {
      window.removeEventListener("cart-updated", updateCart);
      window.removeEventListener("cart-cleared", updateCart);
    };
  }, [isRestrictedUser]);

  const totalCartItems = isRestrictedUser ? 0 : cartItems.length;

  const discount = 0;

  // * ======= CALCULATE SUBTOTAL =======
  const subTotal = useMemo(() => {
    if (isRestrictedUser) return 0;
    if (!cartItems) return 0;

    return cartItems?.reduce((acc, item) => {
      const quantity = item.quantity;
      // const price = item.price;
      // const actualPrice = item.discountPrice && item.discountPrice > price ? item.discountPrice : price;
      const effectivePrice =
        item.discountPrice && item.discountPrice < item.price
          ? item.discountPrice
          : item.price;

      return acc + quantity * effectivePrice;
      // return acc + quantity * price;
      // return acc + quantity * actualPrice;
    }, 0);
  }, [cartItems, isRestrictedUser]);

  // Add function to manually clear cart (useful for logout)
  const clearCartForRestrictedUser = () => {
    if (isRestrictedUser) {
      localCart.clear();
      setCartItems([]);
    }
  };

  // Stock of each cart line, by cartLineKey (a size has its own stock).
  const inventoryByProductId = useMemo(() => {
    if (!cartProductCurrentPriceQuantity) return {};

    return cartItems.reduce((acc: Record<string, number>, item) => {
      const current = currentOf(item, cartProductCurrentPriceQuantity);
      if (current) acc[cartLineKey(item)] = current.quantity;
      return acc;
    }, {});
  }, [cartProductCurrentPriceQuantity, cartItems]);

  // * ========= CHECK WHEN INVENTORY OF THE PRODUCTS UPDATE ===========
  // * An empty answer is meaningful: every product in the cart was taken off
  // * the shop (the server leaves out products that aren't ACTIVE).
  useEffect(() => {
    if (cartProductCurrentPriceQuantity && cartItems.length > 0) {
      // * ======== IDENTITY ITEMS THAT ARE OUT OF STOCK OR HAVE INSUFFICIENT QUANTITY ==========
      const itemsToRemove: string[] = [];
      const updatedCartItems = cartItems.filter((item) => {
        const inventory = currentOf(item, cartProductCurrentPriceQuantity);

        if (!inventory) {
          // * ====== PRODUCT (OR ITS SIZE) CAN NO LONGER BE BOUGHT ======
          itemsToRemove.push(cartLineKey(item));
          return false;
        }

        if (inventory.quantity === 0) {
          // * ===== PRODUCT IS OUT OF STOCK =====
          itemsToRemove.push(cartLineKey(item));
          return false;
        }

        if (item.quantity > inventory.quantity) {
          // Quantity exceeds available stock
          // You could reduce quantity instead of removing
          // return { ...item, quantity: inventory.quantity };
          itemsToRemove.push(cartLineKey(item));
          return false;
        }

        return true;
      });

      // Check if any items need to be removed
      if (itemsToRemove.length > 0) {
        // Update state
        setCartItems(updatedCartItems);
        // Update local storage
        localCart.set(updatedCartItems);

        // Dispatch cart-updated event
        window.dispatchEvent(new CustomEvent("cart-updated"));

        // Show notification for removed items
        if (typeof window !== "undefined") {
          const removedItems = cartItems.filter((item) =>
            itemsToRemove.includes(cartLineKey(item)),
          );
          if (removedItems.length > 0) {
            setTimeout(() => {
              const event = new CustomEvent("show-toast", {
                detail: {
                  message: `${removedItems.length} item(s) removed from cart due to stock issues.`,
                  type: "warning",
                },
              });
              window.dispatchEvent(event);
            }, 500);
          }
        }
      }
    }
  }, [cartProductCurrentPriceQuantity, cartItems]);

  const hasOutOfStockItems = useMemo(() => {
    if (isRestrictedUser) return false;

    return cartItems.some((item) => {
      const inventory = currentOf(item, cartProductCurrentPriceQuantity);
      return inventory?.quantity === 0;
    });
  }, [cartItems, cartProductCurrentPriceQuantity, isRestrictedUser]);

  return {
    totalCartItems,
    cartItems: isRestrictedUser ? [] : cartItems,
    cartItemsForOrder,
    isProductPriceLoading: isRestrictedUser ? false : isProductPriceLoading,
    discount,
    subTotal,
    isRestrictedUser,
    clearCartForRestrictedUser,
    inventoryByProductId,
    hasOutOfStockItems,
  };
}
