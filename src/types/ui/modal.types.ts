import { ReactNode } from "react";

// =========== CUSTOM MODAL ==========
export interface ICustomModal {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  subTitle1?: string;
  subTitle2?: string;
  footerButton: ReactNode;
  dialogWidth?: string;
  dialogHeight?: string;
}

export interface ICustomModal2 {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  footerButton?: ReactNode;
  footerRequired?: boolean;
  dialogWidth?: string;
  dialogHeight?: string;
  /** The children render their own DialogTitle and DialogDescription. */
  hasOwnTitle?: boolean;
  children: ReactNode;
}
// ============ CONFIRM MODAL ============
export type ConfirmModalVariant = "danger" | "warning" | "info";

export interface IConfirmModal {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description?: ReactNode;
  /** Optional block under the description, e.g. a summary of the item. */
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmModalVariant;
  /** Keeps the modal open, shows a spinner and blocks closing. */
  isPending?: boolean;
}

/** Options for the global confirm dialog opened through useConfirm(). */
export interface IConfirmOptions
  extends Omit<IConfirmModal, "open" | "onOpenChange" | "onConfirm" | "isPending"> {
  /**
   * Optional action to run from inside the dialog. When it returns a promise
   * the dialog stays open with a spinner until it settles, and stays open on
   * failure so the user can retry or cancel.
   */
  onConfirm?: () => unknown;
}

export interface IConfirmDeleteOptions
  extends Partial<Omit<IConfirmOptions, "variant">> {
  /** What is being deleted, e.g. "slider" or `coupon "EID25"`. */
  itemName?: string;
}
// ============ MODAL CONTENT COMPONENT ============
export interface IModal {
  setOpen?: (open: boolean) => void;
  refetch?: () => void;
  onClose?: () => void;
  data?: unknown;
  isLoading?: boolean;
}
