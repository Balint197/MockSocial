export const PHONE_STYLE_DIMENSIONS = {
  mini: { width: 310, height: 640 },
  default: { width: 340, height: 700 },
  pro: { width: 375, height: 780 },
} as const;

export type PhoneStyle = keyof typeof PHONE_STYLE_DIMENSIONS;

export const SCREEN_WIDTH_MIN = 280;
export const SCREEN_WIDTH_MAX = 640;

export function clampScreenWidth(width: number) {
  return Math.min(SCREEN_WIDTH_MAX, Math.max(SCREEN_WIDTH_MIN, Math.round(width)));
}

export function getPhoneStyleWidth(style: PhoneStyle) {
  return PHONE_STYLE_DIMENSIONS[style].width;
}

export function getPhoneStyleHeight(style: PhoneStyle) {
  return PHONE_STYLE_DIMENSIONS[style].height;
}
