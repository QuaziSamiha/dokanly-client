import { getUserInfo } from "@/modules/auth/services/auth.service";

export function useUser() {
  const userInfo =
    (getUserInfo() as {
      sub?: number;
      email?: string;
      role?: string;
    }) || {};
  // console.log(userInfo);
  const { sub: userId } = userInfo;
  return { userId, userInfo };
}
