export type PopupCloseReason = "history" | "programmatic";

export type PopupToken = {
  id: number;
};

type PopupEntry = {
  token: PopupToken;
  dismiss: () => void;
};

const POPUP_DEPTH_STATE_KEY = "__gephPopupDepth";
const UI_CLOSE_FALLBACK_MS = 250;

const isBrowser = () =>
  typeof window !== "undefined" && typeof history !== "undefined";

const getHistoryDepth = () => {
  if (!isBrowser()) return 0;
  const depth = (history.state as any)?.[POPUP_DEPTH_STATE_KEY];
  return typeof depth === "number" && depth >= 0 ? depth : 0;
};

class PopupHistoryManager {
  private stack: PopupEntry[] = [];
  private nextId = 1;
  private isListening = false;

  registerPopup(dismiss: () => void): PopupToken {
    const token: PopupToken = { id: this.nextId++ };
    if (!isBrowser()) return token;

    this.ensureListener();
    this.stack.push({ token, dismiss });

    history.pushState(
      {
        ...(history.state ?? {}),
        [POPUP_DEPTH_STATE_KEY]: this.stack.length,
      },
      "",
    );

    return token;
  }

  requestCloseFromUI(token: PopupToken) {
    if (!isBrowser()) return;

    const top = this.stack[this.stack.length - 1];
    if (!top || top.token.id !== token.id) {
      return;
    }

    history.back();

    // Some webviews can fail to emit popstate reliably; fall back to direct dismissal.
    window.setTimeout(() => {
      const currentTop = this.stack[this.stack.length - 1];
      if (!currentTop || currentTop.token.id !== token.id) return;
      this.stack.pop();
      currentTop.dismiss();
    }, UI_CLOSE_FALLBACK_MS);
  }

  unregisterPopup(token: PopupToken, reason: PopupCloseReason) {
    if (!isBrowser()) return;

    const idx = this.stack.findIndex((entry) => entry.token.id === token.id);
    if (idx === -1) return;

    this.stack.splice(idx, 1);

    // If a popup closes without popstate, consume one synthetic history entry.
    if (reason === "programmatic" && getHistoryDepth() > this.stack.length) {
      history.back();
    }
  }

  private ensureListener() {
    if (!isBrowser() || this.isListening) return;
    window.addEventListener("popstate", this.handlePopState);
    this.isListening = true;
  }

  private handlePopState = () => {
    const targetDepth = getHistoryDepth();
    while (this.stack.length > targetDepth) {
      const entry = this.stack.pop();
      if (!entry) break;
      entry.dismiss();
    }
  };
}

export const popupHistory = new PopupHistoryManager();
