// type declarations for non-code assets to make webpack and typescript play together
declare module '*?raw' {
  const content: string
  export default content
}
