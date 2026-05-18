import "./App.css"
import Game from "./game.tsx"
import { useState, useEffect } from "react";

export default function App() {
  const [isInDarkMode, setIsInDarkMode] = useState(false);
  const [isShowingStats, setIsShowingStats] = useState(false);

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
      metaThemeColor.setAttribute(
        "content",
        isInDarkMode ? "#1E1E1E" : "#f8f8f2"
      );
    }
  }, [isInDarkMode]);

  return (
    <div className="app">
      <Header isInDarkMode={isInDarkMode} toggleDarkMode={toggleDarkMode} isShowingStats={isShowingStats} toggleIsShowingStats={() => setIsShowingStats(prev => !prev)} />
      <Game isShowingStats={isShowingStats}/>
   </div>
  )
}

type HeaderProps = {
  isInDarkMode: boolean,
  toggleDarkMode: () => void,
  isShowingStats: boolean,
  toggleIsShowingStats: () => void
}

function Header({ isInDarkMode, toggleDarkMode, isShowingStats, toggleIsShowingStats }: HeaderProps) {
  return (
    <div className="header">
      <h1>proportion.</h1>
      <Buttons isInDarkMode={isInDarkMode} toggleDarkMode={toggleDarkMode} isShowingStats={isShowingStats} toggleIsShowingStats={toggleIsShowingStats} />
    </div>
  )
}

function Buttons({ isInDarkMode, toggleDarkMode, isShowingStats, toggleIsShowingStats }: HeaderProps) {
  return (
    <div className="header-buttons">
      <HeaderButton text={isInDarkMode ? "☼" : "☾"} onClick={toggleDarkMode} />
      <HeaderButton text={isShowingStats ? "–" : "☰"} onClick={toggleIsShowingStats} />
    </div>
  )
}

type HeaderButtonProps = {
  text: string,
  onClick: () => void
}

function HeaderButton({ text, onClick }: HeaderButtonProps) {
  return (
    <button className="header-button" onClick={onClick}>
      <div className="header-button-icon">
        { text }
      </div>
    </button>
  )
}