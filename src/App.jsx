import React, { useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { notification } from "antd";
import Home from "./routes/home";
import Comparison from "./routes/comparison";
import Detail from "./routes/detail";
import useNetwork from "./hooks/useNetwork";

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
        <Route path="comparison" element={<Comparison />} />
        <Route path="detail" element={<Detail />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
