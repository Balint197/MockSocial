import { Platform } from "../store/useChatStore";

export const getPlatformColors = (platform: Platform, isDarkMode: boolean = false) => {
  switch (platform) {
    case 'whatsapp':
      return {
        me: isDarkMode ? '#005c4b' : '#d9fdd3',
        them: isDarkMode ? '#202c33' : '#ffffff'
      };
    case 'messenger':
      return {
        me: '#0084ff',
        them: isDarkMode ? '#303030' : '#f0f0f0'
      };
    case 'signal':
      return {
        me: '#2c6bed',
        them: isDarkMode ? '#333333' : '#f6f6f6'
      };
    case 'telegram':
      return {
        me: isDarkMode ? '#3390ec' : '#3390ec', // Telegram uses same blue usually
        them: isDarkMode ? '#212121' : '#ffffff'
      };
    case 'discord':
      return {
        me: '#f23f43',
        them: isDarkMode ? '#2e3035' : '#f2f3f5'
      };
    case 'teams':
      return {
        me: '#e8ebfa',
        them: isDarkMode ? '#292929' : '#ffffff'
      };
    case 'slack':
      return {
        me: isDarkMode ? '#1a1d21' : '#f8f8f8',
        them: isDarkMode ? '#1a1d21' : '#f8f8f8'
      };
    case 'imessage':
      return {
        me: '#007aff',
        them: isDarkMode ? '#262629' : '#e9e9eb'
      };
    case 'instagram':
      return {
        me: '#3797f0',
        them: isDarkMode ? '#262626' : '#efefef'
      };
    case 'x':
      return {
        me: isDarkMode ? '#1d9bf0' : '#1d9bf0',
        them: isDarkMode ? '#202327' : '#eff3f4'
      };
    case 'tiktok':
      return {
        me: '#fe2c55',
        them: isDarkMode ? '#333333' : '#e2e2e2'
      };
    case 'snapchat':
      return {
        me: '#00B9FF',
        them: isDarkMode ? '#2d2d2d' : '#f3f3f3'
      };
    case 'linkedin':
      return {
        me: '#0077b5',
        them: isDarkMode ? '#2d2d2d' : '#f3f3f3'
      };
    case 'threads':
      return {
        me: isDarkMode ? '#262626' : '#eff3f4',
        them: isDarkMode ? '#262626' : '#eff3f4'
      };
    default:
      return {
        me: '#007aff',
        them: isDarkMode ? '#262629' : '#e9e9eb'
      };
  }
};
