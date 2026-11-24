/* eslint-disable @typescript-eslint/no-explicit-any */
// @/hooks/api/useSocialSync.ts
import { useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/modules/auth/services/auth-api.service";
import { accessTokenCreate, refreshCreate } from "@/modules/auth/actions/auth.actions";
import { toast } from "sonner";

export const useSocialAuth = (onSuccess?: () => void) => {
  const { data: session, status } = useSession();
  console.log("session : ", session);
  // Ensure we only attempt social sync once per NextAuth session
  const hasSyncedRef = useRef(false);

  const mutation = useMutation({
    mutationFn: authService.socialLogin,
    onSuccess: async (data) => {
      hasSyncedRef.current = true;
      // 1. Save NestJS tokens to cookies
      await Promise.all([
        refreshCreate(data.refresh_token),
        accessTokenCreate(data.access_token),
      ]);

      toast.success("Login successful!");

      // 2. Clear NextAuth session (optional, but keeps your app JWT as the source of truth)
      await signOut({ redirect: false });

      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      hasSyncedRef.current = true;
      const message =
        error?.message ||
        error?.errorMessages ||
        error?.response?.data?.message ||
        "Social Login failed";
      toast.error(message);
      void signOut({ redirect: false }); // Clear failed session
    },
  });

  useEffect(() => {
    // When NextAuth successfully gets Google data, send it to NestJS
    if (
      !hasSyncedRef.current &&
      status === "authenticated" &&
      session?.user &&
      !mutation.isSuccess &&
      !mutation.isPending
    ) {
      const provider =
        (session as any).provider?.toUpperCase() || "GOOGLE";
      console.log("provider : ", provider);
      mutation.mutate({
        email: session.user.email!,
        firstName: session.user.name || "User",
        providerId: (session as any).token?.sub || session.user.email!,
        provider: provider,
        image: session.user.image || "",
      });
    }
  }, [status, session, mutation]);

  return mutation;
};

// /* eslint-disable @typescript-eslint/no-explicit-any */
// // @/hooks/api/useSocialSync.ts
// import { useEffect, useRef } from "react";
// import { useSession, signOut } from "next-auth/react";
// import { useMutation } from "@tanstack/react-query";
// import { authService } from "@/modules/auth/services/auth-api.service";
// import { accessTokenCreate, refreshCreate } from "@/modules/auth/actions/auth.actions";
// import { toast } from "sonner";

// export const useSocialAuth = (onSuccess?: () => void) => {
//   const { data: session, status } = useSession();

//   // Ensure we only attempt social sync once per NextAuth session
//   const hasSyncedRef = useRef(false);

//   const mutation = useMutation({
//     mutationFn: authService.socialLogin,
//     onSuccess: async (data) => {
//       hasSyncedRef.current = true;
//       // 1. Save NestJS tokens to cookies
//       await Promise.all([
//         refreshCreate(data.refresh_token),
//         accessTokenCreate(data.access_token),
//       ]);

//       toast.success("Social login successful!");

//       // 2. Clear NextAuth session (optional, but keeps your app JWT as the source of truth)
//       await signOut({ redirect: false });

//       if (onSuccess) onSuccess();
//     },
//     onError: (error: any) => {
//       hasSyncedRef.current = true;
//       const message =
//         error?.message ||
//         error?.errorMessages ||
//         error?.response?.data?.message ||
//         "Social sync failed";
//       toast.error(message);
//       void signOut({ redirect: false }); // Clear failed session
//     },
//   });

//   useEffect(() => {
//     // When NextAuth successfully gets Google data, send it to NestJS
//     if (
//       !hasSyncedRef.current &&
//       status === "authenticated" &&
//       session?.user &&
//       !mutation.isSuccess &&
//       !mutation.isPending
//     ) {

//       const provider = (session as any).token?.provider?.toUpperCase() || "GOOGLE";

//       mutation.mutate({
//         email: session.user.email!,
//         firstName: session.user.name || "User",
//         providerId: (session as any).token?.sub || session.user.email!,
//         provider: "GOOGLE",
//         image: session.user.image || "",
//       });
//     }
//   }, [status, session, mutation]);

//   return mutation;
// };
