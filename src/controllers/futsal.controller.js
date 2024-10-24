import Futsal from "../models/futsal.model.js";

// GET API: Fetch All Futsals
export const listFutsals = async (req, res) => {
  try {
    let futsals = await Futsal.find({})
      .select("-createdAt -updatedAt -__v")
      .populate("userId", "email isOnboarded isActive");
    if (futsals.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No futsals found",
      });
    }
    futsals = futsals.map((futsal) => ({
      id: futsal._id,
      futsalName: futsal.name,
      contact: futsal.contact,
      email: futsal.userId.email,
      address: `${futsal.address.street}, ${futsal.address.district}`,
      longitude: futsal.location.coordinates && futsal.location.coordinates[0],
      latitude: futsal.location.coordinates && futsal.location.coordinates[1],
      imageUrl: futsal.imageUrl,
      opensAt: futsal.opensAt,
      closesAt: futsal.closesAt,
      ownerId: futsal.userId._id,
      isFutsalActive: futsal.userId.isActive,
      isFutsalOnboarded: futsal.userId.isOnboarded,
    }));
    res.status(200).json({
      success: true,
      message: "Futsals fetched successfully",
      data: futsals,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "An error occurred while fetching futsals",
      error: error.message,
    });
  }
};

// GET API: Fetch All Nearby Futsals
export const listNearbyFutsals = async (req, res) => {
  const { longitude, latitude, radius } = req.query;
  const radiusInKiloMeters = radius ? radius : 1;
  try {
    let futsals = await Futsal.find({
      location: {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], radiusInKiloMeters / 6371],
        },
      },
    });
    if (futsals.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No nearby futsals found",
      });
    }
    futsals = futsals.map((futsal) => ({
      id: futsal._id,
      futsalName: futsal.name,
      contact: futsal.contact,
      email: futsal.userId.email,
      address: `${futsal.address.street}, ${futsal.address.district}`,
      longitude: futsal.location.coordinates && futsal.location.coordinates[0],
      latitude: futsal.location.coordinates && futsal.location.coordinates[1],
      imageUrl: futsal.imageUrl,
      opensAt: futsal.opensAt,
      closesAt: futsal.closesAt,
      ownerId: futsal.userId._id,
      isFutsalActive: futsal.userId.isActive,
      isFutsalOnboarded: futsal.userId.isOnboarded,
    }));
    res.status(200).json({
      success: true,
      message: "Nearby futsals fetched successfully",
      data: futsals,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "An error occurred while fetching nearby futsals",
      error: error.message,
    });
  }
};

// GET API: Fetch One Futsal By Id
export const getFutsal = async (req, res) => {
  const id = req.params.id;
  try {
    let futsal = await Futsal.findById(id)
      .select("-createdAt -updatedAt -__v")
      .populate("userId", "email isOnboarded isActive");
    if (!futsal) {
      return res.status(404).json({
        success: false,
        message: "Futsal not found",
      });
    }
    futsal = {
      id: futsal._id,
      futsalName: futsal.name,
      contact: futsal.contact,
      email: futsal.userId.email,
      address: `${futsal.address.street}, ${futsal.address.district}`,
      longitude: futsal.location.coordinates && futsal.location.coordinates[0],
      latitude: futsal.location.coordinates && futsal.location.coordinates[1],
      imageUrl: futsal.imageUrl,
      opensAt: futsal.opensAt,
      closesAt: futsal.closesAt,
      ownerId: futsal.userId._id,
      isFutsalActive: futsal.userId.isActive,
      isFutsalOnboarded: futsal.userId.isOnboarded,
    };
    res.status(200).json({
      success: true,
      message: "Futsal fetched successfully",
      data: futsal,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "An error occurred while fetching futsals",
      error: error.message,
    });
  }
};
