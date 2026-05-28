import { describe, expect, it } from "vitest";
import {
    getMessageExportCropBounds,
    getScrollPageOffsets,
    withHiddenMessageExportElements,
    withExpandedScrollContainer,
    withTranslatedScrollPage
} from "./export-pagination";

describe("export pagination", () => {
    it("returns one page when content does not overflow", () => {
        expect(getScrollPageOffsets(500, 700)).toEqual([0]);
        expect(getScrollPageOffsets(700, 700)).toEqual([0]);
    });

    it("returns the first and final page for an exact two-screen overflow", () => {
        expect(getScrollPageOffsets(1400, 700)).toEqual([0, 700]);
    });

    it("caps the last page at the maximum scroll offset", () => {
        expect(getScrollPageOffsets(1800, 700)).toEqual([0, 700, 1100]);
    });

    it("handles invalid dimensions as a single capture", () => {
        expect(getScrollPageOffsets(0, 700)).toEqual([0]);
        expect(getScrollPageOffsets(700, 0)).toEqual([0]);
    });

    it("translates scroll children for capture and restores styles afterward", async () => {
        const scrollContainer = document.createElement("div");
        const child = document.createElement("div");
        scrollContainer.appendChild(child);
        scrollContainer.style.overflowY = "auto";
        scrollContainer.scrollTop = 123;
        child.style.transform = "scale(1)";

        await withTranslatedScrollPage(scrollContainer, 456, async () => {
            expect(scrollContainer.scrollTop).toBe(0);
            expect(scrollContainer.style.overflow).toBe("hidden");
            expect(scrollContainer.style.overflowY).toBe("hidden");
            expect(child.style.transform).toBe("scale(1) translateY(-456px)");
            expect(child.style.transition).toBe("none");
        });

        expect(scrollContainer.scrollTop).toBe(123);
        expect(scrollContainer.style.overflow).toBe("");
        expect(scrollContainer.style.overflowY).toBe("auto");
        expect(child.style.transform).toBe("scale(1)");
        expect(child.style.transition).toBe("");
    });

    it("restores styles when capture fails", async () => {
        const scrollContainer = document.createElement("div");
        const child = document.createElement("div");
        scrollContainer.appendChild(child);
        scrollContainer.scrollTop = 22;

        await expect(
            withTranslatedScrollPage(scrollContainer, 100, async () => {
                throw new Error("capture failed");
            })
        ).rejects.toThrow("capture failed");

        expect(scrollContainer.scrollTop).toBe(22);
        expect(scrollContainer.style.overflow).toBe("");
        expect(child.style.transform).toBe("");
    });

    it("calculates a messages-only crop from the first message to the last with padding", () => {
        const scrollContainer = document.createElement("div");
        Object.defineProperty(scrollContainer, "clientWidth", { value: 340 });
        Object.defineProperty(scrollContainer, "clientHeight", { value: 500 });
        Object.defineProperty(scrollContainer, "scrollHeight", { value: 900 });
        scrollContainer.scrollTop = 40;
        scrollContainer.getBoundingClientRect = () => ({
            top: 100,
            bottom: 600,
            left: 0,
            right: 340,
            width: 340,
            height: 500,
            x: 0,
            y: 100,
            toJSON: () => ({})
        });

        const firstMessage = document.createElement("div");
        firstMessage.getBoundingClientRect = () => ({
            top: 160,
            bottom: 210,
            left: 12,
            right: 220,
            width: 208,
            height: 50,
            x: 12,
            y: 160,
            toJSON: () => ({})
        });

        const lastMessage = document.createElement("div");
        lastMessage.getBoundingClientRect = () => ({
            top: 380,
            bottom: 450,
            left: 80,
            right: 328,
            width: 248,
            height: 70,
            x: 80,
            y: 380,
            toJSON: () => ({})
        });

        expect(getMessageExportCropBounds(scrollContainer, [firstMessage, lastMessage], 16)).toEqual({
            top: 84,
            height: 322,
            width: 340
        });
    });

    it("clamps a messages-only crop to the available scroll content", () => {
        const scrollContainer = document.createElement("div");
        Object.defineProperty(scrollContainer, "clientWidth", { value: 340 });
        Object.defineProperty(scrollContainer, "clientHeight", { value: 500 });
        Object.defineProperty(scrollContainer, "scrollHeight", { value: 520 });
        scrollContainer.getBoundingClientRect = () => ({
            top: 100,
            bottom: 600,
            left: 0,
            right: 340,
            width: 340,
            height: 500,
            x: 0,
            y: 100,
            toJSON: () => ({})
        });

        const firstMessage = document.createElement("div");
        firstMessage.getBoundingClientRect = () => ({
            top: 104,
            bottom: 160,
            left: 12,
            right: 220,
            width: 208,
            height: 56,
            x: 12,
            y: 104,
            toJSON: () => ({})
        });

        const lastMessage = document.createElement("div");
        lastMessage.getBoundingClientRect = () => ({
            top: 560,
            bottom: 618,
            left: 80,
            right: 328,
            width: 248,
            height: 58,
            x: 80,
            y: 560,
            toJSON: () => ({})
        });

        expect(getMessageExportCropBounds(scrollContainer, [firstMessage, lastMessage], 24)).toEqual({
            top: 0,
            height: 520,
            width: 340
        });
    });

    it("returns null when there are no messages to crop", () => {
        const scrollContainer = document.createElement("div");

        expect(getMessageExportCropBounds(scrollContainer, [], 16)).toBeNull();
    });

    it("expands a scroll container for full-height capture and restores styles afterward", async () => {
        const scrollContainer = document.createElement("div");
        Object.defineProperty(scrollContainer, "scrollHeight", { value: 820 });
        scrollContainer.style.height = "500px";
        scrollContainer.style.maxHeight = "500px";
        scrollContainer.style.overflowY = "auto";
        scrollContainer.scrollTop = 100;

        await withExpandedScrollContainer(scrollContainer, async () => {
            expect(scrollContainer.scrollTop).toBe(0);
            expect(scrollContainer.style.height).toBe("820px");
            expect(scrollContainer.style.maxHeight).toBe("none");
            expect(scrollContainer.style.overflow).toBe("visible");
            expect(scrollContainer.style.overflowY).toBe("visible");
        });

        expect(scrollContainer.scrollTop).toBe(100);
        expect(scrollContainer.style.height).toBe("500px");
        expect(scrollContainer.style.maxHeight).toBe("500px");
        expect(scrollContainer.style.overflow).toBe("");
        expect(scrollContainer.style.overflowY).toBe("auto");
    });

    it("hides message export exclusions during capture and restores display styles", async () => {
        const scrollContainer = document.createElement("div");
        const deliveredStatus = document.createElement("span");
        const readReceipt = document.createElement("div");

        deliveredStatus.dataset.messageExportExclude = "";
        readReceipt.dataset.messageExportExclude = "";
        readReceipt.style.display = "inline-flex";

        scrollContainer.append(deliveredStatus, readReceipt);

        const result = await withHiddenMessageExportElements(scrollContainer, async () => {
            expect(deliveredStatus.style.display).toBe("none");
            expect(readReceipt.style.display).toBe("none");

            return "captured";
        });

        expect(result).toBe("captured");
        expect(deliveredStatus.style.display).toBe("");
        expect(readReceipt.style.display).toBe("inline-flex");
    });
});
