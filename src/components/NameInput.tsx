import { useGameContext } from "@/context"
import { Input } from "./ui/input"
import { CheckIcon } from "@heroicons/react/16/solid"

export function NameInput() {
  const { setName } = useGameContext()
  let _name = ""

  function SaveName() {
    setName(_name)
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-center text-2xl">What should we call you?</h2>
      <div className="flex items-center justify-center gap-2">
        <Input
          className="h-10 w-40"
          onChange={(e) => (_name = e.target.value)}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") SaveName()
          }}
        />
        <div
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-emerald-600 bg-emerald-500 transition hover:bg-emerald-600"
          onClick={SaveName}
        >
          <CheckIcon />
        </div>
      </div>
    </div>
  )
}
