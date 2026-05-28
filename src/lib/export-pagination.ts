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

export interface MessageExportCropBounds {
    top: number;
    height: number;
    width: number;
}

export const getMessageExportCropBounds = (
    scrollContainer: HTMLElement,
    messageElements: HTMLElement[],
    padding: number
): MessageExportCropBounds | null => {
    if (messageElements.length === 0) {
        return null;
    }

    const firstMessage = messageElements[0];
    const lastMessage = messageElements[messageElements.length - 1];
    const containerRect = scrollContainer.getBoundingClientRect();
    const firstRect = firstMessage.getBoundingClientRect();
    const lastRect = lastMessage.getBoundingClientRect();
    const contentHeight = Math.max(scrollContainer.scrollHeight, scrollContainer.clientHeight);
    const top = Math.max(
        0,
        Math.floor(firstRect.top - containerRect.top + scrollContainer.scrollTop - padding)
    );
    const bottom = Math.min(
        contentHeight,
        Math.ceil(lastRect.bottom - containerRect.top + scrollContainer.scrollTop + padding)
    );

    return {
        top,
        height: Math.max(1, bottom - top),
        width: scrollContainer.clientWidth
    };
};

export const withExpandedScrollContainer = async <T>(
    scrollContainer: HTMLElement,
    callback: () => Promise<T>
): Promise<T> => {
    const originalScrollTop = scrollContainer.scrollTop;
    const originalStyles = {
        height: scrollContainer.style.height,
        minHeight: scrollContainer.style.minHeight,
        maxHeight: scrollContainer.style.maxHeight,
        overflow: scrollContainer.style.overflow,
        overflowY: scrollContainer.style.overflowY,
        scrollBehavior: scrollContainer.style.scrollBehavior,
    };

    try {
        scrollContainer.scrollTop = 0;
        scrollContainer.style.height = `${scrollContainer.scrollHeight}px`;
        scrollContainer.style.minHeight = `${scrollContainer.scrollHeight}px`;
        scrollContainer.style.maxHeight = "none";
        scrollContainer.style.overflow = "visible";
        scrollContainer.style.overflowY = "visible";
        scrollContainer.style.scrollBehavior = "auto";

        return await callback();
    } finally {
        scrollContainer.style.height = originalStyles.height;
        scrollContainer.style.minHeight = originalStyles.minHeight;
        scrollContainer.style.maxHeight = originalStyles.maxHeight;
        scrollContainer.style.overflow = originalStyles.overflow;
        scrollContainer.style.overflowY = originalStyles.overflowY;
        scrollContainer.style.scrollBehavior = originalStyles.scrollBehavior;
        scrollContainer.scrollTop = originalScrollTop;
    }
};

export const withHiddenMessageExportElements = async <T>(
    root: HTMLElement,
    callback: () => Promise<T>
): Promise<T> => {
    const elementsToHide = Array.from(
        root.querySelectorAll<HTMLElement>("[data-message-export-exclude]")
    );
    const originalDisplays = elementsToHide.map(element => ({
        element,
        display: element.style.display,
    }));

    try {
        elementsToHide.forEach(element => {
            element.style.display = "none";
        });

        return await callback();
    } finally {
        originalDisplays.forEach(({ element, display }) => {
            element.style.display = display;
        });
    }
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
