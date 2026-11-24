"use client";

import React, { ReactNode, useCallback, useMemo, useRef, useState } from "react";
import ConfirmModal from "@/components/primitives/modal/ConfirmModal";
import { ConfirmContext, IConfirmContext } from "@/hooks/useConfirm";
import { IConfirmDeleteOptions, IConfirmOptions } from "@/types";

/** Mounts one ConfirmModal for the whole app; open it with useConfirm(). */
export default function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<IConfirmOptions | null>(null);
  const [isPending, setIsPending] = useState(false);
  const resolverRef = useRef<((confirmed: boolean) => void) | null>(null);

  const settle = useCallback((confirmed: boolean) => {
    resolverRef.current?.(confirmed);
    resolverRef.current = null;
    setOptions(null);
    setIsPending(false);
  }, []);

  const confirm = useCallback((next: IConfirmOptions) => {
    // A new request replaces one that is still open; the old one counts as cancelled.
    resolverRef.current?.(false);
    setIsPending(false);
    setOptions(next);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const confirmDelete = useCallback(
    ({ itemName = "item", ...rest }: IConfirmDeleteOptions = {}) =>
      confirm({
        title: `Delete this ${itemName}?`,
        description: "This action cannot be undone.",
        confirmLabel: "Delete",
        ...rest,
        variant: "danger",
      }),
    [confirm],
  );

  const handleConfirm = async () => {
    if (!options?.onConfirm) return settle(true);
    try {
      setIsPending(true);
      await options.onConfirm();
      settle(true);
    } catch {
      // The request hook already shows the error toast; keep the dialog open
      // so the user can retry or cancel.
      setIsPending(false);
    }
  };

  const value = useMemo<IConfirmContext>(
    () => ({ confirm, confirmDelete }),
    [confirm, confirmDelete],
  );

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <ConfirmModal
        open={Boolean(options)}
        onOpenChange={(open) => !open && settle(false)}
        onConfirm={handleConfirm}
        isPending={isPending}
        title={options?.title ?? ""}
        description={options?.description}
        confirmLabel={options?.confirmLabel}
        cancelLabel={options?.cancelLabel}
        variant={options?.variant}
      >
        {options?.children}
      </ConfirmModal>
    </ConfirmContext.Provider>
  );
}
