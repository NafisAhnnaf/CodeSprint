import axios from "axios";
import useAuth from "../auth/useAuth"; // Make sure the path is correct
const backend = import.meta.env.VITE_BACKEND;

class Request {
  constructor() {
    this.api = axios.create({
      baseURL: backend,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: false, // ⬅️ Required to send cookies
    });

    // 🔐 Add Authorization header dynamically on each request
    this.api.interceptors.request.use(
      (config) => {
        const token = useAuth.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 🔴 Global Response Interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.warn("⚠️ Unauthorized! Logging out...");
          useAuth.getState().logout(); // ⬅️ Zustand logout
        }
        return Promise.reject(error); // Still throw to allow catch blocks
      }
    );
  }

  async get(route, config = {}) {
    try {
      const response = await this.api.get(route, config);
      return response.data;
    } catch (error) {
      console.error("GET error:", error.response?.data || error.message);
      throw error;
    }
  }

  async post(route, data = {}, config = {}) {
    try {
      const response = await this.api.post(route, data, config);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      alert(errorMessage);
      console.error("POST error:", errorMessage);
      throw error;
    }
  }

  async put(route, data = {}, config = {}) {
    try {
      const response = await this.api.put(route, data, config);
      return response.data;
    } catch (error) {
      console.error("PUT error:", error.response?.data || error.message);
      throw error;
    }
  }

  async patch(route, data = {}, config = {}) {
    try {
      const response = await this.api.patch(route, data, config);
      return response.data;
    } catch (error) {
      console.error("PATCH error:", error.response?.data || error.message);
      throw error;
    }
  }

  async delete(route, config = {}) {
    try {
      const response = await this.api.delete(route, config);
      return response.data;
    } catch (error) {
      console.error("DELETE error:", error.response?.data || error.message);
      throw error;
    }
  }
}

export default new Request();
