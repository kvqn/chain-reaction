import {
  MutableRefObject,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { Game, Player } from "./socket-events"
import { useSearchParams } from "react-router-dom"
import { socket } from "./socket"

const GameContext = createContext<{
  name: string
  setName: React.Dispatch<React.SetStateAction<string>>
  room: string | null
  roomError: string | null
  players: Player[]
  settings: Game["settings"]
  state: Game["state"]
  cellCallbacks: MutableRefObject<
    Array<Array<(new_color: "red" | "blue", direct: boolean) => void>>
  >
  turn: string | null
} | null>(null)

export function GameContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const _name = localStorage.getItem("name") ?? ""
  const [name, setName] = useState(_name)
  const [searchParams, setSearchParams] = useSearchParams()
  const room = searchParams.get("room")
  const [players, setPlayers] = useState<Player[]>([])
  const [settings, setSettings] = useState<Game["settings"]>({
    gridSize: {
      rows: 16,
      cols: 8,
    },
  })
  const [state, setState] = useState<Game["state"]>("lobby")
  const [roomError, setRoomError] = useState<string | null>(null)
  const cellCallbacks = useRef<
    Array<Array<(new_color: "red" | "blue", direct: boolean) => void>>
  >([[]])
  const [turn, setTurn] = useState<string | null>(null)

  useEffect(() => {
    socket.on("room-data", (data) => {
      if (data.roomId != null) setSearchParams({ room: data.roomId })
      else {
        setSearchParams({})
        setRoomError(data.error)
      }
    })

    socket.on("update-players", ({ players }) => {
      setPlayers(players)
    })

    socket.on("change-settings", ({ settings }) => {
      setSettings(settings)
    })

    socket.on("start-game", ({ players }) => {
      console.log("start-game", players)
      setPlayers(players)
      setState("playing")
      cellCallbacks.current = Array.from(
        { length: settings.gridSize.rows },
        () => Array.from({ length: settings.gridSize.cols }, () => () => {}),
      )
    })

    socket.on("change-turn", ({ player }) => {
      console.log("change-turn", player.name)
      setTurn(player.socketId)
    })

    socket.on("place", ({ row, col, color }) => {
      console.log("place", row, col, color)
      cellCallbacks.current[row]![col]!(color, true)
    })

    socket.on("game-over", ({ winner }) => {
      console.log("game-over", winner.name)
      setState("game-over")
    })
  }, [])

  return (
    <GameContext.Provider
      value={{
        name,
        room,
        players,
        settings,
        setName,
        state,
        roomError,
        cellCallbacks,
        turn,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGameContext() {
  const context = useContext(GameContext)

  if (context === null) {
    throw new Error("useGameContext must be used within a GameContextProvider")
  }
  return context
}
