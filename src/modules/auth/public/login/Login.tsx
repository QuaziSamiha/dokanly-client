"use client";
import InputField from "@/components/form/InputField";
import PasswordField from "@/components/form/PasswordField";
import SubmitButton from "@/components/form/SubmitButton";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormValues, loginSchema } from "@/modules/auth/schemas/login.schema";
import { useRouter } from "next/navigation";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { toast } from "sonner";
import ForgotPasswordModal from "../forgot-password/ForgotPasswordModal";
import { FcGoogle } from "react-icons/fc";
import { signIn, useSession } from "next-auth/react";
import { useSocialAuth } from "@/modules/auth/hooks/useSocialAuth";
import { FaFacebook } from "react-icons/fa";

export default function Login() {
  const { status } = useSession();
  // console.log(session);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      console.log("status", status);
      router.push("/dashboard");
    }
  }, [status, router]);

  // Landing here because the session died mid-session rather than by choice —
  // say so, otherwise being dumped on the login form looks like a glitch.
  // Read straight off the URL: useSearchParams would force this whole page
  // behind a Suspense boundary for one optional flag.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("sessionExpired")) {
      toast.info("Your session has expired. Please log in again.");
      params.delete("sessionExpired");
      const query = params.toString();
      window.history.replaceState(
        null,
        "",
        window.location.pathname + (query ? `?${query}` : ""),
      );
    }
  }, []);

  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { trigger, control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate: login, isPending } = useAuth(() => {
    router.push("/dashboard");
  });

  const handleForgotPassword = () => {
    const email = control?._formValues.email;

    if (email) {
      setShowForgotPassword(true);
    } else {
      toast.info("Please enter your email above first");
    }
  };

  const handlePasswordResetSuccess = () => {
    setShowForgotPassword(false);
    // toast.success("Password reset successful! Please login with your new password.");
  };

  const { isPending: isSocialLoginPending } = useSocialAuth(() => {
    router.push("/dashboard");
  });

  // const handleGoogleAuth = () => {
  //   // Trigger NextAuth Google Flow
  //   signIn("google", { callbackUrl: window.location.href, redirect: false });
  // };

  const onSubmit = (data: LoginFormValues) => {
    login(data);
  };

  const handleSocialLogin = (provider: "google" | "facebook") => {
    console.log("Login with ", provider);
    signIn(provider, { callbackUrl: "/dashboard", redirect: true });
  };

  return (
    <>
      <section className="bg-backgroundPrimary relative overflow-hidden">
        <div className="absolute -top-12 left-[8%] w-96 h-96 hidden lg:block pointer-events-none">
          <Image
            src="/images/auth/login-top-left.png"
            alt=""
            aria-hidden
            height={439}
            width={465}
            className="object-contain max-lg:hidden"
          />
        </div>
        <div className="absolute -top-12 right-[8%] w-96 h-96 hidden lg:block pointer-events-none">
          <Image
            src="/images/auth/login-top-right.png"
            alt=""
            aria-hidden
            height={439}
            width={465}
            className="object-contain max-lg:hidden"
          />
        </div>
        <div className="absolute bottom-0 left-0 w-80 h-80 hidden lg:block pointer-events-none">
          <Image
            src="/images/auth/login-bottom-left.png"
            alt=""
            aria-hidden
            height={439}
            width={465}
            className="object-contain max-lg:hidden"
          />
        </div>
        <div className="absolute bottom-0 right-0 w-80 h-80 hidden lg:block pointer-events-none">
          <Image
            src="/images/auth/login-bottom-right.png"
            alt=""
            aria-hidden
            height={439}
            width={465}
            className="object-contain max-lg:hidden"
          />
        </div>
        <div className="container relative z-10 mx-auto flex justify-center items-center px-4 py-10 sm:py-14 lg:py-20">
          <div className="w-full max-w-[440px] flex flex-col gap-7 rounded-2xl border border-neutralPrimary-200/80 bg-white/95 p-6 shadow-[0_8px_30px_rgba(17,24,39,0.06)] backdrop-blur-sm sm:p-10">
            <div className="flex flex-col gap-2 text-center">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutralPrimary-900">
                Login
              </h1>
              <p className="text-sm sm:text-[15px] leading-6 font-normal text-neutralPrimary-600">
                Enter your email and password to access your account
              </p>
            </div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full flex flex-col gap-5"
            >
              <InputField
                labelName="Email"
                placeholderText="Enter Your Email"
                name="email"
                control={control}
                trigger={trigger}
                isRequired
              />
              <div className="flex flex-col gap-2">
                <PasswordField
                  labelName="Password"
                  placeholderText="Enter Your Password"
                  name="password"
                  control={control}
                  trigger={trigger}
                  isRequired
                />
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-greenPrimary-600 hover:text-greenPrimary-700 hover:underline underline-offset-4 font-medium text-sm transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>
              <div className="mt-1">
                <SubmitButton submitTitle="Login" isPending={isPending} />
              </div>
            </form>

            <div className="w-full flex flex-col gap-3">
              <div className="relative flex items-center justify-center py-1">
                <div className="flex-grow border-t border-neutralPrimary-200"></div>
                <span className="flex-shrink mx-4 text-neutralPrimary-400 text-xs font-medium uppercase tracking-[0.08em]">
                  Or continue with
                </span>
                <div className="flex-grow border-t border-neutralPrimary-200"></div>
              </div>
              <button
                type="button"
                disabled={isSocialLoginPending}
                onClick={() => handleSocialLogin("google")}
                className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 w-full h-11 flex items-center justify-center gap-3 px-4 border border-neutralPrimary-300 bg-white rounded-lg hover:bg-neutralPrimary-50 hover:border-neutralPrimary-400 transition-colors duration-200 text-sm sm:text-[15px] font-semibold text-neutralPrimary-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-greenPrimary-500/20"
              >
                <FcGoogle className="text-xl shrink-0" />
                <span>
                  {/* Continue with Google */}
                  {isSocialLoginPending ? "Logging in..." : "Continue with Google"}
                </span>
              </button>
              <button
                type="button"
                disabled={isSocialLoginPending}
                onClick={() => handleSocialLogin("facebook")}
                className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 w-full h-11 flex items-center justify-center gap-3 px-4 border border-neutralPrimary-300 bg-white rounded-lg hover:bg-neutralPrimary-50 hover:border-neutralPrimary-400 transition-colors duration-200 text-sm sm:text-[15px] font-semibold text-neutralPrimary-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-greenPrimary-500/20"
              >
                <FaFacebook className="text-xl shrink-0 text-blueSecondary-500" />
                <span>
                  {/* Continue with Facebook */}
                  {isSocialLoginPending ? "Logging in..." : "Continue with Facebook"}
                </span>
              </button>
            </div>
            <div className="text-sm flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 border-t border-neutralPrimary-100 pt-6">
              <p className="font-normal text-neutralPrimary-600">
                Don&apos;t have an account?
              </p>
              <Link
                href="/create-account"
                className="font-semibold text-greenPrimary-600 hover:text-greenPrimary-700 hover:underline underline-offset-4 transition-colors duration-200"
              >
                Create an Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {showForgotPassword && (
        <ForgotPasswordModal
          email={control._formValues.email}
          onClose={() => setShowForgotPassword(false)}
          onSuccess={handlePasswordResetSuccess}
        />
      )}
    </>
  );
}
