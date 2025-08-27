import Navbar from "./components/Navbar";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Layout from "./layouts/Layout";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import MathVideo from "./features/mathvidai/MathVideo";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./auth/ProtectedRoute";
import Whiteboard from "./features/whiteboard/index";
import { ToastContainer } from "react-toastify";
import Contact from "./pages/Contact";
import { MathJaxContext } from "better-react-mathjax";
import { MantineProvider } from "@mantine/core";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="vid-gen"
            element={
              <ProtectedRoute>
                <MathVideo />
              </ProtectedRoute>
            }
          />
          <Route
            path="about"
            element={
              <ProtectedRoute>
                <About />
              </ProtectedRoute>
            }
          />
          <Route
            path="contact"
            element={
              <ProtectedRoute>
                <Contact />
              </ProtectedRoute>
            }
          />
          <Route
            path="whiteboard"
            element={
              <ProtectedRoute>
                 <MantineProvider>
                      <MathJaxContext>
                      <Whiteboard />
                      </MathJaxContext>
                    </MantineProvider>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
