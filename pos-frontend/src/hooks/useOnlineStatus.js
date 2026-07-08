import { useEffect, useState } from "react";

/**
 * useOnlineStatus
 * Tracks real browser connectivity (navigator.onLine + online/offline
 * events) so UI badges reflect the truth instead of a hardcoded "Online".
 */
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return isOnline;
};

export default useOnlineStatus;
