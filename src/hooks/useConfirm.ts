"use client";

import { createContext, useContext } from "react";
import { IConfirmDeleteOptions, IConfirmOptions } from "@/types";

export interface IConfirmContext {
  /** Resolves true when the user confirms (and onConfirm succeeded), else false. */
  confirm: (options: IConfirmOptions) => Promise<boolean>;
  /** confirm() preset for destructive deletes: red variant, "Delete" button. */
  confirmDelete: (options?: IConfirmDeleteOptions) => Promise<boolean>;
}

export const ConfirmContext = createContext<IConfirmContext | null>(null);

/**
 * Styled, promise-based replacement for window.confirm.
 *
 *   const { confirmDelete } = useConfirm();
 *
 *   // Simple: close on confirm, then act
 *   if (await confirmDelete({ itemName: "slider" })) deleteSlider(url);
 *
 *   // With spinner: the dialog waits for the request
 *   confirmDelete({ itemName: "slider", onConfirm: () => deleteAsync(url) });
 */
export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used inside <ConfirmProvider>");
  }
  return context;
}
