import { eq, and, ilike, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { healthcareProviders, providerAvailability } from "../db/schema/index.js";

export async function createProvider(data) {
  const [provider] = await db
    .insert(healthcareProviders)
    .values({
      name: data.name,
      providerType: data.providerType,
      address: data.address,
      phone: data.phone,
      latitude: data.latitude,
      longitude: data.longitude,
      telegramChatId: data.telegramChatId || null,
      capabilities: data.capabilities || [],
      status: data.status || "OPEN",
    })
    .returning();

  // Create an empty availability row alongside it
  await db.insert(providerAvailability).values({ providerId: provider.id });

  return provider;
}

// export async function getAllProviders() {
//   return db.select().from(healthcareProviders).where(eq(healthcareProviders.isActive, true));
// }

export async function searchProviders({ search, providerType, status, capability }) {
  const conditions = [eq(healthcareProviders.isActive, true)];

  if (search) {
    conditions.push(ilike(healthcareProviders.name, `%${search}%`));
  }

  if (providerType) {
    conditions.push(eq(healthcareProviders.providerType, providerType));
  }

  if (status) {
    conditions.push(eq(healthcareProviders.status, status));
  }

  if (capability) {
    // JSONB array contains check
    conditions.push(sql`${healthcareProviders.capabilities} @> ${JSON.stringify([capability])}`);
  }

  return db
    .select()
    .from(healthcareProviders)
    .where(and(...conditions));
}

export async function getProviderById(id) {
  const [provider] = await db
    .select()
    .from(healthcareProviders)
    .where(eq(healthcareProviders.id, id));

  if (!provider) {
    const err = new Error("Provider not found");
    err.status = 404;
    throw err;
  }

  const [availability] = await db
    .select()
    .from(providerAvailability)
    .where(eq(providerAvailability.providerId, id));

  return { ...provider, availability: availability || null };
}

export async function updateProviderStatus(providerId, status) {
  const [updated] = await db
    .update(healthcareProviders)
    .set({ status, updatedAt: new Date() })
    .where(eq(healthcareProviders.id, providerId))
    .returning();

  if (!updated) {
    const err = new Error("Provider not found");
    err.status = 404;
    throw err;
  }

  return updated;
}

export async function updateProviderAvailability(providerId, data) {
  const [updated] = await db
    .update(providerAvailability)
    .set({
      availableAmbulances: data.availableAmbulances,
      availableIcuBeds: data.availableIcuBeds,
      availableEmergencyBeds: data.availableEmergencyBeds,
      emergencyQueue: data.emergencyQueue,
      updatedAt: new Date(),
    })
    .where(eq(providerAvailability.providerId, providerId))
    .returning();

  if (!updated) {
    const err = new Error("Availability record not found");
    err.status = 404;
    throw err;
  }

  return updated;
}