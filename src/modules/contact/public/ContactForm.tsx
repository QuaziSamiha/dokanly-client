"use client";

import InputField from "@/components/form/InputField";
import PhoneInputField from "@/components/form/PhoneInputField";
import SubmitButton from "@/components/form/SubmitButton";
import TextAreaField from "@/components/form/TextAreaField";
import { usePost } from "@/hooks/api/usePost";
import { MessageFormType, messageSchema } from "@/modules/contact/schemas/contact.schema";
import { ResponseSuccessType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";

export default function ContactForm() {
  const { trigger, control, handleSubmit, reset } = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      message: "",
    },
  });

  const { mutate: sendMessage, isPending } = usePost(
    "/contact-messages/create-message",
    (data: ResponseSuccessType) => {
      if (data.statusCode >= 200 && data.statusCode < 300) {
        reset();
      }
    }
  );

  const onSubmit: SubmitHandler<MessageFormType> = (data) => {
    // console.log(data);
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      message: data.message,
    };
    // console.log(payload);
    sendMessage(payload);
  };
  return (
    <section className="w-full h-full">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex h-full w-full flex-col gap-5 rounded-2xl border border-neutralPrimary-200 bg-white p-5 shadow-sm sm:p-8"
      >
        <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2 md:gap-6">
          <InputField
            labelName="First Name"
            placeholderText="Enter Your First Name"
            name="firstName"
            control={control}
            trigger={trigger}
            isRequired
          />
          <InputField
            labelName="Last Name"
            placeholderText="Enter Your Last Name"
            name="lastName"
            control={control}
            trigger={trigger}
          />
        </div>
        <PhoneInputField name="phone" control={control} />
        {/* pb-4 keeps the absolutely positioned error clear of the button */}
        <div className="pb-4">
          <TextAreaField
            labelName="Message"
            placeholderText="Enter Your Message"
            name="message"
            control={control}
            trigger={trigger}
            rowNo={6}
            isRequired
            textareaClassName="field-sizing-fixed h-40 overflow-y-auto scrollbar-brand-field sm:h-44"
          />
        </div>

        <SubmitButton submitTitle="Send Message" isPending={isPending} />
      </form>
    </section>
  );
}
