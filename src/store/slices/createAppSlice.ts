import { StateCreator } from 'zustand';
import { Platform, MockupType, StatusBarConfig, ChatState } from '../useChatStore';
import { getPlatformColors } from '@/lib/platform-colors';

export interface AppSlice {
  mockupType: MockupType;
  platform: Platform;
  statusBar: StatusBarConfig;
  isDarkMode: boolean;
  isMobileSheetOpen: boolean;

  setMockupType: (type: MockupType) => void;
  setPlatform: (platform: Platform) => void;
  updateStatusBar: (updates: Partial<StatusBarConfig>) => void;
  toggleDarkMode: (isDark: boolean) => void;
  wallpaper: string | null;
  setWallpaper: (url: string | null) => void;
  showKeyboard: boolean;
  toggleKeyboard: (show: boolean) => void;
  phoneStyle: 'default' | 'mini' | 'pro';
  setPhoneStyle: (style: 'default' | 'mini' | 'pro') => void;
  setMobileSheetOpen: (open: boolean) => void;
}

export const createAppSlice: StateCreator<ChatState, [], [], AppSlice> = (set, get) => ({
  mockupType: 'chat',
  platform: 'signal',
  statusBar: {
    time: '9:41',
    batteryLevel: 100,
    showBatteryPercentage: true,
    signalStrength: 4,
    wifi: true,
  },
  isDarkMode: false,
  wallpaper: null,
  showKeyboard: false,
  phoneStyle: 'default',
  isMobileSheetOpen: false,

  setMockupType: (type) => set({ mockupType: type }),
  setPlatform: (platform) => {
    set({ platform });
    
    // Update bubble colors according to new platform if custom colors are enabled
    const state = get();
    if (state.useCustomColors) {
      const colors = getPlatformColors(platform, state.isDarkMode);
      state.setMeBubbleColor(colors.me);
      state.setThemBubbleColor(colors.them);
    }
  },
  updateStatusBar: (updates) =>
    set((state) => ({ statusBar: { ...state.statusBar, ...updates } })),
  toggleDarkMode: (isDark) => {
    set({ isDarkMode: isDark });
    
    // Update colors if dark mode changes
    const state = get();
    if (state.useCustomColors) {
      const colors = getPlatformColors(state.platform, isDark);
      state.setMeBubbleColor(colors.me);
      state.setThemBubbleColor(colors.them);
    }
  },
  setWallpaper: (url) => set({ wallpaper: url }),
  toggleKeyboard: (show) => set({ showKeyboard: show }),
  setPhoneStyle: (style) => set({ phoneStyle: style }),
  setMobileSheetOpen: (open) => set({ isMobileSheetOpen: open }),
});

