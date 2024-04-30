/* eslint-disable @typescript-eslint/no-namespace */

export type Player = {
  socketId: string
  name: string
  color: "red" | "blue" | null
}

export namespace ClientEvents {
  export type JoinRoom = {
    roomId: string
    playerName: string
  }

  export type CreateRoom = {
    playerName: string
  }

  export type Place = {
    x: number
    y: number
  }

  export type ChangeColor = {
    color: "red" | "blue"
  }

  export type Any = JoinRoom | CreateRoom | Place | ChangeColor
}

export namespace ServerEvents {
  export type RoomData = {
    roomId: string
    players: Player[]
    leader: Player
    events: Array<Any>
  }

  export type PlayerJoined = {
    player: Player
  }

  export type ChangeColor = {
    player: Player
    color: "red" | "blue"
  }

  export type Place = {
    player: Player
    x: number
    y: number
  }

  export type Any = RoomData | PlayerJoined | ChangeColor | Place
}
