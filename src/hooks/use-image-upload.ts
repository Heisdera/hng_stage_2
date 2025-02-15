"use client";

import { useTicketForm } from "@/store/ticket-form-store";
import { MAX_IMAGE_FILE_SIZE } from "@/utils/constants";
import { useCallback, useRef, useState } from "react";
import { z } from "zod";

interface ImageUploaderProps {
  previewUrl: string | null;
  onImageChange: (base64String: string | null) => void;
}

const imageSchema = z.object({
  image: z
    .instanceof(File, { message: "Please upload an image" })
    .refine((file) => file.size <= MAX_IMAGE_FILE_SIZE, {
      message: "File size exceeds 3MB",
    }),
});

export function useImageUpload({
  onImageChange,
  previewUrl,
}: ImageUploaderProps) {
  const { setFileName, localImageUploadError, setLocalImageUploadError } =
    useTicketForm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleThumbnailClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const validationResult = imageSchema.safeParse({ image: file });

      if (!validationResult.success) {
        setLocalImageUploadError(validationResult.error.errors[0].message);
        return;
      }

      setFileName(file.name);
      setLocalImageUploadError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onImageChange(base64String);
      };
      reader.readAsDataURL(file);
    },
    [onImageChange, setFileName, setLocalImageUploadError]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);

      const file = event.dataTransfer.files?.[0];
      if (!file) return;

      const validationResult = imageSchema.safeParse({ image: file });

      if (!validationResult.success) {
        setLocalImageUploadError(validationResult.error.errors[0].message);
        return;
      }

      setFileName(file.name);
      setLocalImageUploadError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onImageChange(base64String);
      };
      reader.readAsDataURL(file);
    },
    [onImageChange, setFileName, setLocalImageUploadError]
  );

  const handleRemove = useCallback(() => {
    onImageChange("");
    setFileName("");
  }, [onImageChange, setFileName]);

  return {
    previewUrl,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    localImageUploadError,
    setLocalImageUploadError,
  };
}
