"use client";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { usePost } from "@/hooks/api/usePost";
import { ResponseSuccessType } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


interface OTPVerificationProps {
  email?: string;
  verificationType?: "account" | "password-reset";
  onVerificationSuccess?: (otp: string) => void; // Always require OTP parameter
  onBack?: () => void;
}

export default function OTPVerification({
  email = "",
  verificationType = "account",
  onVerificationSuccess,
  onBack
}: OTPVerificationProps) {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const router = useRouter();

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Verify OTP for account creation
  const { mutate: verifyAccount, isPending: isVerifyingAccount } = usePost(
    "/users/verify-user",
    (data: ResponseSuccessType) => {
      if (data.statusCode >= 200 && data.statusCode < 300) {
        router.push("/dashboard");
        // toast.success("Account verified successfully!");
        // onVerificationSuccess?.(); // Account verification doesn't need to pass OTP
      }
    },
    (error) => {
      toast.error(error.message || "Verification failed");
      setOtp(""); // Clear OTP on error
    }
  );

  // Verify OTP for password reset
  const { mutate: verifyOtp, isPending: isVerifyingOtp } = usePost(
    "/users/verify-otp",
    (data: ResponseSuccessType) => {
      if (data.statusCode >= 200 && data.statusCode < 300) {
        toast.success("OTP verified successfully!");
        // For password reset, we need to pass the OTP to parent
        onVerificationSuccess?.(otp);
      }
    },
    (error) => {
      toast.error(error.message || "Verification failed");
      setOtp(""); // Clear OTP on error
    }
  );

  // Resend OTP
  const { mutate: resendOtp, isPending: isResending } = usePost(
    verificationType === "account"
      ? "/users/resend-otp-verify-user"
      : "/users/resend-otp-reset-password",
    (data: ResponseSuccessType) => {
      if (data.statusCode >= 200 && data.statusCode < 300) {
        toast.success("OTP resent successfully!");
        setTimer(300); // Reset timer
        setCanResend(false);
        setOtp(""); // Clear previous OTP
      }
    },
    (error) => {
      toast.error(error.message || "Failed to resend OTP");
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    if (verificationType === "account") {
      // For account verification - just verify
      verifyAccount({
        email,
        otp
      });
      // Don't call onVerificationSuccess here - the backend handles redirect
    } else {
      // For password reset - verify OTP and pass to parent
      verifyOtp({
        email,
        otp
      });
    }
  };

  const handleResendOtp = () => {
    if (!canResend || isResending) return;

    resendOtp({ email });
  };

  const title = verificationType === "account"
    ? "Account Verification"
    : "Password Reset";

  const description = verificationType === "account"
    ? `Enter the 6-digit verification code sent to ${email} to verify your account.`
    : `Enter the 6-digit verification code sent to ${email} to reset your password.`;

  return (
    <section className="bg-backgroundPrimary">
      <div className="container mx-auto flex justify-center items-center">
        <div className="flex flex-col justify-center items-center gap-6 py-12 w-full max-w-md max-md:px-4">
          {onBack && (
            <button
              onClick={onBack}
              className="self-start mb-4 text-greenPrimary-500 hover:text-greenPrimary-600 font-medium"
            >
              ← Back
            </button>
          )}

          <div className="flex flex-col gap-6 text-neutralPrimary-800 text-center">
            <h1 className="max-md:text-2xl text-3xl font-bold">
              {title}
            </h1>
            <p className="text-base font-normal">
              {description}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col items-center justify-center gap-6"
          >
            <div className="flex flex-col items-center gap-4">
              <InputOTP
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                value={otp}
                onChange={(val) => setOtp(val)}
                disabled={isVerifyingAccount || isVerifyingOtp}
              >
                <InputOTPGroup className="flex items-center gap-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="w-14 h-14 border-2 border-neutralPrimary-300 shadow-inputField rounded-lg text-xl font-semibold"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>

              {timer > 0 && (
                <p className="text-sm text-neutralPrimary-600">
                  Code expires in: {formatTime(timer)}
                </p>
              )}
            </div>

            <CustomSubmitButton
              submitTitle={isVerifyingAccount || isVerifyingOtp ? "Verifying..." : "Verify"}
              disabled={otp.length !== 6 || isVerifyingAccount || isVerifyingOtp}
              isPending={isVerifyingAccount || isVerifyingOtp}
            />
          </form>

          <div className="text-sm flex flex-col items-center justify-center gap-3">
            <p className="font-normal text-neutralPrimary-800">
              Haven&apos;t received a code?
            </p>
            <button
              onClick={handleResendOtp}
              disabled={!canResend || isResending}
              className={`font-semibold ${canResend && !isResending
                ? "text-greenPrimary-500 hover:text-greenPrimary-600"
                : "text-neutralPrimary-400 cursor-not-allowed"
                }`}
            >
              {isResending ? "Resending..." : "Resend OTP"}
            </button>
          </div>

          {verificationType === "account" && (
            <div className="text-sm flex items-center justify-center gap-3 mt-4">
              <p className="font-normal text-neutralPrimary-800">
                Already have an account?
              </p>
              <Link
                href="/login"
                className="font-semibold text-greenPrimary-500 hover:text-greenPrimary-600"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Custom SubmitButton that accepts disabled prop
interface CustomSubmitButtonProps {
  submitTitle: string;
  disabled: boolean;
  isPending?: boolean;
  className?: string;
}

const CustomSubmitButton: React.FC<CustomSubmitButtonProps> = ({
  submitTitle,
  disabled,
  isPending,
  className = "",
}) => {
  return (
    <div className="w-full">
      <input
        type="submit"
        value={isPending ? "Processing..." : submitTitle}
        className={`w-full bg-greenPrimary-500 hover:bg-greenPrimary-600 rounded-md text-neutralPrimary-50 font-semibold text-base py-2.5 px-6 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        disabled={disabled}
      />
    </div>
  );
};


// "use client";

// import SubmitButton from "@/components/form/SubmitButton";
// import {
//   InputOTP,
//   InputOTPGroup,
//   InputOTPSlot,
// } from "@/components/ui/input-otp";
// import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
// import Link from "next/link";
// import React, { useState } from "react";

// export default function OTPVerification() {
//   const [otp, setOtp] = useState("");

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log("Submitted OTP:", otp);
//   };
//   return (
//     <section className="bg-backgroundPrimary ">
//       <div className="container mx-auto flex justify-center items-center ">
//         <div className="flex flex-col justify-center items-center gap-6 py-12 w-fit max-md:px-4">
//           <div className="flex flex-col gap-6 text-neutralPrimary-800">
//             <h1 className="max-md:text-2xl text-5xl font-bold text-center">
//               OTP Verification
//             </h1>
//             <p className="text-base font-normal text-center">
//               Your One Time Password (OTP) has beed sent via SMS to your
//               registered mobile number.
//             </p>
//           </div>
//           <form
//             onSubmit={handleSubmit}
//             className="w-full flex flex-col items-center justify-center gap-6"
//           >
//             <InputOTP
//               maxLength={6}
//               pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
//               value={otp}
//               onChange={(val) => setOtp(val)}
//             >
//               <InputOTPGroup className="flex items-center gap-3">
//                 <InputOTPSlot
//                   index={0}
//                   className="border border-neutralPrimary-300 shadow-inputField rounded"
//                 />
//                 <InputOTPSlot index={1} />
//                 <InputOTPSlot index={2} />
//                 <InputOTPSlot index={3} />
//                 <InputOTPSlot index={4} />
//                 <InputOTPSlot index={5} />
//               </InputOTPGroup>
//             </InputOTP>
//             <SubmitButton submitTitle="Verify" />
//           </form>
//           <div className="text-sm flex items-center justify-center gap-3">
//             <p className="font-normal text-neutralPrimary-800">
//               Haven&apos;t received a code?
//             </p>
//             <Link
//               href="/create-account"
//               className="font-semibold  text-greenPrimary-500"
//             >
//               Resend
//             </Link>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }
