// Simple clipboard helper with fallbacks
export async function copyText(text?: string | null): Promise<boolean> {
  if (!text) return false;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  try {
    // Fallback for older browsers / non-secure contexts
    const el = document.createElement("textarea");
    el.value = String(text);
    // Avoid keyboard showing on mobile
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return !!ok;
  } catch {}
  return false;
}

// Optional: gentle haptic feedback on supported devices
export function hapticLight() {
  try {
    // @ts-ignore navigator.vibrate may not exist
    if (navigator?.vibrate) navigator.vibrate(10);
  } catch {}
}
