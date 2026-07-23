import {
  createProvider,
  getProviderById,
  updateProviderStatus,
  updateProviderAvailability,
  searchProviders
} from "../services/providerService.js";

export async function register(req, res, next) {
  try {
    const { name, providerType, latitude, longitude } = req.body;

    if (!name || !providerType || latitude == null || longitude == null) {
      return res.status(400).json({
        error: "name, providerType, latitude, and longitude are required",
      });
    }

    const provider = await createProvider(req.body);
    res.status(201).json({ provider });
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const { search, providerType, status, capability } = req.query;
    const providers = await searchProviders({ search, providerType, status, capability });
    res.json({ providers });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const provider = await getProviderById(req.params.id);
    res.json({ provider });
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    const validStatuses = ["OPEN", "FULL", "LIMITED"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `status must be one of ${validStatuses.join(", ")}` });
    }

    // Provider staff can only update their own provider
    if (req.user.providerId !== req.params.id) {
      return res.status(403).json({ error: "Cannot update a different provider" });
    }

    const provider = await updateProviderStatus(req.params.id, status);
    res.json({ provider });
  } catch (err) {
    next(err);
  }
}

export async function updateAvailability(req, res, next) {
  try {
    if (req.user.providerId !== req.params.id) {
      return res.status(403).json({ error: "Cannot update a different provider" });
    }

    const availability = await updateProviderAvailability(req.params.id, req.body);
    res.json({ availability });
  } catch (err) {
    next(err);
  }
}

export async function getProviderDashboard(req, res, next) {
  try {
    const { id } = req.params;
    
    // Import here to avoid circular dependency or add to top
    const { db } = await import("../db/index.js");
    const { emergencyRequests } = await import("../db/schema/index.js");
    const { eq } = await import("drizzle-orm");

    const incomingPatients = await db
      .select()
      .from(emergencyRequests)
      .where(eq(emergencyRequests.providerId, id));

    res.json({ incomingPatients });
  } catch (err) {
    next(err);
  }
}