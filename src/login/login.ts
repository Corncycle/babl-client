import { Socket } from 'socket.io-client'

const loginContainer: HTMLDivElement =
  document.querySelector('.login-container')!
const loginFormElm: HTMLFormElement = document.querySelector('.login-form')!
const loginInput: HTMLInputElement = document.querySelector('.login-input')!
const loginButton: HTMLButtonElement = document.querySelector('.login-button')!
const loginFeedback: HTMLSpanElement =
  document.querySelector('.login-feedback')!

let loginTimeout: NodeJS.Timeout
let loginLocked: boolean = false
let failedLoginReason: string | undefined

const lockLogin = () => {
  loginLocked = true
  loginContainer.classList.add('disabled-darken')
}

const unlockLogin = () => {
  loginLocked = false
  loginContainer.classList.remove('disabled-darken')
  if (failedLoginReason) {
    loginFeedback.innerText = failedLoginReason
  }
}

export const setupLogin = async (socket: Socket) => {
  const submitFunction = (e: Event) => {
    lockLogin()
    loginTimeout = setTimeout(() => {
      loginLocked = false
      if (failedLoginReason) {
        unlockLogin()
      }
    }, 500)

    e.preventDefault()
    socket.emit('tryLogin', loginInput.value)
    failedLoginReason = undefined
  }

  loginFormElm.addEventListener('submit', submitFunction)
  loginButton.addEventListener('click', submitFunction)

  socket.on('invalidLogin', (errMsg: string) => {
    if (!loginLocked) {
      loginFeedback.innerText = errMsg
    } else {
      failedLoginReason = errMsg
    }
  })

  // for the login flow we want to await all resource loading and successful login
  // therefore we want to await this function and have it resolve only when we receive a validLogin event
  return new Promise((res) => {
    socket.on('validLogin', (approvedName: string) => {
      res(approvedName)
    })
  })
}
