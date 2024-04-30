import { NameInput } from "@/components/NameInput"
import { useGameContext } from "@/context"
import { socket } from "@/socket"
import { useEffect } from "react"

export function Game() {
  const { name, players, room } = useGameContext()

  useEffect(() => {
    if (!name) return
    if (room)
      socket.emit("join-room", {
        roomId: room,
        playerName: name,
      })
    else socket.emit("create-room", { playerName: name })
  }, [name])

  if (name === "") {
    return <NameInput />
  }

  return (
    <div>
      Hi {name}
      Room {room}
      Players {JSON.stringify(players)}
    </div>
  )
}
