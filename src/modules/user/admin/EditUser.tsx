"use client";

import React from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  AlertTriangle,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  Info,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import CategoryFormDialog from "@/modules/category/admin/CategoryFormDialog";
import { usePatch } from "@/hooks/api/usePatch";
import { useCurrentUser } from "@/modules/user/hooks/useCurrentUser";
import { initialsOf } from "@/modules/user/utils/user.utils";
import { IModal } from "@/types";
import { IUser } from "@/modules/user/types/user.types";

type UserRole = IUser["role"];

interface IEditUserForm {
  role: UserRole;
}

// Same colours as the role column in user.columns.tsx
const ROLE_OPTIONS: {
  id: UserRole;
  name: string;
  description: string;
  icon: React.ReactNode;
  badge: string;
}[] = [
  {
    id: "ADMIN",
    name: "Admin",
    description: "Full dashboard access, including managing users and roles.",
    icon: <ShieldCheck className="size-5" aria-hidden />,
    badge: "bg-blueSecondary-100 text-blueSecondary-600",
  },
  {
    id: "EMPLOYEE",
    name: "Employee",
    description:
      "Dashboard access to products, categories, inventory and orders.",
    icon: <BriefcaseBusiness className="size-5" aria-hidden />,
    badge: "bg-teal-100 text-teal-600",
  },
  {
    id: "CUSTOMER",
    name: "Customer",
    description: "Shops on the storefront. No dashboard access.",
    icon: <UserRound className="size-5" aria-hidden />,
    badge: "bg-neutralPrimary-100 text-neutralPrimary-600",
  },
];

const roleOption = (role?: UserRole) =>
  ROLE_OPTIONS.find((option) => option.id === role);

/** What changes for the user when they move from one role to another. */
function changeNotice(from: UserRole, to: UserRole) {
  if (to === "ADMIN")
    return "They will get full dashboard access, including the power to change other users' roles.";
  if (to === "CUSTOMER") return "They will lose access to the admin dashboard.";
  if (from === "ADMIN")
    return "They will keep store access but lose users, promotions, content and settings.";
  return "They will get dashboard access to products, categories, inventory and orders.";
}

export default function EditUser({ data, setOpen, onClose, refetch }: IModal) {
  const rowData = data as IUser;
  const { userId } = useCurrentUser();
  const isSelf = userId !== undefined && Number(userId) === rowData?.id;

  const { control, handleSubmit, watch } = useForm<IEditUserForm>({
    defaultValues: { role: rowData?.role },
  });

  const selectedRole = watch("role");
  const hasChanged = selectedRole !== rowData?.role;
  const current = roleOption(rowData?.role);
  const selected = roleOption(selectedRole);

  const close = () => (onClose ?? (() => setOpen?.(false)))();

  const { mutate: updateUser, isPending } = usePatch<IUser>(
    (response) => {
      if (response.statusCode >= 200 && response.statusCode < 300) {
        setOpen?.(false);
        refetch?.();
      }
    },
    (error) => {
      console.error("Update failed:", error);
    },
  );

  const onSubmit: SubmitHandler<IEditUserForm> = (form) => {
    if (form.role === rowData.role) {
      toast.info("No changes detected!");
      return;
    }
    updateUser({
      endpoint: `/users/${rowData.id}`,
      data: { role: form.role },
    });
  };

  if (!rowData) return null;

  return (
    <CategoryFormDialog
      title="Edit User"
      description="Change what this person can access."
      submitLabel="Save Changes"
      pendingLabel="Saving..."
      isPending={isPending}
      submitDisabled={!hasChanged || isSelf}
      onSubmit={handleSubmit(onSubmit)}
      onClose={close}
    >
      {/* Who is being edited — read-only, so shown as a card, not a field */}
      <div className="flex min-w-0 items-center gap-3 rounded-xl border border-neutralPrimary-200 bg-neutralPrimary-50 p-3 sm:gap-4 sm:p-4">
        {rowData.profileImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={rowData.profileImageUrl}
            alt=""
            className="size-11 shrink-0 rounded-full object-cover sm:size-12"
          />
        ) : (
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-greenPrimary-500 text-sm font-semibold text-white sm:size-12 sm:text-base">
            {initialsOf(rowData.name)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-neutralPrimary-800 sm:text-base">
            <span className="truncate">{rowData.name}</span>
            {rowData.emailVerified && (
              <BadgeCheck
                className="size-4 shrink-0 text-blueSecondary-600"
                aria-label="Email verified"
              />
            )}
          </p>
          <p className="truncate text-xs text-neutralPrimary-500 sm:text-sm">
            {rowData.email}
          </p>
        </div>
        {current && (
          <span
            className={`hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold min-[400px]:inline-flex ${current.badge}`}
          >
            {current.name}
          </span>
        )}
      </div>

      <Controller
        name="role"
        control={control}
        render={({ field }) => (
          <fieldset disabled={isSelf || isPending} className="min-w-0">
            <legend className="mb-3 text-sm font-semibold text-neutralPrimary-700">
              Role
            </legend>
            <div className="flex flex-col gap-2.5">
              {ROLE_OPTIONS.map((option) => {
                const checked = field.value === option.id;
                const isCurrent = rowData.role === option.id;
                return (
                  <label
                    key={option.id}
                    className={`group relative flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all duration-200 sm:p-4 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-greenPrimary-500/25 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 ${
                      checked
                        ? "border-greenPrimary-500 bg-greenPrimary-950 shadow-sm"
                        : "border-neutralPrimary-200 bg-white hover:border-greenPrimary-300 hover:bg-neutralPrimary-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={field.name}
                      value={option.id}
                      checked={checked}
                      onChange={() => field.onChange(option.id)}
                      onBlur={field.onBlur}
                      className="sr-only"
                    />
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${option.badge}`}
                    >
                      {option.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-sm font-semibold text-neutralPrimary-800 sm:text-base">
                          {option.name}
                        </span>
                        {isCurrent && (
                          <span className="rounded-full bg-neutralPrimary-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-neutralPrimary-500">
                            Current
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-xs text-neutralPrimary-500 sm:text-sm">
                        {option.description}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        checked
                          ? "border-greenPrimary-500 bg-greenPrimary-500 text-white"
                          : "border-neutralPrimary-300 bg-white group-hover:border-greenPrimary-300"
                      }`}
                    >
                      {checked && <Check className="size-3" strokeWidth={3} />}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}
      />

      {isSelf ? (
        <p className="flex items-start gap-2.5 rounded-xl border border-blueSecondary-600/20 bg-blueSecondary-100 p-3 text-sm text-blueSecondary-600">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          You can&apos;t change your own role. Ask another admin to do it.
        </p>
      ) : (
        hasChanged &&
        current &&
        selected && (
          <p
            role="status"
            className="flex items-start gap-2.5 rounded-xl border border-warningPrimary-600/20 bg-warningPrimary-100 p-3 text-sm text-warningPrimary-600 animate-in fade-in slide-in-from-top-1 duration-200 motion-reduce:animate-none"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              <span className="font-semibold">
                {current.name} → {selected.name}.
              </span>{" "}
              {changeNotice(current.id, selected.id)}
            </span>
          </p>
        )
      )}
    </CategoryFormDialog>
  );
}
