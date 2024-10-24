import express from "express";
import {
  listUsers,
  addUser,
  changePassword,
  activateEmail,
  deactivateEmail,
  resetPassword,
  updateUser,
  getUser,
  registrationConfirmationMail
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", listUsers);
router.get("/:id", getUser);
router.post("/", addUser);
router.put("/:id/change-password", changePassword);
router.put("/:id/reset-password", resetPassword);
router.put("/:id/activate-email", activateEmail);
router.put("/:id/deactivate-email", deactivateEmail);
router.put("/:id/profile-picture", addUser);
router.put("/:id", updateUser);
router.post("/registration-mail", registrationConfirmationMail)

export default router;
