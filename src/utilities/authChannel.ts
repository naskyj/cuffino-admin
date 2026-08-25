// Cross-tab logout sync. Auth state lives in cookies + per-tab Redux state, neither of which
// notifies other open tabs on change, so logging out in one tab previously left every other tab
// fully usable (stale in-memory state) until it happened to make a fresh request. BroadcastChannel
// lets the tab that logs out explicitly tell every other same-origin tab to do the same.
const CHANNEL_NAME = "cuffino-admin-auth";
const noop = (): void => undefined;

interface AuthBroadcastMessage {
  type: "logout";
}

const getChannel = (): BroadcastChannel | null => {
  if (
    typeof window === "undefined" ||
    typeof BroadcastChannel === "undefined"
  ) {
    return null;
  }
  return new BroadcastChannel(CHANNEL_NAME);
};

export const broadcastLogout = (): void => {
  const channel = getChannel();
  if (!channel) return;
  channel.postMessage({ type: "logout" } satisfies AuthBroadcastMessage);
  channel.close();
};

// Returns an unsubscribe function, matching the useEffect cleanup convention.
export const onLogoutBroadcast = (callback: () => void): (() => void) => {
  const channel = getChannel();
  if (!channel) return noop;

  const handler = (event: MessageEvent<AuthBroadcastMessage>) => {
    if (event.data?.type === "logout") callback();
  };
  channel.addEventListener("message", handler);

  return () => {
    channel.removeEventListener("message", handler);
    channel.close();
  };
};
