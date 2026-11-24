"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Lock } from "lucide-react";
import InputField from "@/components/form/InputField";
import PhoneInputField from "@/components/form/PhoneInputField";
import TextAreaField from "@/components/form/TextAreaField";
import { useApplyToJob } from "../../hooks/useCareerApplication";
import {
  ApplyJobForm,
  applyJobSchema,
} from "../../schemas/career-application.schema";
import { IApplicationReceipt } from "../../types/career.types";
import ResumeUploadField from "./ResumeUploadField";

interface IProps {
  position: string;
  jobId: number;
}

const EMPTY_FORM: ApplyJobForm = {
  name: "",
  phone: "",
  address: "",
  email: "",
  yearOfExperience: undefined,
  skills: "",
  resumeFile: undefined,
};

export default function CareerForm({ position, jobId }: IProps) {
  const [receipt, setReceipt] = useState<IApplicationReceipt | null>(null);

  const { control, trigger, handleSubmit, reset } = useForm<ApplyJobForm>({
    resolver: zodResolver(applyJobSchema),
    mode: "onTouched",
    defaultValues: EMPTY_FORM,
  });

  const { applyJob, isApplying } = useApplyToJob((data) => {
    reset(EMPTY_FORM);
    setReceipt(data);
    document
      .getElementById("apply")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  const onSubmit = (data: ApplyJobForm) => {
    const formData = new FormData();

    // Optional fields are left out when blank, so the server stores null
    // rather than an empty string or a 0 years-of-experience.
    const appendIfPresent = (key: string, value?: string | number | null) => {
      if (value === undefined || value === null) return;
      const text = String(value).trim();
      if (text) formData.append(key, text);
    };

    formData.append("jobId", String(jobId));
    formData.append("name", data.name.trim());
    formData.append("phoneNumber", data.phone.trim());
    formData.append("email", data.email.trim());
    appendIfPresent("address", data.address);
    appendIfPresent("yearsOfExperience", data.yearOfExperience);
    appendIfPresent("skills", data.skills);
    if (data.resumeFile instanceof File) {
      formData.append("resumeFile", data.resumeFile);
    }

    applyJob(formData);
  };

  return (
    <section
      id="apply"
      aria-labelledby="apply-heading"
      className="scroll-mt-28 rounded-2xl border border-neutralPrimary-300/70 bg-white p-5 shadow-neutral02 sm:p-8"
    >
      {receipt ? (
        <div className="flex flex-col items-center gap-4 py-6 text-center" role="status">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success-100 text-success-600">
            <CheckCircle2 className="h-9 w-9" aria-hidden />
          </span>
          <h2 id="apply-heading" className="text-2xl font-bold text-neutralPrimary-800">
            Application sent!
          </h2>
          <p className="max-w-md text-neutralPrimary-600">
            Thank you, {receipt.name}. We&apos;ve received your application for{" "}
            <span className="font-semibold text-neutralPrimary-800">
              {receipt.position}
            </span>
            . If you are shortlisted, we will contact you at{" "}
            <span className="font-semibold text-neutralPrimary-800">{receipt.email}</span>.
          </p>
          <p className="rounded-lg bg-neutralPrimary-100 px-3 py-2 text-xs text-neutralPrimary-600">
            Reference: <span className="font-mono">{receipt.sid.slice(0, 8).toUpperCase()}</span>
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/career"
              className="inline-flex h-11 items-center justify-center rounded-full bg-greenPrimary-500 px-6 font-semibold text-white hover:bg-greenPrimary-600"
            >
              See other openings
            </Link>
            <Link
              href="/product"
              className="inline-flex h-11 items-center justify-center rounded-full border border-neutralPrimary-300 px-6 font-semibold text-neutralPrimary-700 hover:border-greenPrimary-500 hover:text-greenPrimary-600"
            >
              Explore our products
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-1 border-b border-neutralPrimary-100 pb-5">
            <h2 id="apply-heading" className="text-2xl font-bold text-neutralPrimary-800">
              Apply for this job
            </h2>
            <p className="text-sm text-neutralPrimary-600">
              Applying for{" "}
              <span className="font-semibold text-neutralPrimary-800">{position}</span>.
              Fields marked <span className="text-destructive-500">*</span> are required.
            </p>
          </div>

          <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-8"
            aria-busy={isApplying}
          >
            <fieldset disabled={isApplying} className="flex flex-col gap-5">
              <legend className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutralPrimary-500">
                Your details
              </legend>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <InputField
                  labelName="Full name"
                  placeholderText="e.g. Samiha Rahman"
                  name="name"
                  control={control}
                  trigger={trigger}
                  isRequired
                  inlineError
                />
                <InputField
                  labelName="Email"
                  inputType="email"
                  placeholderText="you@example.com"
                  name="email"
                  control={control}
                  trigger={trigger}
                  isRequired
                  inlineError
                />
                <PhoneInputField
                  name="phone"
                  control={control}
                  isRequired
                  inlineError
                />
                <InputField
                  labelName="Address"
                  placeholderText="Area, city"
                  name="address"
                  control={control}
                  trigger={trigger}
                  inlineError
                />
              </div>
            </fieldset>

            <fieldset disabled={isApplying} className="flex flex-col gap-5">
              <legend className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutralPrimary-500">
                Experience
              </legend>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,220px)_1fr]">
                <InputField
                  labelName="Years of experience"
                  inputType="number"
                  placeholderText="e.g. 2.5"
                  name="yearOfExperience"
                  control={control}
                  trigger={trigger}
                  inlineError
                />
                <TextAreaField
                  labelName="Key skills"
                  placeholderText="e.g. Meta Ads, SEO, Customer service"
                  name="skills"
                  control={control}
                  trigger={trigger}
                  rowNo={3}
                />
              </div>
              <ResumeUploadField name="resumeFile" control={control} />
            </fieldset>

            <div className="flex flex-col-reverse items-center gap-4 border-t border-neutralPrimary-100 pt-6 sm:flex-row sm:justify-between">
              <p className="flex items-center gap-1.5 text-xs text-neutralPrimary-500">
                <Lock className="h-3.5 w-3.5" aria-hidden />
                Your details are only used for hiring at Natura Care.
              </p>
              <button
                type="submit"
                disabled={isApplying}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-greenPrimary-500 px-8 text-base font-semibold text-white shadow-sm transition-all hover:bg-greenPrimary-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-greenPrimary-500/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto cursor-pointer"
              >
                {isApplying && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                {isApplying ? "Sending application…" : "Submit application"}
              </button>
            </div>
          </form>
        </>
      )}
    </section>
  );
}
