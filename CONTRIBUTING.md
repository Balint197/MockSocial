# Contributing to MockSocial

Thank you for your interest in contributing to MockSocial! We want to make it as easy as possible for you to join the mission of building the ultimate social media mockup generator.

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation
1.  **Clone the repository**
    ```bash
    git clone https://github.com/ashishguleria04/MockSocial.git
    cd MockSocial
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up environment variables** (optional, for AI features)
    ```bash
    cp .env.local.example .env.local
    ```
    Add your [Gemini API key](https://aistudio.google.com/apikey) to enable the AI Conversation Generator.

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Visit `http://localhost:3000` to view the application.

## Project Structure

MockSocial uses **Next.js 15 (App Router)** and **Zustand** for state management.

- `src/app`: Page routes.
- `src/components/canvas`: The main phone preview area (`ChatCanvas.tsx` renders the phone frame and dynamically scales it via `ResizeObserver`).
- `src/components/skins`: Where all the platform-specific UIs live (e.g., `WhatsAppSkin.tsx`).
- `src/components/sidebar`: The configuration panel. On mobile (`< lg`) the Sidebar renders as a **Framer Motion bottom sheet** triggered by `isMobileSheetOpen` in the store.
- `src/store`: Global state management.
- `src/lib`: core utilities including `url-state.ts` (sharing engine) and `autofill-utils.ts` (random data generator).
- `src/app/api/generate-chat`: AI conversation generator API route (Google Gemini).
- `src/components/shared/ai-chat-dialog.tsx`: AI conversation generator modal UI.

## How to Add a New Skin

We use a Strategy Pattern to make adding new platforms easy. Follow these 4 steps:

### 1. Define the Platform
Open `src/store/useChatStore.ts` and add your new platform ID to the `Platform` type.

```typescript
export type Platform = 
  | 'whatsapp' 
  // ... existing platforms
  | 'your-new-platform';
```

### 2. Create the Skin Component
Create a new file in `src/components/skins/YourNewPlatformSkin.tsx`.
- Copy an existing skin (like `SignalSkin.tsx` or `WhatsAppSkin.tsx`) to get started.
- Use the `useChatStore` hook to access dynamic data like `messages`, `contactName`, etc.

```tsx
import { useChatStore } from "@/store/useChatStore";

export const YourNewPlatformSkin = () => {
  const { messages, contactName, contactAvatar } = useChatStore();
  
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Your UI Implementation */}
    </div>
  );
};
```

### 3. Register the Skin
Open `src/components/canvas/ChatCanvas.tsx`.
- Import your new component.
- Add it to the `renderContent` switch statement.

```tsx
case 'your-new-platform':
  return <YourNewPlatformSkin />;
```

### 4. Add Sidebar Configuration
Open `src/components/sidebar/Sidebar.tsx`.
- Add your platform's configuration object to the `platforms` array. This controls the button in the sidebar.

```tsx
{
  id: "your-new-platform",
  name: "New Platform",
  icon: <YourIcon />, // Import from lucide-react
  color: "bg-blue-500", // Brand color
  type: "chat" // or "post"
},
```

### 5. Update State Persistence (If needed)
If your new skin requires **new top-level state fields** in the Zustand store (beyond `messages`, `contact`, etc.), you **must** update `src/lib/url-state.ts`.
- Add your new field to the `ShareableState` type.
- This ensures your new feature is preserved when users share a link.

## Mobile Responsiveness

MockSocial is fully mobile-responsive. Please ensure your contributions do not break the mobile experience:

### How it works
- **`< 1024px`**: The Sidebar is hidden as a **bottom sheet** (fixed, slides up from the bottom). A blue **"Edit"** FAB at `bottom-4 left-4` opens it via `setMobileSheetOpen(true)` in the Zustand store.
- **`≥ 1024px`**: The Sidebar is a static left panel (unchanged).
- The phone mockup auto-scales to fit the viewport width using a `ResizeObserver` in `ChatCanvas.tsx`.

### Testing checklist for contributors

Before opening a PR, open Chrome DevTools → Toggle device toolbar (Ctrl+Shift+M) and verify:

- [ ] At **375px**: Phone mockup is fully visible, "Edit" FAB is visible bottom-left
- [ ] Tapping "Edit" opens the bottom sheet; tapping backdrop closes it
- [ ] All Sidebar sections are accessible by scrolling within the sheet
- [ ] At **1280px**: Sidebar is always visible as a left panel (no sheet/FAB)
- [ ] Download PNG and GIF still work at both breakpoints

### Key mobile files

| File | Role |
|---|---|
| `src/app/globals.css` | Mobile `overflow: auto`, tap highlight removal, touch-action, backdrop CSS |
| `src/store/slices/createAppSlice.ts` | `isMobileSheetOpen` state + `setMobileSheetOpen` action |
| `src/components/sidebar/Sidebar.tsx` | Bottom-sheet animation, drag handle, backdrop, compact header |
| `src/components/canvas/ChatCanvas.tsx` | `ResizeObserver` scale, mobile FABs, Edit FAB |

### Screenshots

| Mobile Canvas | Mobile Sheet Open |
|:---:|:---:|
| ![Mobile canvas](public/screenshots/mobile-canvas.png) | ![Mobile sheet open](public/screenshots/mobile-sheet-open.png) |

## Pull Request Guidelines

1.  **Fork the repo** and create your branch from `main`.
2.  **Lint your code**: Run `npm run lint` before committing to ensure everything looks good.
3.  **Test your changes**: verify that the new skin renders correctly in the browser and that switching between skins works smoothly.
4.  **Screenshots**: If you are adding a visual feature or skin, please include screenshots or a video in your PR description.

## Asking for Help

If you get stuck, feel free to open a draft PR or an issue labeled "question". We're happy to help you get your contribution merged!
