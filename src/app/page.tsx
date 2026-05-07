"use client";

import { useRouter } from "next/navigation";
import { GlowyWavesHero } from "@/components/ui/glowy-waves-hero-shadcnui";

export default function LandingPage() {
  const router = useRouter();

  return (
    <GlowyWavesHero
      onLogin={() => router.push("/login")}
      onSignup={() => router.push("/login")}
    />
  );
}
