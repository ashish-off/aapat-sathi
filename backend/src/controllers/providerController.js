import {
  createProvider,
  getAllProviders,
  getProviderById,
  updateProviderStatus,
  updateProviderAvailability,
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
    const providers = await getAllProviders();
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