import { Route, Routes } from "react-router-dom"
import "./App.css"
import { Home } from "./pages/Home"
import { Game } from "./pages/Game"
import { GameContextProvider } from "./context"
import { Toaster } from "react-hot-toast"

function App() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-neutral-800 font-clash text-white">
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
      <Toaster />
    </div>
  )
}

export default App
