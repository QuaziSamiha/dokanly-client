
export {};

interface FacebookPixelFn {
  (command: string, ...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  loaded?: boolean;
  version?: string;
  push: FacebookPixelFn;
}

declare global {
  interface Window {
    // Adding the '?' makes the 'if (f.fbq)' check valid
    fbq?: FacebookPixelFn;
    _fbq?: FacebookPixelFn;
  }
}

/**
 * 
 * Cleanliness: Keeps your FacebookPixel.tsx component focused on UI logic rather than type definitions.
 * Reusability: Any file in your project can now use window.fbq without throwing a Red Squiggle error.
 * Zero Overhead: Since it's a .d.ts file, it adds 0 bytes to your final production JavaScript bundle.
 * 1. The .d.ts Extension
 * The d stands for Declaration.
 * .ts files contain executable code (logic, functions, variables) that gets compiled into JavaScript.
 * .d.ts files contain only type information. They do not produce any JavaScript output after compilation.
 * They are used to describe the "shape" of code that already exists elsewhere (like a third-party script from 
 Facebook or a global variable like window).
 */
