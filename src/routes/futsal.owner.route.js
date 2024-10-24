import express from "express"
import { listFutsalOwners } from "../controllers/futsal.owner.controller.js"

const router = express.Router()

router.get("/", listFutsalOwners)

export default router