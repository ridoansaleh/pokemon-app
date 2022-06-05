import React, { useEffect, Suspense, lazy } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { notification } from "antd";
import useNetwork from "./hooks/useNetwork";
const Home = lazy(() => import("./routes/home"));
const Comparison = lazy(() => import("./routes/comparison"));
const Detail = lazy(() => import("./routes/detail"));

function App() {
  const isOnline = useNetwork();

  useEffect(() => {
    if (isOnline) {
      notification.info({
        message: "Online",
        description:
          "You are back online. You can install this Pokemon App in your device to use it while offline.",
        placement: "top",
        duration: 5,
      });
    } else {
      notification.error({
        message: "Offline",
        description:
          "Access to this application might be limited. Please check your network connection!",
        placement: "top",
        duration: 10,
      });
    }
  }, [isOnline]);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="comparison"
          element={
            <Suspense fallback={<p>Loading page...</p>}>
              <Comparison />
            </Suspense>
          }
        />
        <Route
          path="detail"
          element={
            <Suspense fallback={<p>Loading page...</p>}>
              <Detail />
            </Suspense>
          }
        />
      </Routes>
    </HashRouter>
  );
}

export default App;
