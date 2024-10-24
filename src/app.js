import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import http from "http";
import cors from "cors";
import userRoute from "./routes/user.route.js";
import authRoute from "./routes/auth.route.js";
import futsalRoute from "./routes/futsal.route.js";
import futsalOwnerRoute from "./routes/futsal.owner.route.js";
import slotRoute from "./routes/slot.route.js";
import reservationRoute from "./routes/reservation.route.js";
import { setupWebSocket } from "./sockets/socket.handler.js";

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;
const hostname = "http://localhost:";
const mongoUrl = process.env.MONGODB_URI;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: [
      process.env.CLIENT_OWNER_URL,
      process.env.CLIENT_USER_URL,
      process.env.CLIENT_DEVELOPMENT_URL,
      process.env.VERCEL_CLIENT_USER_URL,
      process.env.NETLIFY_CLIENT_USER_URL,
      process.env.NETLIFY_CLIENT_OWNER_URL,
    ],
    credentials: true,
  })
);

//Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/futsals", futsalRoute);
app.use("/api/owners", futsalOwnerRoute);
app.use("/api/slots", slotRoute);
app.use("/api/reservations", reservationRoute);

// Database Connection
server.listen(port, () => {
  console.log(`Server is running at ${hostname}${port}`);
  mongoose
    .connect(mongoUrl)
    .then(() => {
      // Web Socket
      setupWebSocket(server);
      console.log("Database Connection Successful.");
    })
    .catch((error) => {
      console.log("Database Connection Failed: ", error.message);
    });
});
