"use client";

import React, { useState } from "react";
import { usePost } from "@/hooks/api/usePost";
import { CategoryCreateResponse } from "@/types";
import OTPVerification from "../otp-verification/OTPVerification";
import { toast } from "sonner";
import ResetPasswordForm from "./ResetPasswordForm";

interface ForgotPasswordModalProps {
  email: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ForgotPasswordModal({
  email,
  onClose,
  onSuccess,
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState<"initiate" | "otp" | "reset-password">(
    "initiate",
  );
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [tempEmail, setTempEmail] = useState(email);
  const [verifiedOtp, setVerifiedOtp] = useState("");

  const { mutate: initiatePasswordReset, isPending: isInitiating } = usePost(
    "/users/resend-otp-reset-password",
    (data: CategoryCreateResponse) => {
      if (data.statusCode >= 200 && data.statusCode < 300) {
        setStep("otp");
      }
    },
  );

  const handleInitiateReset = () => {
    if (!tempEmail.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    initiatePasswordReset({ email: tempEmail });
  };

  const handleOtpVerificationSuccess = (otp: string) => {
    setVerifiedOtp(otp);
    setIsOtpVerified(true);
    setStep("reset-password");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
        >
          ✕
        </button>

        {step === "initiate" && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Reset Password
            </h2>
            <p className="text-gray-600 mb-6">
              Enter your email address to receive a verification code
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-greenPrimary-500 focus:border-transparent"
                  placeholder="Enter your email"
                  disabled={isInitiating}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={isInitiating}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInitiateReset}
                  disabled={isInitiating || !tempEmail.trim()}
                  className="flex-1 px-4 py-2 bg-greenPrimary-500 text-white rounded-lg hover:bg-greenPrimary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isInitiating ? "Sending..." : "Send Code"}
                </button>
              </div>
            </div>
          </>
        )}

        {step === "otp" && (
          <OTPVerification
            email={tempEmail}
            verificationType="password-reset"
            onVerificationSuccess={handleOtpVerificationSuccess}
            onBack={() => setStep("initiate")}
          />
        )}

        {step === "reset-password" && isOtpVerified && (
          <ResetPasswordForm
            email={tempEmail}
            otp={verifiedOtp}
            onSuccess={onSuccess}
            onCancel={onClose}
          />
        )}
      </div>
    </div>
  );
}
