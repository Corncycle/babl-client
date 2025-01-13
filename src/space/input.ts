export const inputMappings: { [keyName: string]: string } = {
  w: 'up',
  a: 'left',
  s: 'down',
  d: 'right',
  Enter: 'enter',
}

// MAKE SURE TO SET tab-index="0" ON THE CONTAINER DIV TO PROPERLY CAPTURE KEY INPUT
export class InputHelper {
  pressed: { [pressedValue: string]: boolean }

  // setting justPressed and justReleased values to `true` can be
  // done in the `keydown` and `keyup` event listeners. handling
  // resetting them to `false` is dependent on game tick rate, so
  // ensure that a call to `clearJustPressedAndReleased` always
  // exists in the ticking game loop
  justPressed: { [pressedValue: string]: boolean }
  justReleased: { [pressedValue: string]: boolean }

  constructor(container: HTMLDivElement) {
    this.pressed = {}
    this.justPressed = {}
    this.justReleased = {}

    for (const v of Object.values(inputMappings)) {
      this.pressed[v] = false
      this.justPressed[v] = false
      this.justReleased[v] = false
    }

    container.addEventListener('keydown', (e) => {
      if (e.key in inputMappings) {
        this.pressed[inputMappings[e.key]] = true
        this.justPressed[inputMappings[e.key]] = true
      }
    })

    container.addEventListener('keyup', (e) => {
      if (e.key in inputMappings) {
        this.pressed[inputMappings[e.key]] = false
        this.justReleased[inputMappings[e.key]] = true
      }
    })

    const clearInput = () => {
      for (const k in this.pressed) {
        this.justPressed[k] = false
        this.pressed[k] = false
        this.justReleased[k] = true
      }
    }

    window.oncontextmenu = clearInput
  }

  clearJustPressed() {
    for (const k in this.justPressed) {
      this.justPressed[k] = false
    }
  }

  clearJustReleased() {
    for (const k in this.justReleased) {
      this.justReleased[k] = false
    }
  }

  // place a call to this at the end of the game loop
  clearJustPressedAndReleased() {
    this.clearJustPressed()
    this.clearJustReleased()
  }
}
