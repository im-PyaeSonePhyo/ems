// stores/SettingStore.js
import { makeAutoObservable, runInAction } from "mobx";
import api from "../utils/axios";

class SettingStore {
  userId = "";
  oldPassword = "";
  newPassword = "";
  confirmPassword = "";

  loading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
  }

  setUserId(id) {
    this.userId = id;
  }

  setField(name, value) {
    this[name] = value;
    this.error = null; // Reset error on change
  }

  updatePassword = async (onSuccess) => {
    this.loading = true;
    this.error = null;

    if (this.newPassword !== this.confirmPassword) {
      this.error = "Password Not Matched";
      this.loading = false;
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await api.put(
        "/setting/change-password",
        {
          userId: this.userId,
          oldPassword: this.oldPassword,
          newPassword: this.newPassword,
          confirmPassword: this.confirmPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      runInAction(() => {
        if (response.data.success) {
          if (onSuccess) onSuccess(); // Navigate back
          this.resetForm();
        } else {
          this.error = response.data.error || "Password update failed";
        }
      });
    } catch (error) {
      runInAction(() => {
        this.error =
          error.response?.data?.error || error.message || "Server error";
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  resetForm() {
    this.oldPassword = "";
    this.newPassword = "";
    this.confirmPassword = "";
  }
}

export const settingStore = new SettingStore();
