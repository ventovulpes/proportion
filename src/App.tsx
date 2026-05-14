import './App.css'
import Game from './game.tsx'

export default function App() {
  return (
    <div className='app'>
      <Header />
      <Game />
   </div>
  )
}

function Header() {
  return (
    <h1>proportion.</h1>
  )
}