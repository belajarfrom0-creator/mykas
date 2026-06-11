declare module '*.css'
declare module '@/globals.css' {
  const content: string;
  export default content;
}
declare module '../globals.css' {
  const content: string;
  export default content;
}
