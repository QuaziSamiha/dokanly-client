"use client";

import InputField from "@/components/form/InputField";
import PasswordField from "@/components/form/PasswordField";
import SubmitButton from "@/components/form/SubmitButton";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateAccountFormValues,
  createAccountSchema,
} from "@/modules/auth/schemas/create-account.schema";
import { usePost } from "@/hooks/api/usePost";
import { useRouter } from "next/navigation";
import { ResponseSuccessType1 } from "@/types";
import OTPVerification from "../otp-verification/OTPVerification";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";
import { useSocialAuth } from "@/modules/auth/hooks/useSocialAuth";
import { motion } from "framer-motion";
import { Gift, Leaf, PackageCheck, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

const perks = [
  {
    icon: Zap,
    title: "Faster checkout",
    text: "Saved addresses and details, so you order in a few taps.",
  },
  {
    icon: PackageCheck,
    title: "Order tracking",
    text: "See every order from packing to your doorstep.",
  },
  {
    icon: Gift,
    title: "Member-only deals",
    text: "Early access to offers and personalized picks.",
  },
];

const strengthLevels = [
  { label: "Weak", bar: "bg-destructive-500", text: "text-destructive-500" },
  { label: "Fair", bar: "bg-warningPrimary-500", text: "text-warningPrimary-600" },
  { label: "Good", bar: "bg-greenPrimary-300", text: "text-greenPrimary-500" },
  { label: "Strong", bar: "bg-greenPrimary-500", text: "text-greenPrimary-600" },
];

// 0-3 index into strengthLevels; one point each for length, mixed case,
// digits and symbols, so a bare 6-char password lands on "Weak".
function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.max(0, score - 1);
}

export default function CreateAccount() {
  const router = useRouter();
  const [step, setStep] = useState<"register" | "otp">("register");
  const [userEmail, setUserEmail] = useState("");

  const { trigger, control, handleSubmit } = useForm({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      userEmail: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = useWatch({ control, name: "password" }) ?? "";
  const strength = getPasswordStrength(password);

  const { mutate: createNewAccount, isPending } = usePost(
    "/users",
    (data: ResponseSuccessType1<UserResponse>) => {
      if (data.statusCode >= 200 && data.statusCode < 300) {
        // Store email for OTP verification
        setUserEmail(data?.data?.email || "");
        // Move to OTP verification step
        setStep("otp");
      }
    },
  );

  const onSubmit: SubmitHandler<CreateAccountFormValues> = (data) => {
    const userData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.userEmail,
      password: data.password,
    };
    createNewAccount(userData);
  };

  const handleOtpVerificationSuccess = () => {
    // Redirect to dashboard or home page after successful verification
    router.push("/dashboard");
  };

  // Handle Google social signup/login (same flow as Login page)
  const { isPending: isSocialSyncing } = useSocialAuth(() => {
    router.push("/dashboard");
  });

  if (step === "otp") {
    return (
      <OTPVerification
        email={userEmail}
        onVerificationSuccess={handleOtpVerificationSuccess}
        onBack={() => setStep("register")}
      />
    );
  }

  const handleGoogleSignup = () => {
    // Trigger NextAuth Google Flow
    signIn("google", { callbackUrl: window.location.href, redirect: false });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-greenPrimary-950/60 via-backgroundPrimary to-backgroundPrimary">
      {/* Soft background glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-greenPrimary-100/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-warningPrimary-200/40 blur-3xl" />

      <div className="container relative z-10 mx-auto flex items-center justify-center px-4 py-10 sm:py-14 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="grid w-full max-w-[1040px] overflow-hidden rounded-3xl border border-neutralPrimary-200/80 bg-white shadow-[0_24px_60px_-20px_rgba(42,52,9,0.25)] lg:grid-cols-[1fr_1.1fr]"
        >
          {/* ---------- Brand panel (desktop) ---------- */}
          <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-greenPrimary-500 via-greenPrimary-600 to-greenPrimary-800 p-10 text-white lg:flex">
            <Image
              src="/images/auth/login-top-right.png"
              alt=""
              aria-hidden
              width={465}
              height={439}
              className="pointer-events-none absolute -top-10 -right-16 w-80 opacity-25 brightness-0 invert"
            />
            <Image
              src="/images/auth/login-bottom-left.png"
              alt=""
              aria-hidden
              width={465}
              height={439}
              className="pointer-events-none absolute -bottom-16 -left-20 w-80 opacity-20 brightness-0 invert"
            />
            <div className="pointer-events-none absolute top-1/3 -left-24 h-64 w-64 rounded-full bg-greenPrimary-200/20 blur-3xl" />

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ring-1 ring-white/25 backdrop-blur-sm">
                <Leaf className="h-3.5 w-3.5" />
                Pure for you
              </span>
              <h2 className="mt-6 text-3xl font-bold leading-tight tracking-tight xl:text-[34px]">
                Nature&apos;s care,
                <br />
                <span className="text-greenPrimary-100">every single day.</span>
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-white/80">
                Create your Natura Care account and make every order simpler.
              </p>
            </div>

            <ul className="relative mt-10 flex flex-col gap-4">
              {perks.map(({ icon: Icon, title, text }, i) => (
                <motion.li
                  key={title}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.1, duration: 0.4 }}
                  className="flex items-start gap-4 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-sm"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-greenPrimary-600 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="mt-0.5 text-[13px] leading-5 text-white/75">
                      {text}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>

            <p className="relative mt-10 flex items-center gap-2 text-xs text-white/70">
              <ShieldCheck className="h-4 w-4" />
              Your details are encrypted and never shared.
            </p>
          </aside>

          {/* ---------- Form panel ---------- */}
          <div className="flex flex-col gap-7 p-6 sm:p-10">
            <div className="flex flex-col gap-2">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-greenPrimary-950 px-3 py-1 text-xs font-semibold text-greenPrimary-600 ring-1 ring-greenPrimary-200/60">
                <Leaf className="h-3.5 w-3.5" />
                Join Natura Care
              </span>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutralPrimary-900 sm:text-[34px]">
                Create an account
              </h1>
              <p className="text-sm leading-6 text-neutralPrimary-600 sm:text-[15px]">
                Enjoy faster checkout, order tracking, and personalized
                recommendations.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex w-full flex-col gap-5"
            >
              <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 sm:gap-4">
                <InputField
                  labelName="First Name"
                  placeholderText="e.g. Quazi"
                  name="firstName"
                  control={control}
                  trigger={trigger}
                  isRequired
                />
                <InputField
                  labelName="Last Name"
                  placeholderText="e.g. Tasnim"
                  name="lastName"
                  control={control}
                  trigger={trigger}
                  isRequired
                />
              </div>
              <InputField
                labelName="Email"
                inputType="email"
                placeholderText="you@example.com"
                name="userEmail"
                control={control}
                trigger={trigger}
                isRequired
              />
              <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 sm:gap-4">
                <div className="flex flex-col gap-2">
                  <PasswordField
                    labelName="Password"
                    placeholderText="At least 6 characters"
                    name="password"
                    control={control}
                    trigger={trigger}
                    isRequired
                  />
                  {/* Shown only once the length rule passes, so it never
                      overlaps the field's absolutely-positioned error text. */}
                  {password.length >= 6 && (
                    <div className="flex items-center gap-3 pl-0.5">
                      <div className="grid flex-1 grid-cols-4 gap-1.5">
                        {strengthLevels.map((level, i) => (
                          <span
                            key={level.label}
                            className={cn(
                              "h-1.5 rounded-full transition-colors duration-300",
                              i <= strength
                                ? strengthLevels[strength].bar
                                : "bg-neutralPrimary-100",
                            )}
                          />
                        ))}
                      </div>
                      <span
                        className={cn(
                          "w-12 text-right text-xs font-semibold",
                          strengthLevels[strength].text,
                        )}
                      >
                        {strengthLevels[strength].label}
                      </span>
                    </div>
                  )}
                </div>
                <PasswordField
                  labelName="Confirm Password"
                  placeholderText="Re-enter your password"
                  name="confirmPassword"
                  control={control}
                  trigger={trigger}
                  isRequired
                />
              </div>
              <div className="mt-2">
                <SubmitButton isPending={isPending} submitTitle="Create Account" />
              </div>
            </form>

            {/* --- GOOGLE INTEGRATION START --- */}
            <div className="flex w-full flex-col gap-4">
              <div className="flex items-center">
                <div className="flex-grow border-t border-neutralPrimary-300/70"></div>
                <span className="mx-4 flex-shrink text-xs font-medium uppercase tracking-[0.08em] text-neutralPrimary-400">
                  Or continue with
                </span>
                <div className="flex-grow border-t border-neutralPrimary-300/70"></div>
              </div>

              <button
                type="button"
                disabled={isSocialSyncing}
                onClick={handleGoogleSignup}
                className="flex h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-neutralPrimary-300 bg-white px-4 text-sm font-semibold text-neutralPrimary-800 shadow-inputField transition-all duration-200 hover:-translate-y-px hover:border-neutralPrimary-400 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-greenPrimary-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:text-[15px]"
              >
                <FcGoogle className="shrink-0 text-xl" />
                <span>
                  {isSocialSyncing ? "Syncing..." : "Sign up with Google"}
                </span>
              </button>
            </div>
            {/* --- GOOGLE INTEGRATION END --- */}

            <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-sm">
              <p className="text-neutralPrimary-600">Already have an account?</p>
              <Link
                href="/login"
                className="font-semibold text-greenPrimary-600 underline-offset-4 transition-colors duration-200 hover:text-greenPrimary-700 hover:underline"
              >
                Login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// "use client";

// import InputField from "@/components/form/InputField";
// import PasswordField from "@/components/form/PasswordField";
// import SubmitButton from "@/components/form/SubmitButton";
// import Link from "next/link";
// import React from "react";
// import { SubmitHandler, useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   CreateAccountFormValues,
//   createAccountSchema,
// } from "@/modules/auth/schemas/create-account.schema";
// import { usePost } from "@/hooks/api/usePost";
// import { useRouter } from "next/navigation";
// import { ResponseSuccessType } from "@/types";

// export default function CreateAccount() {
//   const router = useRouter();
//   const { trigger, control, handleSubmit } = useForm({
//     resolver: zodResolver(createAccountSchema),
//     defaultValues: {
//       firstName: "",
//       lastName: "",
//       userEmail: "",
//       password: "",
//       confirmPassword: "",
//     },
//   });

//   const { mutate: createNewAccount, isPending } = usePost(
//     "/users",
//     (data: ResponseSuccessType) => {
//       if (data.statusCode >= 200 && data.statusCode < 300) {
//         router.push("/");
//       }
//     }
//   );

//   const onSubmit: SubmitHandler<CreateAccountFormValues> = (data) => {
//     // console.log(data);
//     const userData = {
//       firstName: data.firstName,
//       lastName: data.lastName,
//       email: data.userEmail,
//       password: data.password,
//     };
//     // console.log(userData);
//     createNewAccount(userData);
//   };

//   return (
//     <section className="bg-backgroundPrimary">
//       <div className="container mx-auto flex justify-center items-center ">
//         <div className="flex flex-col justify-center items-center gap-6 max-lg:pt-8 pt-20 pb-12 w-fit max-md:px-4">
//           <div className="flex flex-col gap-6 text-neutralPrimary-800">
//             <h1 className="max-md:text-2xl text-5xl font-bold text-center">
//               Create An Account
//             </h1>
//             <p className="text-base font-normal text-center">
//               Join to enjoy faster checkout, order tracking, and personalized
//               recommendations
//             </p>
//           </div>
//           <form
//             onSubmit={handleSubmit(onSubmit)}
//             className="w-full flex flex-col gap-6"
//           >
//             <div className="flex max-md:flex-col items-center justify-center max-md:gap-6 gap-16">
//               <InputField
//                 labelName="First Name"
//                 placeholderText="Enter Your First Name"
//                 name="firstName"
//                 control={control}
//                 trigger={trigger}
//                 isRequired
//               />{" "}
//               <InputField
//                 labelName="Last Name"
//                 placeholderText="Enter Your Last Name"
//                 name="lastName"
//                 control={control}
//                 trigger={trigger}
//                 isRequired
//               />
//             </div>
//             <InputField
//               labelName="Email"
//               placeholderText="Enter Your Email"
//               name="userEmail"
//               control={control}
//               trigger={trigger}
//               isRequired
//             />
//             <PasswordField
//               labelName="Password"
//               placeholderText="Enter Your Password"
//               name="password"
//               control={control}
//               trigger={trigger}
//               isRequired
//             />
//             <PasswordField
//               labelName="Confirm Password"
//               placeholderText="Enter Your Confirm Password"
//               name="confirmPassword"
//               control={control}
//               trigger={trigger}
//               isRequired
//             />
//             <div className="mt-2">
//               <SubmitButton isPending={isPending} submitTitle="Next" />
//             </div>
//           </form>
//           <div className="text-sm flex items-center justify-center gap-3">
//             <p className="font-normal text-neutralPrimary-800">
//               Already have an account?
//             </p>
//             <Link
//               href="/login"
//               className="font-semibold  text-greenPrimary-500"
//             >
//               Login
//             </Link>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }
