import "./App.css"
import Game from "./game.tsx"
import { useState, useEffect } from "react";

export default function App() {
  const [isInDarkMode, setIsInDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsInDarkMode(d => {
      const next = !d;
      document.documentElement.dataset.theme = next ? "dark" : "light";
      return next;
    });
  }

  useEffect(() => {
    const metaThemeColor = document.querySelector("meta[name='theme-color']");

    if (metaThemeColor) {
      console.log("change")
      metaThemeColor.setAttribute(
        "content",
        isInDarkMode ? "#1E1E1E" : "#f8f8f2"
      );
    }
  }, [isInDarkMode]);

  return (
    <div className="app">
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