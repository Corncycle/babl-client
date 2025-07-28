import { Socket } from 'socket.io-client'

const loginContainer: HTMLDivElement =
  document.querySelector('.login-container')!
const loginFormElm: HTMLFormElement = document.querySelector('.login-form')!
const loginInput: HTMLInputElement = document.querySelector('.login-input')!
const loginButton: HTMLButtonElement = document.querySelector('.login-button')!
const loginFeedback: HTMLSpanElement =
  document.querySelector('.login-feedback')!

export const setupLogin = async (socket: Socket) => {
  const submitFunction = (e: Event) => {
    e.preventDefault()
    socket.emit('tryLogin', loginInput.value)

    console.log('trying to log in')
    loginContainer.classList.add('disabled-darken')
  }

  loginFormElm.addEventListener('submit', submitFunction)
  loginButton.addEventListener('click', submitFunction)

  socket.on('invalidLogin', (errMsg: string) => {
    loginContainer.classList.remove('disabled-darken')
    loginFeedback.innerText = errMsg
  })

  return new Promise((res) => {
    socket.on('validLogin', (approvedName: string) => {
      res(approvedName)
    })
  })
}
