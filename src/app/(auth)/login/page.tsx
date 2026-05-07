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
      setOtpSent(true);
      toast.success("OTP sent to your phone");
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
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white border border-gray-200 text-gray-900 shadow-lg">
          <CardContent className="p-8 space-y-6">
            <button
              onClick={() => { setShowPhone(false); setOtpSent(false); setOtp(""); }}
              className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>

            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Phone Sign In</h2>
              <p className="text-gray-500 text-sm mt-1">Enter your phone number to receive an OTP</p>
            </div>

            {!otpSent ? (
              <div className="space-y-3">
                <Input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  maxLength={10}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 text-center text-lg"
                />
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={sendOtp}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 text-center">
                  OTP sent to <strong className="text-gray-900">+91 {phone}</strong>
                </p>
                <Input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 text-center text-2xl tracking-widest"
                />
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={verifyOtp}
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </Button>
                <button
                  className="w-full text-sm text-indigo-600 hover:text-indigo-700"
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
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <SignInCard
        onGoogleSignIn={() => signIn("google", { callbackUrl: "/onboarding" })}
        onPhoneSignIn={() => setShowPhone(true)}
        showPhoneOption={true}
      />
    </div>
  );
}
