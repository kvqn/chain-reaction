import { ClientToServerEvents, ServerToClientEvents } from "@/socket-events"
import { io, Socket } from "socket.io-client"

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  import.meta.env.VITE_SOCKET_SERVER!,
)

socket.on("connect", () => {
  console.log("Connected to server")
})

export { socket }
