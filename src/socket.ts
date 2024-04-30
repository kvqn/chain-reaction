import { ClientToServerEvents, ServerToClientEvents } from "@/socket-events"
import { io, Socket } from "socket.io-client"

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  "http://localhost:3000",
)

socket.on("connect", () => {
  console.log("Connected to server")
})

export { socket }
