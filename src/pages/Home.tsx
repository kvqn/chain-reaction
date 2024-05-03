import { Explode } from "@/components/Board"
import { Link } from "react-router-dom"

export function Home() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <h1 className="text-6xl font-semibold">Chain Reaction</h1>
      <Link to="/game" className="text-2xl font-semibold">
        Play
      </Link>
      <Explode />
    </div>
  )
}
