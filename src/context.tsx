import { createContext, useContext, useState } from "react"

const GameContext = createContext<{
  name: string
  setName: React.Dispatch<React.SetStateAction<string>>
} | null>(null)

export function GameContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const _name = localStorage.getItem("name") ?? ""
  const [name, setName] = useState(_name)
  return (
    <GameContext.Provider value={{ name, setName }}>
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
