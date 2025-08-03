import { io } from 'socket.io-client'
import { connectChat } from './chat/chat'
import { connectCanvas } from './canvas/canvas'
import { initializeRapier } from './space/rapier.js'
import { loadResources } from './textureLoader.js'
import { setupLogin } from './login/login.js'
import { connectItemPane } from './inventory/items.js'

// defined in webpack configs, depending on environment
declare const ENV_SERVER_ADDRESS: string

const loginContainer: HTMLDivElement =
  document.querySelector('.login-container')!
const game = document.querySelector('.babl-container')!
const loginFeedback: HTMLSpanElement =
  document.querySelector('.login-feedback')!

const showErrorOnLogin = (msg: string) => {
  loginFeedback.innerText = msg

  game.classList.add('disabled')

  loginContainer.focus()

  loginContainer.classList.remove('hidden')
  loginContainer.classList.add('disabled-darken')
}

;(async function initialize() {
  const socket = io(ENV_SERVER_ADDRESS, { reconnectionAttempts: 3 })

  socket.on('connect_error', (err) => {
    console.log('failed to connect to socket server')
    console.log(err)

    showErrorOnLogin(
      'err: not able to find the land of babl. try to load the page once more'
    )
  })

  const loginPromise = setupLogin(socket)

  const rapierPromise = initializeRapier()

  const resourcesPromise = loadResources()

  const allPromises = Promise.all([
    loginPromise,
    rapierPromise,
    resourcesPromise,
  ])

  try {
    const results = await allPromises

    loginContainer.classList.add('hidden')
    game.classList.remove('disabled')

    const space = connectCanvas(socket)
    connectChat(socket, space)
    connectItemPane(socket, space)
  } catch (e: any) {
    showErrorOnLogin(e.message)
    // TODO: catch extreme failures here (extreme login issue, rapier, resources)
  }
})()
