import pkg from "validator";
import mongoose from "mongoose";
import { hashPassword, comparePassword } from "../utils/auth.utils.js";
const { isEmail } = pkg;

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please enter email."],
      unique: true,
      lowercase: true,
      validate: [isEmail, "Please enter valid email."],
    },
    fullName: {
      type: String,
      required: [true, "Please enter your name"],
    },
    password: {
      type: String,
      minLength: [8, "Password must be atleast 8 characters long."],
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    lastLoggedIn: {
      type: Date,
      default: new Date(),
    },
    isGoogleUser: {
      type: Boolean,
      default: false,
    },
    imageUrl: {
      type: String,
      default:
        "https://img.freepik.com/free-vector/user-circles-set_78370-4704.jpg",
    },
    dateOfBirth: {
      type: Date,
    },
    contact: {
      type: Number,
    },
    gender: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Hash a password before doc is saved to db
userSchema.pre("save", async function (next) {
  if (this.password) {
    this.password = await hashPassword(this.password);
  }
  next();
});

// Static method to register user
userSchema.statics.register = async function (fullName, email, password) {
  const user = await this.create({ fullName, email, password });
  if (!user) throw Error("Registration failed");
  return user;
};

// Static method to login user
userSchema.statics.login = async function (email, password) {
  if (!email) throw Error("Email cannot be empty");
  if (!password) throw Error("Password cannot be empty");
  const user = await this.findOne({ email });
  if (!user) {
    throw Error("Email does not exist");
  }
  if (!user.isActive) {
    throw Error("Email is not active");
  }
  if (user.isGoogleUser) throw Error("Continue with google sign in");
  const auth = await comparePassword(password, user.password);
  if (auth) {
    return user;
  }
  throw Error("Invalid login credentials");
};

const User = mongoose.model("FutsalUser", userSchema);
export default User;
