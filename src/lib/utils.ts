import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateDeposit(itemValue: number, trustScore: number): number {
  const base = itemValue * 0.2;
  let multiplier: number;
  if (trustScore > 80) multiplier = 0.5;
  else if (trustScore > 60) multiplier = 0.75;
  else multiplier = 1.0;
  return Math.max(Math.round(base * multiplier), 200);
}

export function calculateRentalFees(
  dailyRate: number,
  totalDays: number,
  itemValue: number,
  trustScore: number,
  protectionFee: number = 0,
  deliveryFee: number = 0,
  platformFeePercent: number = 0.15
) {
  const rentalFee = dailyRate * totalDays;
  const platformFee = rentalFee * platformFeePercent;
  const depositAmount = calculateDeposit(itemValue, trustScore);
  const taxableAmount = rentalFee + platformFee + protectionFee;
  const taxes = Math.round(taxableAmount * 0.18 * 100) / 100;
  const totalPaid = rentalFee + platformFee + depositAmount + protectionFee + deliveryFee + taxes;

  return { rentalFee, platformFee, depositAmount, protectionFee, deliveryFee, taxes, totalPaid };
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getTrustBadge(score: number): { label: string; color: string } {
  if (score <= 40) return { label: "New User", color: "bg-gray-400" };
  if (score <= 60) return { label: "Trusted", color: "bg-blue-500" };
  if (score <= 80) return { label: "Reliable", color: "bg-green-500" };
  return { label: "Elite", color: "bg-yellow-500" };
}

export function getPlatformFeeRate(plan: string): number {
  switch (plan) {
    case "PRO": return 0.10;
    case "PLUS": return 0.12;
    default: return 0.15;
  }
}

export function getDepositMultiplier(plan: string): number {
  switch (plan) {
    case "PRO": return 0.50;
    case "PLUS": return 0.75;
    default: return 1.0;
  }
}
