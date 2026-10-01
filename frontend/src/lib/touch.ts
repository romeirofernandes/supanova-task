export const TOUCH_GESTURE_CLASS = "[-webkit-tap-highlight-color:transparent]";

export function capturePointer(el: HTMLElement, pointerId: number) {
  try {
    el.setPointerCapture(pointerId);
  } catch {
    /* pointer capture unsupported */
  }
}

export function releasePointer(el: HTMLElement, pointerId: number) {
  try {
    if (el.hasPointerCapture?.(pointerId)) el.releasePointerCapture(pointerId);
  } catch {
    /* already released */
  }
}
