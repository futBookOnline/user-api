import 'dotenv/config'
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET

// password hashing function
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt()
    const result = await bcrypt.hash(password, salt)
    return result
  }
  
  export const comparePassword = async(password, dbPassword) => {
    const result = await bcrypt.compare(password, dbPassword)
    return result
  }

  // Create JWT Token
const maxAge = 3 * 24 * 60 * 60;
export const createToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: maxAge });
};