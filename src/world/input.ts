export interface BooleanDirection {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
}

export const inputMappings: { [keyName: string]: string } = {
  w: 'up',
  a: 'left',
  s: 'down',
  d: 'right',
}

export class InputHelper {
  pressed: { [pressedValue: string]: boolean }

  // setting justPressed and justReleased values to `true` can be
  // done in the `keydown` and `keyup` event listeners. handling
  // setting them to `false` is dependent on game tick rate, so
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

  clearJustPressedAndReleased() {
    this.clearJustPressed()
    this.clearJustReleased()
  }
}

// export const setupInput = (container: HTMLDivElement) => {
//   const pressed: BooleanDirection = {
//     left: false,
//     right: false,
//     up: false,
//     down: false,
//   }

//   container.addEventListener('keydown', (e) => {
//     if (e.key === 'w') {
//       pressed.up = true
//     }
//     if (e.key === 'a') {
//       pressed.left = true
//     }
//     if (e.key === 's') {
//       pressed.down = true
//     }
//     if (e.key === 'd') {
//       pressed.right = true
//     }
//   })

//   container.addEventListener('keyup', (e) => {
//     if (e.key === 'w') {
//       pressed.up = false
//     }
//     if (e.key === 'a') {
//       pressed.left = false
//     }
//     if (e.key === 's') {
//       pressed.down = false
//     }
//     if (e.key === 'd') {
//       pressed.right = false
//     }
//   })

//   const clearInput = () => {
//     for (const dir of ['up', 'down', 'left', 'right']) {
//       pressed[dir as 'up'] = false
//     }
//   }

//   container.addEventListener('focusout', clearInput)
//   window.oncontextmenu = clearInput

//   return { pressed }
// }
