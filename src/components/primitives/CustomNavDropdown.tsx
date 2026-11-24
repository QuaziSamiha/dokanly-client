"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import React from "react";
import { HiOutlineUser } from "react-icons/hi2";
import { LuLogOut } from "react-icons/lu";
import { logout } from "@/modules/auth/services/auth.service";
import { useCurrentUser } from "@/modules/user/hooks/useCurrentUser";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { MdOutlineDashboardCustomize } from "react-icons/md";
import { signOut, useSession } from "next-auth/react";
import { ACCOUNT_NAV } from "@/modules/account/constants/account-nav.constants";

const itemClass =
  "group/item flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm text-neutralPrimary-700 cursor-pointer transition-colors focus:bg-greenPrimary-950 focus:text-greenPrimary-800";
const iconTileClass =
  "flex h-8 w-8 items-center justify-center rounded-lg bg-neutralPrimary-100 text-neutralPrimary-600 transition-colors group-focus/item:bg-greenPrimary-50 group-focus/item:text-greenPrimary-700";

export default function CustomNavDropdown() {
  const { currentUserData, isUserAdmin, isUserEmployee, isCurrentUserLoading } =
    useCurrentUser();
  // console.log(currentUserData);
  //  const session = await getServerSession(authOptions);
  //   console.log(session);

  const { data: session,  } = useSession();
  // console.log(session);

  //* ==== SHOWN WHENEVER THERE IS NO PHOTO, OR THE STORED ONE FAILS TO LOAD
  //* (RADIX SWAPS IN THE FALLBACK ON AN IMAGE ERROR) ====
  const profileInitial =
    (currentUserData?.name || currentUserData?.email || session?.user?.name)
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || "?";

  const handleLogout = async () => {
    // 1. You might want to call your custom logout service first
    // if it clears your access_token/refresh_token cookies
    await logout();

    // 2. Perform NextAuth signout
    // redirect: true will force a hard reload, which helps reset the CSRF state
    await signOut({
      callbackUrl: "/login",
      redirect: true,
    });
  };
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Account menu"
          className="group sm:ml-4 outline-none flex items-center gap-2.5 rounded-full p-0.5 sm:py-1 sm:pl-1 sm:pr-3 text-neutralPrimary-800 cursor-pointer transition-colors duration-200 hover:bg-neutralPrimary-100 data-[state=open]:bg-neutralPrimary-100">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={currentUserData?.profileImageUrl ?? undefined}
              alt={currentUserData?.name || "Profile"}
            />
            <AvatarFallback className="bg-gradient-to-br from-greenPrimary-100 to-greenPrimary-300 text-greenPrimary-800 text-sm font-bold">
              {profileInitial}
            </AvatarFallback>
          </Avatar>
          {isCurrentUserLoading ? (
            <Skeleton className="bg-gray-100 h-4 w-20 max-md:hidden" />
          ) : (
            <div className="flex flex-col items-start justify-start leading-tight max-md:hidden">
              <p className="text-sm font-semibold text-neutralPrimary-800">
                {currentUserData?.name}
              </p>
              <p className="text-[11px] font-medium text-greenPrimary-600 capitalize">
                {currentUserData?.role?.toLowerCase()}
              </p>
            </div>
          )}
          <ChevronDown className="max-sm:hidden w-4 h-4 text-neutralPrimary-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={10}
          collisionPadding={12}
          className="z-[9999] w-[280px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-neutralPrimary-200 bg-white p-0 shadow-[0_20px_50px_-12px_rgba(23,30,3,0.25)]"
        >
          {/* ==== PROFILE HEADER ==== */}
          <div className="relative flex items-center gap-3 bg-gradient-to-br from-greenPrimary-950 via-white to-white px-4 pb-4 pt-5">
            <div className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-greenPrimary-50/50 blur-2xl" />
            <Avatar className="h-12 w-12 ring-2 ring-white shadow-md">
              <AvatarImage
                src={currentUserData?.profileImageUrl ?? undefined}
                alt={currentUserData?.name || "Profile"}
              />
              <AvatarFallback className="bg-gradient-to-br from-greenPrimary-100 to-greenPrimary-300 text-greenPrimary-800 text-base font-bold">
                {profileInitial}
              </AvatarFallback>
            </Avatar>
            {isCurrentUserLoading ? (
              <div className="flex flex-col gap-1.5">
                <Skeleton className="bg-gray-100 h-3 w-28" />
                <Skeleton className="bg-gray-100 h-2.5 w-36" />
              </div>
            ) : (
              <div className="relative flex min-w-0 flex-col items-start gap-1">
                <p className="w-full truncate text-[15px] font-semibold text-neutralPrimary-900">
                  {currentUserData?.name || session?.user.name}
                </p>
                {currentUserData?.email && (
                  <p className="w-full truncate text-xs text-neutralPrimary-500">
                    {currentUserData.email}
                  </p>
                )}
                {currentUserData?.role && (
                  <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-greenPrimary-50/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-greenPrimary-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-greenPrimary-500" />
                    {currentUserData.role.toLowerCase()}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ==== MENU ITEMS ==== */}
          <div className="border-t border-neutralPrimary-200 p-2">
            {!isUserAdmin &&
              !isUserEmployee &&
              ACCOUNT_NAV.map((item) => (
                <DropdownMenuItem key={item.href} asChild className={itemClass}>
                  <Link href={item.href}>
                    <span className={iconTileClass}>
                      <item.icon className="w-[18px] h-[18px]" />
                    </span>
                    <span className="font-medium">
                      {item.exact ? "My Account" : item.label}
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))}
            {(isUserAdmin || isUserEmployee) && (
              <>
                <DropdownMenuItem asChild className={itemClass}>
                  <Link href={"/dashboard"}>
                    <span className={iconTileClass}>
                      <MdOutlineDashboardCustomize className="w-[18px] h-[18px]" />
                    </span>
                    <span className="font-medium">Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className={itemClass}>
                  <Link href={"/profile"}>
                    <span className={iconTileClass}>
                      <HiOutlineUser className="w-[18px] h-[18px]" />
                    </span>
                    <span className="font-medium">Profile</span>
                  </Link>
                </DropdownMenuItem>
              </>
            )}
            {/* <DropdownMenuItem className="flex items-center gap-3 text-neutralPrimary-700 cursor-pointer">
              <TbLockPassword className="font-semibold w-5 h-5" />
              <p className="font-medium">Change Password</p>
            </DropdownMenuItem> */}
          </div>

          {/* ==== LOGOUT ==== */}
          <div className="border-t border-neutralPrimary-200 p-2">
            <DropdownMenuItem
              className="group/logout flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm text-neutralPrimary-700 cursor-pointer transition-colors focus:bg-red-50 focus:text-red-600"
              onClick={handleLogout}
              // onClick={() => signOut()}
              // onClick={() => logout()}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutralPrimary-100 text-neutralPrimary-600 transition-colors group-focus/logout:bg-red-100 group-focus/logout:text-red-600">
                <LuLogOut className="w-[18px] h-[18px]" />
              </span>
              <span className="font-medium">Logout</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
