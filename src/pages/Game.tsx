import { NameInput } from "@/components/NameInput"
import { useGameContext } from "@/context"
import { io } from "socket.io-client"

const socket = io("http://localhost:3000")

socket.on("connect", () => {
  console.log("Connected to server")
})

export function Game() {
  const { name } = useGameContext()
  if (name === "") {
    return <NameInput />
  }

  console.log("some logic if name is set")
  return <div>Hi {name}</div>
}
