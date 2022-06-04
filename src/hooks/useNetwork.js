import { useState, useEffect } from 'react'

function useNetwork() {
  const [isOnline, setNetwork] = useState(window.navigator.onLine);

  useEffect(() => {
    window.addEventListener("offline", updateNetwork);
    window.addEventListener("online", updateNetwork);

    return () => {
      window.removeEventListener("offline", updateNetwork);
      window.removeEventListener("online", updateNetwork);
    };
  });

  function updateNetwork() {
    setNetwork(window.navigator.onLine);
  };

  return isOnline;
}

export default useNetwork
