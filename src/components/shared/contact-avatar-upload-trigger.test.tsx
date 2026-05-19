import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ContactAvatarUploadTrigger } from "./contact-avatar-upload-trigger";
import { useChatStore } from "@/store/useChatStore";

class MockFileReader {
  public onload: ((event: ProgressEvent<FileReader>) => void) | null = null;

  readAsDataURL() {
    this.onload?.({
      target: { result: "data:image/png;base64,avatar" },
    } as ProgressEvent<FileReader>);
  }
}

describe("ContactAvatarUploadTrigger", () => {
  beforeEach(() => {
    useChatStore.getState().resetState();
    vi.stubGlobal("FileReader", MockFileReader);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("opens the hidden file input when clicked", () => {
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(() => {});

    render(
      <ContactAvatarUploadTrigger>
        <span>Avatar</span>
      </ContactAvatarUploadTrigger>
    );

    fireEvent.click(screen.getByRole("button", { name: "Change profile picture" }));

    expect(clickSpy).toHaveBeenCalledOnce();
    clickSpy.mockRestore();
  });

  it("stores the selected image as the contact avatar", () => {
    const { container } = render(
      <ContactAvatarUploadTrigger>
        <span>Avatar</span>
      </ContactAvatarUploadTrigger>
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, {
      target: {
        files: [new File(["avatar"], "avatar.png", { type: "image/png" })],
      },
    });

    expect(useChatStore.getState().contact.avatar).toBe("data:image/png;base64,avatar");
  });
});
