import './App.css'

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

function Game() {
  return (
    <div className='game'>
      <Fraction />
      <BoxArea />
      <SubmitButton />
    </div>
  )
}

function Fraction() {
  return (
    <div className='fraction'>
      <p className='fraction-top'>3</p>
      <p className='fraction-bottom'>5</p>
    </div>
  )
}

function BoxArea() {
  return (
    <div className='box-area'></div>
  )
}

function SubmitButton() {
  return (
    <button>submit</button>
  )
}