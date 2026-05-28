import { StateCreator } from 'zustand';
import { Platform, MockupType, StatusBarConfig, ChatState, PhoneStyle } from '../useChatStore';
import { getPlatformColors } from '@/lib/platform-colors';
import { clampScreenWidth, getPhoneStyleWidth } from '@/lib/phone-dimensions';

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
  phoneStyle: PhoneStyle;
  screenWidth: number;
  setPhoneStyle: (style: PhoneStyle) => void;
  setScreenWidth: (width: number) => void;
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
  screenWidth: getPhoneStyleWidth('default'),
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
  setPhoneStyle: (style) => set({ phoneStyle: style, screenWidth: getPhoneStyleWidth(style) }),
  setScreenWidth: (width) => set({ screenWidth: clampScreenWidth(width) }),
  setMobileSheetOpen: (open) => set({ isMobileSheetOpen: open }),
});

