import { useGameContext } from "@/context"

export function Players() {
  const { players } = useGameContext()

  return (
    <div className="w-[100px] rounded-lg border p-2">
      <p className="text-center">Players</p>
      {players.map((player) => (
        <div className="flex justify-between" key={player.socketId}>
          <p>{player.name}</p>
          <p>{player.color}</p>
        </div>
      ))}
    </div>
  )
}
