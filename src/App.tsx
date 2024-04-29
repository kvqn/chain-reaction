import { Route, Routes } from "react-router-dom"
import "./App.css"
import { Home } from "./pages/Home"
import { Game } from "./pages/Game"
import { GameContextProvider } from "./context"

function App() {
  return (
    <div className="font-clash flex h-screen flex-col items-center justify-center bg-neutral-800 text-white">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/game"
          element={
            <GameContextProvider>
              <Game />
            </GameContextProvider>
          }
        />
      </Routes>
    </div>
  )
}

export default App
