import { io } from "socket.io-client";

const socket = io(
  "https://smartqueuesystem-production.up.railway.app",
  {
    transports: ["websocket", "polling"],
    autoConnect: true,
  }
);

export default socket;