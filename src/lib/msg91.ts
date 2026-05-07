export async function sendOTP(phone: string, otp: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://control.msg91.com/api/v5/otp?authkey=${process.env.MSG91_AUTH_KEY}&template_id=${process.env.MSG91_TEMPLATE_ID}&mobile=91${phone}&otp=${otp}`,
      { method: "GET" }
    );
    return response.ok;
  } catch {
    return false;
  }
}

export async function sendSMS(phone: string, message: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.msg91.com/api/v2/sendsms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authkey: process.env.MSG91_AUTH_KEY,
        mobiles: `91${phone}`,
        message,
        sender: "GRABIT",
        route: "4",
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
