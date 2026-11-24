import { ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function EmptyCart() {
  return (
    <div className="max-xl:px-4 my-6 w-full flex flex-col items-center justify-center text-center border border-neutralPrimary-200 rounded-2xl p-10 bg-neutralPrimary-50 shadow-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="bg-greenPrimary-100 text-greenPrimary-600 p-4 rounded-full">
          <ShoppingCart size={40} />
        </div>

        <h2 className="text-2xl font-semibold text-neutralPrimary-800">
          Your cart is empty
        </h2>

        <p className="text-neutralPrimary-600 max-w-sm">
          Looks like you haven&apos;t added anything to your cart yet.  
          Start shopping and find something you love!
        </p>

        <Link
          href="/product"
          className="mt-4 bg-greenPrimary-500 hover:bg-greenPrimary-600 transition-all text-white font-semibold py-2.5 px-6 rounded-lg"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
