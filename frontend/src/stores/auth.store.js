import { makeAutoObservable, runInAction } from "mobx";
import api from "../utils/axios";

class AuthStore {
  user = null;
  formData = {
    email: "",
    password: "",
  };

  loading = false;
  errorMessage = {};

  constructor() {
    makeAutoObservable(this);
    this.verifyUser();
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.formData[name] = value;

    if (value) {
      delete this.errorMessage[name];
    }
  };

  validateForm = (data) => {
    const errors = {};
    if (!data.email || data.email.trim() === "") {
      errors.email = "Email is required!";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errors.email = "Please enter a valid email address!";
    }
    if (!data.password || data.password.trim() === "") {
      errors.password = "Password is required!";
    }
    runInAction(() => {
      this.errorMessage = errors;
    });
    return Object.keys(errors).length === 0;
  };

  resetForm = () => {
    runInAction(() => {
      this.formData = { email: "", password: "" };
      this.errorMessage = {};
    });
  };

  login = async (email, password) => {
    this.loading = true;
    try {
      const response = await api.post("/auth/login", { email, password });
      runInAction(() => {
        if (response.data.success) {
          this.user = response.data.user;
          localStorage.setItem("token", response.data.token);
          // reset form on successful login
          this.resetForm();
        }
      });
    } catch (error) {
      runInAction(() => {
        this.user = null;
      });
      throw error;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  logout = () => {
    runInAction(() => {
      this.user = null;
      this.resetForm();
      localStorage.removeItem("token");
    });
  };

  verifyUser = async () => {
    this.loading = true;
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await api.get("/auth/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });
        runInAction(() => {
          if (response.data.success) {
            this.user = response.data.user;
          }
        });
      } catch (error) {
        runInAction(() => {
          this.user = null;
          localStorage.removeItem("token");
        });
      }
    }
    runInAction(() => {
      this.loading = false;
    });
  };
}

export const authStore = new AuthStore();
