"use client";

import ModalHeader from "@/components/primitives/modal/ModalHeader";
import { Newspaper } from "lucide-react";

import InputField from "@/components/form/InputField";
import SingleMediaInput from "@/components/form/file-upload/SingleMediaInput";
import { TextEditor } from "@/components/form/TextEditor";
import { useFormPost } from "@/hooks/api/useFormPost";
import {
  ProductArticleFormData,
  productArticleSchema,
} from "@/modules/home/schemas/product-article.schema";
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

export default function AddProductArticle({ setOpen, refetch }: IModal) {
  const methods = useForm<ProductArticleFormData>({
    resolver: zodResolver(productArticleSchema),
    defaultValues: {
      title: "",
      description: "",
      media: undefined,
    },
  });

  const { control, trigger, handleSubmit, reset } = methods;

  const { mutate: addArticle, isPending } = useFormPost(
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

  const onSubmit = (data: ProductArticleFormData) => {
    const formData = new FormData();
    formData.append("type", "PRODUCT_ARTICLE");
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("imageFile", data.media);
    addArticle(formData as unknown as Record<string, unknown>);
  };

  return (
    <section className={HOME_FORM_WRAPPER}>
      <ModalHeader
        icon={Newspaper}
        eyebrow="Product Articles"
        title="Add Product Article"
        description="An image with a heading and short story that introduces a product."
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-start gap-6"
      >
        {/* ============ CONTENT ============ */}
        <FormSection
          title="Content"
          description="The heading and story customers read on the home page. New articles are added at the end."
        >
          <InputField
            labelName="Title"
            name="title"
            placeholderText="e.g. Onion Hair Oil for stronger roots"
            control={control}
            trigger={trigger}
            isRequired
          />
          <TextEditor
            labelName="Description"
            placeholderText="Tell the product's story in a few short lines..."
            name="description"
            control={control}
            trigger={trigger}
            isRequired
          />
        </FormSection>

        <FormDivider />

        {/* ============ IMAGE (LAST) ============ */}
        <FormSection
          title="Image"
          description="Shown beside the article. JPEG, PNG or WebP, up to 5 MB."
        >
          <SingleMediaInput
            name="media"
            label="Article image"
            control={control}
            maxFileSize={5 * 1024 * 1024} // 5MB
            acceptedFileTypes={["image/*"]} // Only images
            isRequired
          />
        </FormSection>

        {/* ============ ACTIONS (PINNED) ============ */}
        <FormActions
          onCancel={() => setOpen?.(false)}
          submitTitle="Add article"
          isPending={isPending}
        />
      </form>
    </section>
  );
}
