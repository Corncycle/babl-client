export interface BooleanDirection {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
}

export const setupInput = (container: HTMLDivElement) => {
  const pressed: BooleanDirection = {
    left: false,
    right: false,
    up: false,
    down: false,
  }

  container.addEventListener('keydown', (e) => {
    if (e.key === 'w') {
      pressed.up = true
    }
    if (e.key === 'a') {
      pressed.left = true
    }
    if (e.key === 's') {
      pressed.down = true
    }
    if (e.key === 'd') {
      pressed.right = true
    }
  })

  container.addEventListener('keyup', (e) => {
    if (e.key === 'w') {
      pressed.up = false
    }
    if (e.key === 'a') {
      pressed.left = false
    }
    if (e.key === 's') {
      pressed.down = false
    }
    if (e.key === 'd') {
      pressed.right = false
    }
  })

  const clearInput = () => {
    for (const dir of ['up', 'down', 'left', 'right']) {
      pressed[dir as 'up'] = false
    }
  }

  container.addEventListener('focusout', clearInput)
  window.oncontextmenu = clearInput

  return { pressed }
}
