import { create } from "zustand";

interface AuthState {
  otpSent: boolean;
  phone: string;
  setOtpSent: (value: boolean) => void;
  setPhone: (phone: string) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  otpSent: false,
  phone: "",
  setOtpSent: (value) => set({ otpSent: value }),
  setPhone: (phone) => set({ phone }),
  reset: () => set({ otpSent: false, phone: "" }),
}));
