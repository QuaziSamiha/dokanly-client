const CART_KEY = "local_cart";

export interface ILocalCartItem {
  id: number; // product id
  variantId?: number; // size id, for a product that comes in sizes
  size?: string; // size label ("100ml"); also part of name
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  quantity: number;
}

/** A cart line is a product, or one size of it: two sizes are two lines. */
export const cartLineKey = (item: { id: number; variantId?: number | null }) =>
  `${item.id}:${item.variantId ?? ""}`;

export const isSameLine = (
  a: { id: number; variantId?: number | null },
  b: { id: number; variantId?: number | null },
) => cartLineKey(a) === cartLineKey(b);

export const localCart = {
  get() {
    //* Checks if you are in the browser (not in Next.js server side).
    if (typeof window === "undefined") {
      return [];
    }
    const stored = localStorage.getItem(CART_KEY);
    const cart = stored ? JSON.parse(stored) : []; //* JSON.parse : converts it from string → back to array using
    //* Carts saved before the rename store the discount as "comparePrice"; read it as discountPrice.
    return cart.map(
      ({ comparePrice, ...item }: ILocalCartItem & { comparePrice?: number }) =>
        item.discountPrice === undefined && comparePrice !== undefined
          ? { ...item, discountPrice: comparePrice }
          : item,
    );
    /**
     * If your localStorage looks like: "local_cart": "[{\"id\":1,\"name\":\"Soap\",\"price\":100,\"quantity\":2}]"
     * Then localCart.get() returns: [{ id: 1, name: "Soap", price: 100, quantity: 2 }]
     */
  },

  set(cart: ILocalCartItem[]) {
    if (typeof window === "undefined") return; //* Checks if you are in the browser (not in Next.js server side).
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    /**
     * Now your browser stores:
     * Key: "local_cart"
     * Value: "[{\"id\":1,\"name\":\"Soap\",\"price\":100,\"quantity\":2}]"
     */
    window.dispatchEvent(new Event("cart-updated"));
  },

  addItem(item: {
    id: number;
    variantId?: number;
    size?: string;
    name?: string;
    price?: string;
    discountPrice?: string;
    image?: string;
    quantity: number;
  }) {
    const cart = this.get(); //* Fetches the current cart from localStorage.
    const existing = cart.find((i: ILocalCartItem) => isSameLine(i, item)); //* Checks if the item already exists

    if (existing) {
      existing.quantity += item.quantity; //* If yes → increases the quantity.
    } else {
      cart.push(item); //* If not → adds the new product to the cart array.
    }

    this.set(cart); //* Saves the updated cart back to localStorage.
  },

  removeItem(id: number, variantId?: number) {
    const cart = this.get();
    const updatedCart = cart.filter(
      (i: ILocalCartItem) => !isSameLine(i, { id, variantId }),
    ); //* Filter out (remove) the item that matches the given id
    this.set(updatedCart); //* Save the new array back to localStorage
  },

  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(CART_KEY);
    window.dispatchEvent(new Event("cart-updated"));
  },
};
