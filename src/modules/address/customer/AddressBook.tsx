"use client";

import ConfirmModal from "@/components/primitives/modal/ConfirmModal";
import { Skeleton } from "@/components/ui/skeleton";
import { axiosInstance } from "@/lib/axios/axiosInstance";
import { cn } from "@/lib/utils";
import {
  AccountCard,
  AccountPageHeader,
  EmptyPanel,
  primaryButtonClass,
} from "@/modules/account/customer/AccountUI";
import {
  USER_ADDRESS_KEY,
  useUserAddress,
} from "@/modules/address/hooks/useUserAddress";
import { IAddress } from "@/modules/address/types/address.types";
import { orderDeliveryRegions } from "@/modules/checkout/constants/checkout.constants";
import { IGenericErrorResponse } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, MapPin, MapPinPlus, Pencil, Star, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import AddressFormDialog from "./AddressFormDialog";

const divisionName = (state?: string | null) =>
  orderDeliveryRegions.find((r) => r.id === state)?.name ?? state ?? "";

/** The customer's saved delivery addresses: add, edit, delete, pick the default. */
export default function AddressBook() {
  const queryClient = useQueryClient();
  const { customerAddresses, isUserAddressLoading } = useUserAddress();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IAddress | null>(null);
  const [deleting, setDeleting] = useState<IAddress | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: [USER_ADDRESS_KEY] });

  const { mutate: setDefault, isPending: isSettingDefault, variables: settingId } =
    useMutation<unknown, IGenericErrorResponse, number>({
      mutationFn: (id) => axiosInstance.patch(`/address/${id}/default`),
      onSuccess: () => {
        toast.success("Default address updated", { duration: 1500, className: "toast-update" });
        refresh();
      },
      onError: (error) => toast.error(error?.message || "Could not update the default"),
    });

  const { mutate: remove, isPending: isDeleting } = useMutation<
    unknown,
    IGenericErrorResponse,
    number
  >({
    mutationFn: (id) => axiosInstance.delete(`/address/${id}`),
    onSuccess: () => {
      toast.success("Address deleted", { duration: 1500, className: "toast-delete" });
      setDeleting(null);
      refresh();
    },
    onError: (error) => toast.error(error?.message || "Could not delete the address"),
  });

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (address: IAddress) => {
    setEditing(address);
    setFormOpen(true);
  };

  return (
    <section className="flex flex-col gap-6">
      <AccountPageHeader
        title="Addresses"
        description="Save the places you get deliveries to and check out faster."
        actions={
          customerAddresses.length > 0 ? (
            <button type="button" onClick={openAdd} className={primaryButtonClass}>
              <MapPinPlus className="h-4 w-4" />
              Add address
            </button>
          ) : undefined
        }
      />

      {isUserAddressLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      ) : customerAddresses.length === 0 ? (
        <EmptyPanel
          icon={MapPin}
          title="No saved addresses"
          description="Add an address now, or it will be saved automatically the first time you check out."
          action={
            <button type="button" onClick={openAdd} className={primaryButtonClass}>
              <MapPinPlus className="h-4 w-4" />
              Add your first address
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customerAddresses.map((address) => (
            <AccountCard
              key={address.id}
              as="article"
              className={cn(
                "flex flex-col p-5 transition-colors",
                address.isDefault && "border-greenPrimary-400 ring-1 ring-greenPrimary-400",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-greenPrimary-950 text-greenPrimary-600">
                  <MapPin className="h-5 w-5" />
                </span>
                {address.isDefault && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-greenPrimary-500 px-2.5 py-1 text-xs font-semibold text-white">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Default
                  </span>
                )}
              </div>

              <address className="mt-4 flex flex-1 flex-col gap-0.5 text-sm not-italic text-neutralPrimary-700">
                <span className="font-semibold text-neutralPrimary-800">{address.street}</span>
                <span>
                  {[address.city, divisionName(address.state)].filter(Boolean).join(", ")}
                </span>
                <span>
                  {[address.zipCode, address.country].filter(Boolean).join(", ")}
                </span>
              </address>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-neutralPrimary-200 pt-4 text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => openEdit(address)}
                  className="inline-flex items-center gap-1.5 text-neutralPrimary-700 hover:text-greenPrimary-600 cursor-pointer"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(address)}
                  className="inline-flex items-center gap-1.5 text-neutralPrimary-700 hover:text-destructive-600 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
                {!address.isDefault && (
                  <button
                    type="button"
                    onClick={() => setDefault(address.id)}
                    disabled={isSettingDefault}
                    className="ml-auto inline-flex items-center gap-1.5 text-greenPrimary-600 hover:text-greenPrimary-700 cursor-pointer disabled:opacity-60"
                  >
                    <Star className="h-4 w-4" />
                    {isSettingDefault && settingId === address.id ? "Saving…" : "Set as default"}
                  </button>
                )}
              </div>
            </AccountCard>
          ))}

          {/* ==== ADD TILE ==== */}
          <button
            type="button"
            onClick={openAdd}
            className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutralPrimary-300 text-neutralPrimary-500 transition-colors hover:border-greenPrimary-400 hover:bg-greenPrimary-950 hover:text-greenPrimary-600 cursor-pointer"
          >
            <MapPinPlus className="h-7 w-7" />
            <span className="text-sm font-semibold">Add a new address</span>
          </button>
        </div>
      )}

      <AddressFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        address={editing}
        isFirstAddress={customerAddresses.length === 0}
      />

      <ConfirmModal
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={() => deleting && remove(deleting.id)}
        isPending={isDeleting}
        title="Delete this address?"
        description={
          deleting?.isDefault && customerAddresses.length > 1
            ? "This is your default address. Your newest other address will become the default. Past orders are not affected."
            : "Past orders keep their delivery address and are not affected."
        }
        confirmLabel="Delete address"
      >
        {deleting && (
          <p className="rounded-lg bg-neutralPrimary-50 p-3 text-sm text-neutralPrimary-700">
            {deleting.street}, {deleting.city}
          </p>
        )}
      </ConfirmModal>
    </section>
  );
}
