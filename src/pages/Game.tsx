import { NameInput } from "@/components/NameInput"
import { Players } from "@/components/Players"
import { useGameContext } from "@/context"
import { cn } from "@/lib/utils"
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

  return (
    <div className="flex">
      <Players />
      <CenterBoard />
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

function Settings() {
  const { settings } = useGameContext()

  return (
    <div className="rounded-lg border-4 border-neutral-700 p-4">
      <h1>Settings</h1>
      <div>
        <p>Grid Size</p>
        <div>
          <div
            onClick={() => {
              socket.emit("change-settings", {
                settings: { gridSize: { rows: 16, cols: 8 } },
              })
              console.log("test")
            }}
            className={cn({
              "bg-red-100":
                settings.gridSize.rows === 16 && settings.gridSize.cols === 8,
            })}
          >
            16 x 8
          </div>
          <div
            onClick={() => {
              socket.emit("change-settings", {
                settings: { gridSize: { rows: 32, cols: 16 } },
              })
              console.log("test")
            }}
            className={cn({
              "bg-red-100":
                settings.gridSize.rows === 32 && settings.gridSize.cols === 16,
            })}
          >
            32 x 16
          </div>
        </div>
      </div>
      <button>Start Game</button>
    </div>
  )
}

function Board() {
  return <div>Board</div>
}
