import { StateCreator } from 'zustand';
import {
  Contact,
  Message,
  Platform,
  MockupType,
  StatusBarConfig,
  PostConfig,
  PhoneStyle,
} from '../useChatStore';

export interface SavedMockup {
  id: string;
  name: string;
  createdAt: number; // unix ms
  platform: Platform;
  mockupType: MockupType;
  contact: Contact;
  messages: Message[];
  statusBar: StatusBarConfig;
  postConfig: PostConfig;
  isDarkMode: boolean;
  wallpaper: string | null;
  phoneStyle: PhoneStyle;
}

// The slice only needs read access to the rest of the store when saving,
// so we type the "get" parameter loosely.
export interface SavedMockupsSlice {
  savedMockups: SavedMockup[];
  saveMockup: (name: string) => void;
  loadMockup: (id: string) => void;
  deleteMockup: (id: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createSavedMockupsSlice: StateCreator<any, [], [], SavedMockupsSlice> =
  (set, get) => ({
    savedMockups: [],

    saveMockup: (name: string) => {
      const state = get();
      const snapshot: SavedMockup = {
        id: crypto.randomUUID(),
        name: name.trim() || `Mockup ${new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}`,
        createdAt: Date.now(),
        platform: state.platform as Platform,
        mockupType: state.mockupType as MockupType,
        contact: { ...(state.contact as Contact) },
        messages: [...(state.messages as Message[])],
        statusBar: { ...(state.statusBar as StatusBarConfig) },
        postConfig: { ...(state.postConfig as PostConfig) },
        isDarkMode: state.isDarkMode as boolean,
        wallpaper: state.wallpaper as string | null,
        phoneStyle: state.phoneStyle as PhoneStyle,
      };
      set((s: SavedMockupsSlice) => ({ savedMockups: [snapshot, ...s.savedMockups] }));
    },

    loadMockup: (id: string) => {
      const { savedMockups } = get() as SavedMockupsSlice;
      const snap = savedMockups.find((m) => m.id === id);
      if (!snap) return;
      set({
        platform: snap.platform,
        mockupType: snap.mockupType,
        contact: { ...snap.contact },
        messages: [...snap.messages],
        statusBar: { ...snap.statusBar },
        postConfig: { ...snap.postConfig },
        isDarkMode: snap.isDarkMode,
        wallpaper: snap.wallpaper,
        phoneStyle: snap.phoneStyle,
      });
    },

    deleteMockup: (id: string) => {
      set((s: SavedMockupsSlice) => ({ savedMockups: s.savedMockups.filter((m) => m.id !== id) }));
    },
  });
