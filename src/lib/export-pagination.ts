export const getScrollPageOffsets = (
    scrollHeight: number,
    clientHeight: number
): number[] => {
    if (scrollHeight <= 0 || clientHeight <= 0) {
        return [0];
    }

    const maxScroll = Math.max(0, scrollHeight - clientHeight);
    if (maxScroll === 0) {
        return [0];
    }

    const offsets: number[] = [];
    for (let offset = 0; offset < maxScroll; offset += clientHeight) {
        offsets.push(offset);
    }

    if (offsets[offsets.length - 1] !== maxScroll) {
        offsets.push(maxScroll);
    }

    return offsets;
};

export const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
    const response = await fetch(dataUrl);
    return response.blob();
};

export const withTranslatedScrollPage = async <T>(
    scrollContainer: HTMLElement,
    offset: number,
    callback: () => Promise<T>
): Promise<T> => {
    const originalScrollTop = scrollContainer.scrollTop;
    const originalContainerStyles = {
        overflow: scrollContainer.style.overflow,
        overflowY: scrollContainer.style.overflowY,
        scrollBehavior: scrollContainer.style.scrollBehavior,
    };
    const childStyleSnapshots = Array.from(scrollContainer.children).map((child) => {
        const element = child as HTMLElement;
        return {
            element,
            transform: element.style.transform,
            transition: element.style.transition,
            willChange: element.style.willChange,
        };
    });

    try {
        scrollContainer.scrollTop = 0;
        scrollContainer.style.overflow = "hidden";
        scrollContainer.style.overflowY = "hidden";
        scrollContainer.style.scrollBehavior = "auto";

        childStyleSnapshots.forEach(({ element, transform }) => {
            element.style.transform = `${transform ? `${transform} ` : ""}translateY(-${offset}px)`;
            element.style.transition = "none";
            element.style.willChange = "transform";
        });

        return await callback();
    } finally {
        scrollContainer.style.overflow = originalContainerStyles.overflow;
        scrollContainer.style.overflowY = originalContainerStyles.overflowY;
        scrollContainer.style.scrollBehavior = originalContainerStyles.scrollBehavior;

        childStyleSnapshots.forEach(({ element, transform, transition, willChange }) => {
            element.style.transform = transform;
            element.style.transition = transition;
            element.style.willChange = willChange;
        });

        scrollContainer.scrollTop = originalScrollTop;
    }
};
