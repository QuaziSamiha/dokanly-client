"use client";

import ModalHeader from "@/components/primitives/modal/ModalHeader";
import { GalleryHorizontalEnd } from "lucide-react";

import InputField from "@/components/form/InputField";
import SingleMediaInput from "@/components/form/file-upload/SingleMediaInput";
import { useFormPost } from "@/hooks/api/useFormPost";
import {
  HeroSliderFormData,
  heroSliderSchema,
} from "@/modules/home/schemas/hero-slider.schema";
import { IModal } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import {
  FormActions,
  FormDivider,
  FormSection,
  HOME_FORM_WRAPPER,
} from "../home-form.parts";

export default function AddHeroSlider({ setOpen, refetch }: IModal) {
  const methods = useForm<HeroSliderFormData>({
    resolver: zodResolver(heroSliderSchema),
    defaultValues: {
      media: undefined,
      redirectUrl: "",
    },
  });

  const { control, trigger, handleSubmit, reset } = methods;

  const { mutate: addHero, isPending } = useFormPost(
    "/home-content/create-home-content",
    (data: unknown) => {
      const response = data as { statusCode: number };
      if (response.statusCode >= 200 && response.statusCode < 300) {
        reset();
        refetch?.();
        setOpen?.(false);
      }
    },
  );

  const onSubmit = (data: HeroSliderFormData) => {
    const formData = new FormData();
    formData.append("type", "HERO_SLIDER");
    formData.append("imageFile", data.media);
    if (data.redirectUrl && data.redirectUrl.trim() !== "") {
      formData.append("redirectUrl", data.redirectUrl);
    }
    addHero(formData as unknown as Record<string, unknown>);
  };

  return (
    <section className={HOME_FORM_WRAPPER}>
      <ModalHeader
        icon={GalleryHorizontalEnd}
        eyebrow="Hero Slider"
        title="Add Hero Slide"
        description="Upload a wide banner for the home page carousel. Add a link to make it clickable."
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-start gap-6"
      >
        {/* ============ LINK ============ */}
        <FormSection
          title="Link"
          description="Where a click on the slide leads. Leave empty if the slide shouldn't be clickable. New slides are added at the end of the carousel."
        >
          <InputField
            labelName="Link"
            name="redirectUrl"
            placeholderText="https://naturacarebd.com/shop"
            control={control}
            trigger={trigger}
          />
        </FormSection>

        <FormDivider />

        {/* ============ IMAGE (LAST) ============ */}
        <FormSection
          title="Slide image"
          description="A wide banner works best (about 1920 × 600 px). JPEG, PNG or WebP, up to 5 MB."
        >
          <SingleMediaInput
            name="media"
            label="Banner"
            control={control}
            maxFileSize={5 * 1024 * 1024} // 5MB
            acceptedFileTypes={["image/*"]} // Only images
            isRequired
          />
        </FormSection>

        {/* ============ ACTIONS (PINNED) ============ */}
        <FormActions
          onCancel={() => setOpen?.(false)}
          submitTitle="Add slide"
          isPending={isPending}
        />
      </form>
    </section>
  );
}
