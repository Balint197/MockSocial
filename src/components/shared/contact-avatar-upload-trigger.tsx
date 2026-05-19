"use client";

import React from "react";
import { useChatStore } from "@/store/useChatStore";
import { cn } from "@/lib/utils";

interface ContactAvatarUploadTriggerProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  "aria-label"?: string;
}

export const ContactAvatarUploadTrigger = ({
  children,
  className,
  title = "Change profile picture",
  "aria-label": ariaLabel = "Change profile picture",
}: ContactAvatarUploadTriggerProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const updateContact = useChatStore((state) => state.updateContact);

  const openPicker = () => {
    inputRef.current?.click();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPicker();
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        updateContact({ avatar: readerEvent.target?.result as string });
      };
      reader.readAsDataURL(file);
    }

    event.target.value = "";
  };

  return (
    <>
      <span
        role="button"
        tabIndex={0}
        className={cn("inline-block cursor-pointer", className)}
        title={title}
        aria-label={ariaLabel}
        onClick={openPicker}
        onKeyDown={handleKeyDown}
      >
        {children}
      </span>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleChange}
      />
    </>
  );
};
