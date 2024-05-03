import { Board } from "@/components/Board"
import { NameInput } from "@/components/NameInput"
import { Players } from "@/components/Players"
import { Settings } from "@/components/settings"
import { useGameContext } from "@/context"
import { socket } from "@/socket"
import { useEffect } from "react"

export function Game() {
  const { name, room, roomError, state } = useGameContext()

  useEffect(() => {
    if (!name) return
    if (room) {
      console.log("joining room", room)
      socket.emit("join-room", {
        roomId: room,
        playerName: name,
      })
    } else {
      console.log("creating room")
      socket.emit("create-room", { playerName: name })
    }
  }, [name])

  if (name === "") {
    return <NameInput />
  }

  if (room === null) {
    return (
      <div className="flex flex-col">
        <p className="text-center">{roomError}</p>
        <button
          onClick={() => {
            socket.emit("create-room", { playerName: name })
          }}
          className="rounded-md bg-red-900 px-2 py-1 hover:bg-red-800"
        >
          Create new room
        </button>
      </div>
    )
  }

  return (
    <div className="flex w-full justify-evenly">
      <Players />
      <div className="flex w-[70%] flex-col items-center justify-center p-4">
        {state === "game-over" && <div>Game Over</div>}
        <CenterBoard />
      </div>
    </div>
  )
}

function CenterBoard() {
  const { state, players } = useGameContext()
  const me = players.find((p) => p.socketId === socket.id)

  if (state === "lobby") {
    if (me?.isLeader) return <Settings />
    return <div>Waiting for leader to start the game...</div>
  }

  if (state === "playing") return <Board />
}
