import "./App.css"
import Game from "./game.tsx"
import { useState } from "react";

export default function App() {
  const [isInDarkMode, setIsInDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsInDarkMode(d => !d);
  }
  return (
    <div className={isInDarkMode ? "app dark" : "app"}>
      <Header isInDarkMode={isInDarkMode} toggleDarkMode={toggleDarkMode} />
      <Game />
   </div>
  )
}

type HeaderProps = {
  isInDarkMode: boolean,
  toggleDarkMode: () => void
}

function Header({ isInDarkMode, toggleDarkMode }: HeaderProps) {
  return (
    <div className="header">
      <h1>proportion.</h1>
      <button className="dark-mode-button" onClick={toggleDarkMode}>
        <div className="dark-mode-button-icon">
          {isInDarkMode ? "☼" : "☾" }
        </div>
      </button>
    </div>
  )
}