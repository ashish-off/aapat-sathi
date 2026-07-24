"use server";

import { revalidatePath } from "next/cache";

export async function registerProvider(formData: FormData) {
  // Extract capabilities checkboxes (e.g. "capabilities_icu", "capabilities_surgery")
  const capabilities: string[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("capabilities_") && value === "on") {
      capabilities.push(key.replace("capabilities_", ""));
    }
  }

  const payload = {
    name: formData.get("name"),
    providerType: formData.get("providerType"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    latitude: parseFloat(formData.get("latitude") as string),
    longitude: parseFloat(formData.get("longitude") as string),
    capabilities: capabilities,
  };

  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${API_URL}/api/providers/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { success: false, error: errorData.error || "Registration failed" };
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error registering provider:", error);
    return { success: false, error: "Network error. Is the backend running?" };
  }
}

export async function registerAmbulanceAction(formData: FormData) {
  const payload = {
    vehicleNumber: formData.get("vehicleNumber"),
    driverName: formData.get("driverName"),
    driverPhone: formData.get("driverPhone"),
    latitude: parseFloat(formData.get("latitude") as string || "27.7172"),
    longitude: parseFloat(formData.get("longitude") as string || "85.324"),
  };

  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${API_URL}/api/ambulances/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { success: false, error: errorData.error || "Ambulance registration failed" };
    }

    revalidatePath("/ambulance-details");
    return { success: true };
  } catch (error) {
    console.error("Error registering ambulance:", error);
    return { success: false, error: "Network error. Is the backend running?" };
  }
}
