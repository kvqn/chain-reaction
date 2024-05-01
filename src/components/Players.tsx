import { useGameContext } from "@/context"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCrown } from "@fortawesome/free-solid-svg-icons"
import { socket } from "@/socket"
import { cn } from "@/lib/utils"

export function Players() {
  const { players } = useGameContext()

  return (
    <div className="flex w-[300px] flex-col gap-2 rounded-lg border-4 border-neutral-600 p-4">
      <p className="text-center text-xl">Players</p>
      {players.map((player) => (
        <div
          className={cn(
            "flex items-center justify-between rounded-md bg-neutral-700 p-2",
            {
              "bg-red-900": player.color === "red",
              "bg-blue-900": player.color === "blue",
            },
          )}
          key={player.socketId}
        >
          <p>{player.name}</p>
          <p>{player.color}</p>
          <div className="flex items-center gap-2">
            {player.socketId === socket.id && (
              <p className="text-sm text-neutral-400">(You)</p>
            )}
            {player.isLeader && <FontAwesomeIcon icon={faCrown} />}
          </div>
        </div>
      ))}
    </div>
  )
}
