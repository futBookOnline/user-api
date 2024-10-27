import { Error } from "mongoose";
import User from "../models/user.model.js";
import { comparePassword, hashPassword } from "../utils/auth.utils.js";
import { sendEmail } from "../utils/node.mailer.utils.js";
const { randomInt } = await import("node:crypto");

// Handle Errors
export const handleErrors = (err) => {
  let errors = { email: "", password: "" };
  if (err.code === 11000) {
    errors.email = "This email is already registered.";
    return errors;
  }
  if (err.message.includes("User validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
};

// GET API: Fetch All Users
export const listUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No users found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "An error occurred while fetching users",
      error: error.message,
    });
  }
};

// GET API: Fetch User By Id
export const getUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id).select("-password");
    user
      ? res.status(200).json({
          success: true,
          message: "User fetched successfully",
          data: user,
        })
      : res.status(404).json({
          success: false,
          message: "User Not Found",
        });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "An error occurred while fetching users",
      message: error.message,
    });
  }
};

// POST API: Register User
export const addUser = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    const user = await User.register(fullName, email, password);
    const { password: hashedPassword, ...rest } = user._doc;
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: rest,
    });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({
      success: false,
      message: "An error occurred while creating user",
      error: errors,
    });
  }
};

// PUT API: Activate Email
export const activateEmail = async (req, res) => {
  const { id } = req.params;
  try {
    const { isActive } = await User.findById(id).select("isActive");
    if (isActive) {
      return res.status(200).json({
        success: true,
        message: "User email is already active",
      });
    }
    const user = await User.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    ).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Email activated successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "An error occurred while activating email",
      message: error.message,
    });
  }
};

// PUT API: Deactivate Email
export const deactivateEmail = async (req, res) => {
  const { id } = req.params;
  try {
    const { isActive } = await User.findById(id).select("isActive");
    if (!isActive) {
      return res.status(200).json({
        success: true,
        message: "User email is already inactive",
      });
    }
    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Email deactivated successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "An error occurred while deactivating email",
      message: error.message,
    });
  }
};

// POST API: Change Password
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const { id } = req.params;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: !oldPassword
        ? "Old password cannot be empty"
        : "New password cannot be empty",
    });
  }
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const checkOldPassword = await comparePassword(oldPassword, user.password);
    if (!checkOldPassword)
      return res.status(401).json({
        success: false,
        message: "Wrong old password",
      });
    const checkNewPassword = await comparePassword(newPassword, user.password);
    if (checkNewPassword)
      return res.status(401).json({
        success: false,
        message: "New password and old password cannot be same",
      });
    const hashedPassword = await hashPassword(newPassword);
    const updatePassword = await User.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true }
    );
    if (!updatePassword) {
      return res.status(400).json({
        success: false,
        message: "Password update failed",
      });
    }
    const { password: hashedPass, ...rest } = updatePassword._doc;
    res.status(200).json({
      success: true,
      message: "Password changed successfully",
      data: rest,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "An error occurred while updating password",
      error: error.message,
    });
  }
};

// PUT API: Reset Password
export const resetPassword = async (req, res) => {
  const { password } = req.body;
  const { id } = req.params;
  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Password cannot be empty",
    });
  }
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User is not active",
      });
    }

    const checkOldPassword = await comparePassword(password, user.password);
    if (checkOldPassword)
      return res.status(401).json({
        success: false,
        message: "New password cannot be same as old password",
      });

    const hashedPassword = await hashPassword(password);
    const updateUser = await User.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true }
    );
    if (!updateUser) {
      return res.status(400).json({
        success: false,
        message: "Password reset failed",
      });
    }
    const { password: hashedPass, ...rest } = updateUser._doc;
    res.status(200).json({
      success: true,
      message: "Password reset successfully",
      data: rest,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "An error occurred while updating password",
      error: error.message,
    });
  }
};

// PUT API: Update User Info
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;
  try {
    const updateUser = await User.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );
    if (!updateUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const { password, ...rest } = updateUser._doc;
    res.status(200).json({
      success: true,
      message: "User info updated successfully",
      data: rest,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "An error occurred while updating password",
      error: error.message,
    });
  }
};

// GET API: Send User Registration Confirmation Mail
export const registrationConfirmationMail = async (req, res) => {
  const { email, fullName } = req.body;
  console.log("EMAIL: ", email);
  console.log("FULLNAME: ", fullName);
  const verificationCode = randomInt(100000, 1000000);
  //email, subject, message
  const subject = "Verification Code";
  const message = `
Dear ${fullName},

Thank you for registering with us! To complete your registration, please verify your email address by entering the verification code below:

**Verification Code:** ${verificationCode}

If you did not request this verification code, please ignore this email.

Thank you!

Best regards,  
FutsalFinder Pvt. Ltd. 
Banepa, Nepal.
`;
  try {
    const mail = await sendEmail(email, subject, message);
    if (mail) {
      return res.status(200).json({
        success: true,
        message: "Verification mail sent successfully",
        data: verificationCode,
      });
    }
    res.status(400).json({
      success: false,
      message: "Verification mail failed",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "An error occurred while sending verification mail",
      error: error.message,
    });
  }
};

// POST API: Find UserId By Email
export const getUserIdByEmail = async (req, res) => {
  const { email } = req.body;
  console.log("EMAIL: ", email)
  if (!email) throw Error("Email cannot be empty");
  try {
    const user = await User.findOne({ email }).select("_id");
    !user
      ? res.status(404).json({
          success: false,
          message: "Email does not exist",
        })
      : res.status(200).json({
          success: true,
          message: "User Id fetched successfully",
          data: user,
        });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "An error occurred while fetching user id",
      error: error.message,
    });
  }
};
