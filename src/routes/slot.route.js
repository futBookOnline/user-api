import express from "express";
import { listSlots } from "../controllers/slot.controller.js";
const router = express.Router();

router.get("/:venueId", listSlots);

export default router;
