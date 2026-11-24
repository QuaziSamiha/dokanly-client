"use client";
import { IUser } from "@/modules/user/types/user.types";
import { useGet } from "@/hooks/api/useGet";
import { getUserInfo } from "@/modules/auth/services/auth.service";
import { useMemo } from "react";

export function useCurrentUser<T extends IUser>() {
  const userInfo =
    (getUserInfo() as {
      sub?: number;
      email?: string;
      role?: string;
    }) || {};

  const { sub: userId } = userInfo;

  const shouldFetchUserData = !!userId;

  const {
    data: currentUserData,
    isLoading: isCurrentUserLoading,
    refetch: currentUserRefetch,
  } = useGet<T>(
    `/users/${userId}`,
    [`getCurrentUser+${userId}`],
    undefined,
    shouldFetchUserData
  );
  // console.log(currentUserData);

  //* ==== CHECK IF USER IS ADMIN ====
  const isUserAdmin = useMemo(() => {
    return currentUserData?.role === "ADMIN";
  }, [currentUserData?.role]);
  // console.log(isUserAdmin)

  //* ==== CHECK IF USER IS EMPLOYEE ====
  const isUserEmployee = useMemo(() => {
    return currentUserData?.role === "EMPLOYEE";
  }, [currentUserData?.role]);

  return {
    currentUserData,
    isCurrentUserLoading,
    currentUserRefetch,
    userId,
    isUserAdmin,
    isUserEmployee,
  };
}
