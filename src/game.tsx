import { useEffect, useState, useRef } from "react"
const GAME_DIMENSIONS = { x: 1000, y: 1000 }

export default function Game() {
  const [boxValues, setBoxValues] = useState(createRandomInitialBoxValues);
  const [prompt, setPrompt] = useState(createRandomPrompt);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  function createRandomInitialBoxValues() {
    const newBoxHeight = Math.random() * 800 + 200;
    const newBoxWidth = Math.random() * 800 + 200;
    const isVertical = Math.random() < 0.5;

    return {
      boxWidth: newBoxWidth,
      boxHeight: newBoxHeight,
      guess: Math.random() * ((isVertical ? newBoxHeight : newBoxWidth) - 10) + 10,
      isVertical: isVertical,
      guessPercentage: 0
    };
  }

  function createRandomPrompt() {
    let denominator = Math.floor(Math.random() * 18) + 2;
    let numerator = Math.floor(Math.random() * (denominator - 1)) + 1;

    // get gcd using Euclidean algorithm
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);

    // check if fraction can be reduced using gcd. if so, generate new fraction
    while (gcd(numerator, denominator) > 1) {
      denominator = Math.floor(Math.random() * 18) + 2;
      numerator = Math.floor(Math.random() * (denominator - 1)) + 1;
    }
    return {
      numerator: numerator,
      denominator: denominator,
      percentage: numerator / denominator
    };
  }

  const handleSubmit = () => {
    const newGuessPercentage = boxValues.guess / (boxValues.isVertical ? boxValues.boxHeight : boxValues.boxWidth);
    setBoxValues(prev => ({
      ...prev,
      guessPercentage: newGuessPercentage
    }));
    console.log(prompt.percentage, newGuessPercentage);
    setHasSubmitted(true);
  };

  const handleNext = () => {
    setBoxValues(createRandomInitialBoxValues);
    setPrompt(createRandomPrompt);
    setHasSubmitted(false);
  }

  return (
    <div className="game">
      <Fraction prompt={prompt} />
      <Result answerPercentage={prompt.percentage} guessPercentage={boxValues.guessPercentage} hasSubmitted={hasSubmitted} />
      <BoxArea boxValues={boxValues} setBoxValues={setBoxValues} answerPercentage={prompt.percentage} hasSubmitted={hasSubmitted} />
      <Button onClick={hasSubmitted ? handleNext : handleSubmit} hasSubmitted={hasSubmitted} />
    </div>
  );
}

type BoxValues = {
  boxWidth: number,
  boxHeight: number,
  guess: number,
  isVertical: boolean,
  guessPercentage: number
}

type FractionProps = {
  prompt: {
    numerator: number,
    denominator: number,
    percentage: number
  }
}

function Fraction({ prompt }: FractionProps) {
  return (
    <div className="fraction">
      <p className="fraction-top">{ prompt.numerator }</p>
      <p className="fraction-bottom">{ prompt.denominator }</p>
    </div>
  );
}

type ResultProps = {
  answerPercentage: number,
  guessPercentage: number,
  hasSubmitted: boolean
}

function Result({ answerPercentage, guessPercentage, hasSubmitted }: ResultProps) {
  const result = `${guessPercentage - answerPercentage > 0 ? '+' : '-'} ${(Math.abs(guessPercentage - answerPercentage) * 100).toFixed(2)}%`
  return (
    <div className="result">
      {hasSubmitted ? result : ""}
    </div>
  )
}

type BoxAreaProps = {
  boxValues: BoxValues,
  setBoxValues: React.Dispatch<React.SetStateAction<BoxValues>>,
  answerPercentage: number,
  hasSubmitted: boolean
}

function BoxArea({ boxValues, setBoxValues, answerPercentage, hasSubmitted }: BoxAreaProps) {
  const [scalingFactor, setScalingFactor] = useState(1);
  const boxAreaRef = useRef<HTMLDivElement | null>(null);

  // change game scaling depending on window size
  useEffect(() => {
    const handleResize = () => {
      if (!boxAreaRef.current) return;

      const boxAreaSize = {
        x: boxAreaRef.current.getBoundingClientRect().width ?? 0,
        y: boxAreaRef.current.getBoundingClientRect().height ?? 0
      }
      setScalingFactor(Math.min(boxAreaSize.x / GAME_DIMENSIONS.x, boxAreaSize.y / GAME_DIMENSIONS.y));
    };
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  return (
    <div className="box-area" ref={boxAreaRef}>
      <Box scalingFactor={scalingFactor} boxValues={boxValues} setBoxValues={setBoxValues} answerPercentage={answerPercentage} hasSubmitted={hasSubmitted} />
    </div>
  );
}

type BoxProps = {
  scalingFactor: number,
  boxValues: BoxValues,
  setBoxValues: React.Dispatch<React.SetStateAction<BoxValues>>,
  answerPercentage: number,
  hasSubmitted: boolean
}

function Box({ scalingFactor, boxValues, setBoxValues, answerPercentage, hasSubmitted }: BoxProps) {
  const guessRef = useRef(null);
  const isResizing = useRef(false);
  const initialMousePos = useRef(0);
  const initialGuess = useRef(boxValues.guess);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!hasSubmitted) {
      isResizing.current = true;
      initialMousePos.current = boxValues.isVertical ? e.clientY : e.clientX;
      initialGuess.current = boxValues.guess;

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing.current) {
      const curMousePos = boxValues.isVertical ? e.clientY : e.clientX;
      const deltaMousePos = boxValues.isVertical
        ? initialMousePos.current - curMousePos
        : curMousePos - initialMousePos.current;

      const newGuess = initialGuess.current + deltaMousePos / scalingFactor;
      const minGuess = 0;
      const maxGuess = boxValues.isVertical ? boxValues.boxHeight : boxValues.boxWidth;
      setBoxValues(prev => ({
        ...prev,
        guess: Math.min(Math.max(minGuess, newGuess), maxGuess)
      }));
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;

    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      className="box"
      onMouseDown={handleMouseDown}
      style={{
        width: boxValues.boxWidth * scalingFactor,
        height: boxValues.boxHeight * scalingFactor
      }}
    >
      <div
        className="guess-box"
        ref={guessRef}
        style={{
          width: boxValues.isVertical ? "100%" : boxValues.guess * scalingFactor,
          height: boxValues.isVertical ? boxValues.guess * scalingFactor : "100%"
        }}
      ></div>
      <div
        className="answer-box"
        style={{
          width: boxValues.isVertical ? "100%" : `${answerPercentage * 100}%`,
          height: boxValues.isVertical ? `${answerPercentage * 100}%` : "100%",
          backgroundColor: hasSubmitted ? (boxValues.guessPercentage > answerPercentage ? 'rgba(255, 34, 0, 0.5)' : 'rgba(32, 220, 82, 0.5)') : undefined
        }}
      ></div>
    </div>
  );
}

type ButtonProps = {
  onClick: React.MouseEventHandler<HTMLButtonElement>,
  hasSubmitted: boolean
}

function Button({ onClick, hasSubmitted }: ButtonProps) {
  return (
    <button onClick={onClick}>{hasSubmitted ? "next" : "submit"}</button>
  );
}