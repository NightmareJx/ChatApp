import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Homepage from "./Pages/Homepage";
import Chatpage from "./Pages/Chatpage";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import LoadingPage from "./components/Loading/LoadingPage";

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [appHeight, setAppHeight] = useState(0);

  useEffect(() => {
    // Simulate async initialization (replace with actual async logic)
    setTimeout(() => {
      const userInfo = localStorage.getItem("userInfo");
      if (userInfo) {
        setUser(JSON.parse(userInfo));
      }
      setLoading(false);
    }, 3000); // Adjust delay as needed

    const updateAppHeight = () => {
      const height = document.getElementById("root").clientHeight;
      setAppHeight(height);
    };

    window.addEventListener("resize", updateAppHeight);
    updateAppHeight(); // Initial height

    return () => window.removeEventListener("resize", updateAppHeight);
  }, []); // Empty dependency array for componentDidMount behavior

  if (loading) {
    return <LoadingPage />; // Render loading state while initializing
  }

  return (
    <div
      className="App"
      style={{
        overflowY: appHeight > window.innerHeight ? "scroll" : "hidden",
      }}
    >
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/chats" /> : <Homepage />}
        />
        <Route
          path="/chats"
          element={user ? <Chatpage /> : <Navigate to="/" />}
        />
        {/* Add a catch-all route for unmatched paths */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
