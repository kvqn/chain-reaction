import { useGameContext } from "@/context"
import { cn } from "@/lib/utils"
import { socket } from "@/socket"
import { useEffect, useState } from "react"

const AtomSizePX = 10

export function Cell({ row, col }: { row: number; col: number }) {
  const [blobCount, setBlob] = useState(0)
  const { cellCallbacks, settings, turn } = useGameContext()
  const [color, setColor] = useState<"red" | "blue" | null>(null)
  const [explode, setExplode] = useState(false)

  useEffect(() => {
    cellCallbacks.current[row]![col] = (
      new_color: "red" | "blue",
      direct: boolean,
    ) => {
      console.log("cellCallbacks", row, col, new_color, direct)
      setColor(new_color)
      setBlob((prev) => (prev + 1) % 5)
    }
  }, [])

  function callIfPossible(r: number, c: number) {
    if (!cellCallbacks.current[r] || !cellCallbacks.current[r]![c]) return
    cellCallbacks.current[r]![c]!(color!, false)
  }

  useEffect(() => {
    if (
      ((row == 0 || row == settings.gridSize.rows - 1) &&
        (col == 0 || col == settings.gridSize.cols - 1) &&
        blobCount == 2) ||
      ((row == 0 ||
        row == settings.gridSize.rows - 1 ||
        col == 0 ||
        col == settings.gridSize.cols - 1) &&
        blobCount == 3) ||
      blobCount == 4
    ) {
      console.log("explode")
      setBlob(0)
      setExplode(true)
      setTimeout(() => {
        setExplode(false)
        callIfPossible(row, col + 1)
        callIfPossible(row - 1, col)
        callIfPossible(row + 1, col)
        callIfPossible(row, col - 1)
      }, 1000)
    }
  }, [blobCount])

  return (
    <div
      onClick={() => {
        if (turn != socket.id) return
        console.log("placing")
        socket.emit("place", { row, col })
      }}
      className="relative flex h-[40px] w-[40px] items-center justify-center"
    >
      {explode && <Explode color={color!} />}
      <Blob count={blobCount} color={color!} />
    </div>
  )
}

function Blob({ count, color }: { count: number; color: "red" | "blue" }) {
  if (count == 0) return <div></div>
  if (count == 1) return <SingleBlob color={color} />
  if (count == 2) return <DoubleBlob color={color} />
  if (count == 3) return <TripleBlob color={color} />
  if (count == 4) return <TripleBlob color={color} />
}

function SingleBlob({ color }: { color: "red" | "blue" }) {
  return <Atom color={color} />
}

function DoubleBlob({ color }: { color: "red" | "blue" }) {
  return (
    <div className="relative animate-spin">
      <Atom color={color} className="-translate-x-1/2" />
      <Atom color={color} className="translate-x-1/2" />
    </div>
  )
}

function cos(deg: number) {
  return Math.cos((deg * Math.PI) / 180)
}

function TripleBlob({ color }: { color: "red" | "blue" }) {
  return (
    <div className="relative animate-spin">
      <Atom
        color={color}
        className="absolute"
        style={{
          transform: `translateX(${(-0.5 + cos(30)) * 100}%)`,
        }}
      />
      <Atom
        color={color}
        className="absolute"
        style={{
          transform: `translateX(${(-0.5 - cos(30)) * 100}%)`,
        }}
      />
      <Atom
        color={color}
        className="absolute"
        style={{
          transform: `translateX(${-0.5 * 100}%) translateY(${(-0.5 - 1) * 100}%)`,
        }}
      />
    </div>
  )
}

export function Explode({ color }: { color: "red" | "blue" }) {
  const [go, setGo] = useState(false)

  useEffect(() => {
    setTimeout(() => setGo(true), 0)
  }, [])

  return (
    <>
      <Atom
        color={color}
        className={cn("absolute transition-transform duration-500", {
          "translate-x-[400%]": go,
        })}
      />

      <Atom
        color={color}
        className={cn("absolute transition-transform duration-500", {
          "-translate-x-[400%]": go,
        })}
      />
      <Atom
        color={color}
        className={cn("absolute transition-transform duration-500", {
          "translate-y-[400%]": go,
        })}
      />
      <Atom
        color={color}
        className={cn("absolute transition-transform duration-500", {
          "-translate-y-[400%]": go,
        })}
      />
    </>
  )
}

export function Board() {
  const { settings } = useGameContext()
  const rows = settings.gridSize.rows
  const cols = settings.gridSize.cols
  return (
    <div className="flex flex-col divide-y overflow-hidden border">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex divide-x">
          {Array.from({ length: cols }).map((_, c) => (
            <Cell key={c} row={r} col={c} />
          ))}
        </div>
      ))}
    </div>
  )
}

function Atom({
  color,
  className,
  style,
}: {
  color: "red" | "blue"
  className?: string
  style?: React.CSSProperties
}) {
  console.log("atom", color)
  return (
    <div
      className={cn(
        "rounded-full",
        {
          "bg-red-500": color === "red",
          "bg-blue-500": color === "blue",
        },
        className,
      )}
      style={{
        height: `${AtomSizePX}px`,
        width: `${AtomSizePX}px`,
        ...style,
      }}
    />
  )
}
