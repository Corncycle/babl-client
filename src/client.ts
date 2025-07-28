import { io } from 'socket.io-client'
import { connectChat } from './chat/chat'
import { connectCanvas } from './canvas/canvas'
import { initializeRapier } from './space/rapier.js'
import { loadResources } from './loader.js'
import { setupLogin } from './login/login.js'

const loginContainer = document.querySelector('.login-container')!
const game = document.querySelector('.babl-container')!
const loginFeedback: HTMLSpanElement =
  document.querySelector('.login-feedback')!

;(async function initialize() {
  const socket = io('http://localhost:9090')

  socket.on('connect_error', (err) => {
    console.log('failed to connect to socket server')
    console.log(err)

    loginFeedback.innerText =
      'err: not able to find the land of babl. try to load the page once more'

    loginContainer.classList.add('disabled-darken')
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
  } catch (e) {
    // TODO: catch extreme failures here (extreme login issue, rapier, resources)
  }
})()
