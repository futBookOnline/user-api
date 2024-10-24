import Reservation from "../models/reservation.model.js";
import Slot from "../models/slot.model.js";
import { adjustDateToNepalTimezone } from "../utils/helper.utils.js";
import { getIoInstance } from "../sockets/socket.handler.js";

// POST API: Add Reservation
export const addReservation = async (req, res) => {
  const reservationObject = req.body;
  try {
    const reservation = await Reservation.create(reservationObject);
    if (reservation) {
      const slot = await Slot.findByIdAndUpdate(
        reservationObject.slotId,
        { isReserved: true },
        { new: true }
      );
      if (!slot) {
        return res.status(404).json({
          success: false,
          message: "Slot not found",
        });
      }
      const reservationData = {
        id: reservation._id,
        slotId: reservation.slotId,
        isReserved: slot.isReserved,
      };
      reservationObject.userId
        ? (reservationData.userId = reservation.userId)
        : (reservationData.guestUser = reservation.guestUser);
        getIoInstance().emit("reservation-added")
      res.status(201).json({
        success: true,
        message: "Reservation created successfully",
        data: reservationData,
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "An error occurred while creating reservation",
      error: error.message,
    });
  }
};

// GET API: Fetch Today's Reservations Of A User
export const listTodaysReservations = async (req, res) => {
  const { userId } = req.params;
  let today = new Date().toISOString().split("T")[0];
  today = adjustDateToNepalTimezone(today);
  let match = { date: { $gte: today, $lte: today } };
  let populateOptions = {
    path: "slotId",
    match: match && Object.keys(match).length ? match : null, // Include match if it's not empty
    select: "date startTime endTime isWeekend isHoliday basePrice dynamicPrice",
    strictPopulate: true,
    populate: {
      path: "venueId",
      select: "name location address contact",
      populate: {
        path: "userId",
        select: "email",
      },
    },
  };
  try {
    const reservations = await Reservation.find({ userId }).populate(
      populateOptions
    );
    if (reservations.length == 0) {
      return res.status(200).json({
        success: true,
        message: "No reservations found for today",
      });
    }
    const responseReservations =
      reservations &&
      reservations
        .filter((reservation) => reservation.slotId !== null)
        .map((reservation) => ({
          id: reservation._id,
          slotId: reservation.slotId && reservation.slotId._id,
          date: reservation.slotId && reservation.slotId.date,
          time:
            reservation.slotId &&
            `${reservation.slotId.startTime} - ${reservation.slotId.endTime}`,
          price:
            reservation.slotId &&
            (reservation.slotId.isHoliday || reservation.slotId.isWeekend
              ? reservation.slotId.dynamicPrice
              : reservation.slotId.basePrice),
          futsalName: reservation.slotId && reservation.slotId.venueId.name,
          address:
            reservation.slotId &&
            `${reservation.slotId.venueId.address.street}, ${reservation.slotId.venueId.address.district}`,
          contact: reservation.slotId && reservation.slotId.venueId.contact,
          email: reservation.slotId && reservation.slotId.venueId.userId.email,
        }));
    res.status(200).json({
      success: true,
      message: "Reservations for today fetched successfully",
      data: responseReservations,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "An error occurred while fetching today's reservations",
      error: error.message,
    });
  }
};

// GET API: Fetch Upcoming Reservations Of A User
export const listUpcomingReservations = async (req, res) => {
  const { userId } = req.params;
  let today = new Date().toISOString().split("T")[0];
  today = adjustDateToNepalTimezone(today);
  let match = { date: { $gt: today } };
  let populateOptions = {
    path: "slotId",
    match: match && Object.keys(match).length ? match : null, // Include match if it's not empty
    select: "date startTime endTime isWeekend isHoliday basePrice dynamicPrice",
    strictPopulate: true,
    populate: {
      path: "venueId",
      select: "name location address contact",
      populate: {
        path: "userId",
        select: "email",
      },
    },
  };
  try {
    const reservations = await Reservation.find({ userId }).populate(
      populateOptions
    );
    if (reservations.length == 0) {
      return res.status(200).json({
        success: true,
        message: "No upcoming reservations found",
      });
    }
    const responseReservations =
      reservations &&
      reservations
        .filter((reservation) => reservation.slotId !== null)
        .map((reservation) => ({
          id: reservation._id,
          slotId: reservation.slotId && reservation.slotId._id,
          date: reservation.slotId && reservation.slotId.date,
          time:
            reservation.slotId &&
            `${reservation.slotId.startTime} - ${reservation.slotId.endTime}`,
          price:
            reservation.slotId &&
            (reservation.slotId.isHoliday || reservation.slotId.isWeekend
              ? reservation.slotId.dynamicPrice
              : reservation.slotId.basePrice),
          futsalName: reservation.slotId && reservation.slotId.venueId.name,
          address:
            reservation.slotId &&
            `${reservation.slotId.venueId.address.street}, ${reservation.slotId.venueId.address.district}`,
          contact: reservation.slotId && reservation.slotId.venueId.contact,
          email: reservation.slotId && reservation.slotId.venueId.userId.email,
        }));
    res.status(200).json({
      success: true,
      message: "Upcoming reservations fetched successfully",
      data: responseReservations,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "An error occurred while fetching upcoming reservations",
      error: error.message,
    });
  }
};

// GET API: Fetch Reservations History Of A User
export const listReservationHistory = async (req, res) => {
  const { userId } = req.params;
  let today = new Date().toISOString().split("T")[0];
  today = adjustDateToNepalTimezone(today);
  let match = { date: { $lt: today } };
  let populateOptions = {
    path: "slotId",
    match: match && Object.keys(match).length ? match : null, // Include match if it's not empty
    select: "date startTime endTime isWeekend isHoliday basePrice dynamicPrice",
    strictPopulate: true,
    populate: {
      path: "venueId",
      select: "name location address contact",
      populate: {
        path: "userId",
        select: "email",
      },
    },
  };
  try {
    const reservations = await Reservation.find({ userId }).populate(
      populateOptions
    );
    if (reservations.length == 0) {
      return res.status(200).json({
        success: true,
        message: "No upcoming reservations found",
      });
    }
    const responseReservations =
      reservations &&
      reservations
        .filter((reservation) => reservation.slotId !== null)
        .map((reservation) => ({
          id: reservation._id,
          slotId: reservation.slotId && reservation.slotId._id,
          date: reservation.slotId && reservation.slotId.date,
          time:
            reservation.slotId &&
            `${reservation.slotId.startTime} - ${reservation.slotId.endTime}`,
          price:
            reservation.slotId &&
            (reservation.slotId.isHoliday || reservation.slotId.isWeekend
              ? reservation.slotId.dynamicPrice
              : reservation.slotId.basePrice),
          futsalName: reservation.slotId && reservation.slotId.venueId.name,
          address:
            reservation.slotId &&
            `${reservation.slotId.venueId.address.street}, ${reservation.slotId.venueId.address.district}`,
          contact: reservation.slotId && reservation.slotId.venueId.contact,
          email: reservation.slotId && reservation.slotId.venueId.userId.email,
        }));
    res.status(200).json({
      success: true,
      message: "Upcoming reservations fetched successfully",
      data: responseReservations,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "An error occurred while fetching upcoming reservations",
      error: error.message,
    });
  }
};

// PUT API: Cancel Reservation
export const cancelReservation = async (req, res) => {
  const { id } = req.params;
  try {
    const reservation = await Reservation.findByIdAndDelete(id);
    if (reservation.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }
    const slot = await Slot.findByIdAndUpdate(
      reservation.slotId,
      { isReserved: false },
      { new: true }
    );
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Slot not found",
      });
    }
    getIoInstance().emit("reservation-cancelled")
    res.status(201).json({
      success: true,
      message: "Reservation cancelled successfully",
      data: reservation,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "An error occurred while cancelling reservation",
      error: error.message,
    });
  }
};
