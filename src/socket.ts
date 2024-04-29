import { io } from "socket.io-client"

const socket = io(process.env.SOCKET_SERVER!)

socket.on("connect", () => {
  console.log("Connected to server")
})
