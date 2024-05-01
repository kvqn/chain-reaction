import { NameInput } from "@/components/NameInput"
import { Players } from "@/components/Players"
import { Settings } from "@/components/settings"
import { useGameContext } from "@/context"
import { socket } from "@/socket"
import { useEffect } from "react"

export function Game() {
  const { name, room } = useGameContext()

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
        This room doesn't exist.
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
      <div className="flex w-[70%] items-center justify-center p-4">
        <CenterBoard />
      </div>
    </div>
  )
}

function CenterBoard() {
  const { state } = useGameContext()

  if (state === "lobby") {
    return <Settings />
  }

  return <Board />
}

function Board() {
  return <div>Board</div>
}
