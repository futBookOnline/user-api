import express from "express";
import {
  addReservation,
  listTodaysReservations,
  listUpcomingReservations,
  listReservationHistory,
  cancelReservation,
} from "../controllers/reservation.controller.js";
const router = express.Router();

router.post("/", addReservation);
router.get("/:userId/today", listTodaysReservations);
router.get("/:userId/upcoming", listUpcomingReservations);
router.get("/:userId/history", listReservationHistory);
router.put("/:id/cancel", cancelReservation)

export default router;
