import Slot from "../models/slot.model.js";
import { adjustDateToNepalTimezone } from "../utils/helper.utils.js";

// GET API: Fetch All Slots By Venue, Start Date And End Date
export const listSlots = async (req, res) => {
  const { date } = req.query;
  const { venueId } = req.params;
  let query = {};
  if (venueId) {
    query = { venueId };
    if (date) {
      const startDate = adjustDateToNepalTimezone(date);
      query = {
        venueId,
        date: {
          $gte: startDate,
          $lte: startDate,
        },
      };
    }
  }
  try {
    let slots = await Slot.find(query)
      .select("-createdAt -updatedAt -__v")
      .populate("venueId");
    if (slots.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No slots found",
      });
    }
    slots = slots.map((slot) => ({
      id: slot._id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isHoliday: slot.isHoliday || slot.isWeekend,
      price:
        slot.isWeekend || slot.isHoliday ? slot.dynamicPrice : slot.basePrice,
      isReserved: slot.isReserved,
    }));
    res.status(200).json({
      success: true,
      message: "Slots fetched successfully",
      data: slots,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "An error occurred while fetching slots",
      error: error.message,
    });
  }
};

// NOT IMPLEMENTED YET
export const bookSlot = async (req, res) => {
  const { id } = req.params;
  try {
    const slot = await Slot.findByIdAndUpdate(
      id,
      { isReserved: true },
      { new: true }
    );
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Slot not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Slot booked successfully",
      data: slot,
    });
  } catch (error) {}
};

export const cancelSlot = async (req, res) => {
  const { id } = req.params;
  try {
    const slot = await Slot.findByIdAndUpdate(
      id,
      { isReserved: false },
      { new: true }
    );
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Slot not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Slot cancelled successfully",
      data: slot,
    });
  } catch (error) {}
};
