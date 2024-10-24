import FutsalOwner from "../models/futsal.owner.model.js";

export const listFutsalOwners = async (req, res) => {
  try {
    const futsalOwners = await FutsalOwner.find().select("isOnboarded email");
    futsalOwners.length > 0
      ? res.status(200).json(futsalOwners)
      : res.status(404).json({ message: "Empty Futsal Owners List" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
