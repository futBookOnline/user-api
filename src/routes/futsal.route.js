import express from "express"
import { getFutsal, listFutsals, listNearbyFutsals } from "../controllers/futsal.controller.js"

const router = express.Router()

router.get("/", listFutsals)
router.get("/nearby", listNearbyFutsals)
router.get("/:id", getFutsal)

export default router