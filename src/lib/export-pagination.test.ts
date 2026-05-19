import { describe, expect, it } from "vitest";
import { getScrollPageOffsets, withTranslatedScrollPage } from "./export-pagination";

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
});
