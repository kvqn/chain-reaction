import { useGameContext } from "@/context"
import { cn } from "@/lib/utils"
import { socket } from "@/socket"
import type { Game } from "@/socket-events"

export function Settings() {
  return (
    <div className=" w-[300px] rounded-lg border-4 border-neutral-600 p-4">
      <h1 className="text-center text-2xl">Settings</h1>
      <div className="flex flex-col p-2">
        <div className="flex items-center justify-center gap-2">
          <h2 className="mr-2 text-xl">Grid Size</h2>
          <GridSizeButton rows={16} cols={8} />
          <GridSizeButton rows={32} cols={16} />
        </div>
      </div>
      <StartGameButton />
    </div>
  )
}

function GridSizeButton({ rows, cols }: { rows: number; cols: number }) {
  const { settings } = useGameContext()
  return (
    <div
      onClick={() => {
        socket.emit("change-settings", {
          settings: {
            gridSize: {
              rows: rows,
              cols: cols,
            } as Game["settings"]["gridSize"],
          },
        })
        console.log("test")
      }}
      className={cn(
        "w-fit cursor-pointer rounded-md bg-neutral-700 px-2 py-1 hover:bg-neutral-600",
        {
          "border-2 border-neutral-500":
            settings.gridSize.rows === rows && settings.gridSize.cols === cols,
        },
      )}
    >
      {`${rows} x ${cols}`}
    </div>
  )
}

function StartGameButton() {
  return (
    <div
      className="mt-2 flex w-full justify-center"
      onClick={() => {
        socket.emit("start-game")
      }}
    >
      <button className="rounded-md bg-red-900 px-2 py-1 hover:bg-red-800">
        Start Game
      </button>
    </div>
  )
}
