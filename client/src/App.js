import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import Skills from "./pages/Skills";
import Notifications from "./pages/Notifications";
import VideoCall from "./pages/VideoCall";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />
        
        <Route path="/chat" element={<Chat />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/skills" element={<Skills />} />

        <Route path="/notifications" element={<Notifications />}/>

        <Route path="/video-call" element={<VideoCall />} />
    

      </Routes>

    </BrowserRouter>
  );
}

export default App;