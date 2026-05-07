"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";
import { Smartphone, ArrowLeft } from "lucide-react";
import SignInCard from "@/components/ui/travel-connect-signin";

export default function LoginPage() {
  const { otpSent, phone, setOtpSent, setPhone } = useAuthStore();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  const sendOtp = async () => {
    if (phone.length < 10) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) throw new Error("Failed to send OTP");
      const data = await res.json();
      setOtpSent(true);
      if (data.devOtp) {
        toast.success(`Dev OTP: ${data.devOtp}`);
      } else {
        toast.success("OTP sent to your phone");
      }
    } catch {
      toast.error("Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length < 6) {
      toast.error("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const result = await signIn("phone", {
        phone,
        otp,
        redirect: false,
      });
      if (result?.error) {
        toast.error("Invalid or expired OTP");
      } else {
        toast.success("Logged in successfully!");
        window.location.href = "/browse";
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (showPhone) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white dark:from-gray-950 dark:to-indigo-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-indigo-100 dark:border-indigo-900/50 bg-white dark:bg-gray-900 shadow-xl shadow-indigo-500/5">
          <CardContent className="p-8 space-y-6">
            <button
              onClick={() => { setShowPhone(false); setOtpSent(false); setOtp(""); }}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>

            <div className="text-center">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
                <Smartphone className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Phone Sign In</h2>
              <p className="text-indigo-600/70 dark:text-indigo-400/70 text-sm mt-1">Enter your phone number to receive an OTP</p>
            </div>

            {!otpSent ? (
              <div className="space-y-3">
                <Input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  maxLength={10}
                  className="bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 text-center text-lg focus:border-indigo-500 focus:ring-indigo-500/20"
                />
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25"
                  onClick={sendOtp}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  OTP sent to <strong className="text-indigo-600 dark:text-indigo-400">+91 {phone}</strong>
                </p>
                <Input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  className="bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 text-center text-2xl tracking-widest focus:border-indigo-500 focus:ring-indigo-500/20"
                />
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25"
                  onClick={verifyOtp}
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </Button>
                <button
                  className="w-full text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
                  onClick={() => { setOtpSent(false); setOtp(""); }}
                >
                  Change phone number
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white dark:from-gray-950 dark:to-indigo-950 flex items-center justify-center p-4">
      <SignInCard
        onGoogleSignIn={() => signIn("google", { callbackUrl: "/onboarding" })}
        onPhoneSignIn={() => setShowPhone(true)}
        showPhoneOption={true}
      />
    </div>
  );
}
