import { Server } from "socket.io";
let io;
export const setupWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        process.env.CLIENT_DEVELOPMENT_URL,
        process.env.CLIENT_USER_URL,
        process.env.CLIENT_OWNER_URL,
        process.env.VERCEL_CLIENT_USER_URL,
        process.env.NETLIFY_CLIENT_USER_URL,
        process.env.NETLIFY_CLIENT_OWNER_URL,
      ],
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });
  io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};

export const getIoInstance = () => io