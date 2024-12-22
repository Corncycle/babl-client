// a utility class to help with sending events back to the server
// this class should be used for all events send to the server
// so that events can be batched together instead of sending events
// every frame

import { Socket } from 'socket.io-client'
import { PlayerUpdate } from './player.js'

export default class EventHelper {
  playerUpdateEvent?: PlayerUpdate

  constructor(socket: Socket, eventsPerSecond: number) {
    this.playerUpdateEvent = undefined

    setInterval(() => {
      if (this.playerUpdateEvent) {
        socket.emit('playerUpdate', this.playerUpdateEvent)
        this.playerUpdateEvent = undefined
      }
    }, 1000 / eventsPerSecond)
  }

  setLocalPlayerPosition(entityId: number, x: number, y: number, z: number) {
    if (!this.playerUpdateEvent) {
      this.playerUpdateEvent = { entityId, x, y, z }
    } else {
      this.playerUpdateEvent.x = x
      this.playerUpdateEvent.y = y
      this.playerUpdateEvent.z = z
    }
  }

  setLocalPlayerVelocity(xv: number, yv: number, zv: number) {
    if (!this.playerUpdateEvent) {
      return
    }
    this.playerUpdateEvent.xv = xv
    this.playerUpdateEvent.yv = yv
    this.playerUpdateEvent.zv = zv
  }
}
