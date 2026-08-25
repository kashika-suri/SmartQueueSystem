import { io } from "socket.io-client";

const socket = io(
  "https://smartqueuesystem-219o.onrender.com",
  {
    transports: ["websocket", "polling"],
    autoConnect: true,
  }
);

export default socket;