import "./App.css"
import Game from "./game.tsx"
import { useState, useEffect } from "react";

export default function App() {
  const [isInDarkMode, setIsInDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsInDarkMode(d => !d);
  }

  useEffect(() => {
    const metaThemeColor = document.querySelector("meta[name='bg-color']");

    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        isInDarkMode ? "#1E1E1E" : "#f8f8f2"
      );
    }
  }, [isInDarkMode]);

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