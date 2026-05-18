import { useEffect, useState, useRef } from "react"
import { type Shape, createRectangle, getShapeStyle, getGuessPercentage, getAnswerFillStyle } from "./shapes";
import { scoreToRating, scoreContinuesStreak, PRECISION, roundToPrecision } from "./scoring";
const GAME_DIMENSIONS = { x: 1000, y: 1000 }

type GameProps = {
  isShowingStats: boolean
}

export default function Game({isShowingStats}: GameProps) {
  const SHAPE_GENERATORS = [createRectangle];
  const [shape, setShapeValues] = useState<Shape>(createRandomInitialShapeValues);
  const [prompt, setPrompt] = useState(createRandomPrompt);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [bestScore, setBestScore] = useState<null | number>(null);
  const gameScreenRef = useRef<null | HTMLDivElement>(null);

  function createRandomInitialShapeValues() {
    const randomShapeGenerator = SHAPE_GENERATORS[Math.floor(Math.random() * SHAPE_GENERATORS.length)];
    return randomShapeGenerator();
  }

  function createRandomPrompt() {
    let denominator = Math.floor(Math.random() * 19) + 2;
    let numerator = Math.floor(Math.random() * 19) + 2;

    // get gcd using Euclidean algorithm
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);

    // check if fraction can be reduced using gcd. if so, generate new fraction
    while (numerator >= denominator || gcd(numerator, denominator) > 1) {
      denominator = Math.floor(Math.random() * 18) + 2;
      numerator = Math.floor(Math.random() * (denominator - 1)) + 1;
    }
    return {
      numerator: numerator,
      denominator: denominator,
      percentage: roundToPrecision(numerator / denominator)
    };
  }

  const handleSubmit = () => {
    const newGuessPercentage = getGuessPercentage(shape);
    setShapeValues(prev => ({
      ...prev,
      guessPercentage: newGuessPercentage
    }));
    setHasSubmitted(true);

    const percentDifference = (newGuessPercentage - prompt.percentage) * 100;
    if (scoreContinuesStreak(Math.abs(percentDifference))) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setLongestStreak(Math.max(longestStreak, newStreak));
    } else {
      setStreak(0);
    }
    if (Math.abs(percentDifference) < Math.abs(bestScore ? bestScore : 100.01)) {
      setBestScore(percentDifference);
    }
  };

  const handleNext = () => {
    setShapeValues(createRandomInitialShapeValues);
    setPrompt(createRandomPrompt);
    setHasSubmitted(false);
  }

  const handleGameScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hasSubmitted) return;
    if (!gameScreenRef.current) return;

    let newGuess = shape.guess;

    // change guess by 0.1% of height/width (smallest possible increment)
    if (shape.isVertical) {
      if (e.clientY < (gameScreenRef.current.getBoundingClientRect().height / 2) + gameScreenRef.current.getBoundingClientRect().top) {
        newGuess += roundToPrecision(10**(-PRECISION) * shape.height);
      } else {
        newGuess -= roundToPrecision(10**(-PRECISION) * shape.height);
      }
    } else {
      if (e.clientX > gameScreenRef.current.getBoundingClientRect().width / 2) {
        newGuess += roundToPrecision(10**(-PRECISION) * shape.width);
      } else {
        newGuess -= roundToPrecision(10**(-PRECISION) * shape.width);
      }
    }

    setShapeValues(prev => ({
      ...prev,
      guess: Math.min(Math.max(prev.minGuess, newGuess), prev.maxGuess)
    }));
  }

  return (
    <div className="game" onClick={handleGameScreenClick} ref={gameScreenRef}>
      <div className="game-top">
        <div className="game-center">
          <Fraction prompt={prompt} />
          <Result answerPercentage={prompt.percentage} guessPercentage={shape.guessPercentage} hasSubmitted={hasSubmitted} />
        </div>
        {isShowingStats ? <Stats streak={streak} longestStreak={longestStreak} bestScore={bestScore} /> : ""}
      </div>
      <ShapeArea shape={shape} setShapeValues={setShapeValues} answerPercentage={prompt.percentage} hasSubmitted={hasSubmitted}/>
      <Button onClick={hasSubmitted ? handleNext : handleSubmit} hasSubmitted={hasSubmitted} />
    </div>
  );
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

type StatsProps = {
  streak: number,
  longestStreak: number,
  bestScore: number | null
}

function Stats({ streak, longestStreak, bestScore }: StatsProps) {
  return (
    <div className="stats">
      <p>{ `current streak: ${streak}` }</p>
      <p>{ `longest streak: ${longestStreak}` }</p>
      <p>{ `best score: ${bestScore ? bestScore.toFixed(PRECISION - 2) : "-"}%`}</p>
    </div>
  )
}

type ResultProps = {
  answerPercentage: number,
  guessPercentage: number,
  hasSubmitted: boolean
}

function Result({ answerPercentage, guessPercentage, hasSubmitted }: ResultProps) {
  const percentageOff = (Math.abs(guessPercentage - answerPercentage) * 100).toFixed(PRECISION - 2);
  const resultString = `${guessPercentage - answerPercentage >= 0 ? '+' : '-'} ${percentageOff}%`;
  const rating = scoreToRating(Number(percentageOff));

  return (
    <div className="result">
      <p><b>{hasSubmitted ? resultString : ""}</b></p>
      <p style={{color: rating.color}}>{hasSubmitted ? rating.label : ""}</p>
    </div>
  )
}

type ShapeAreaProps = {
  shape: Shape,
  setShapeValues: React.Dispatch<React.SetStateAction<Shape>>,
  answerPercentage: number,
  hasSubmitted: boolean
}

function ShapeArea({ shape, setShapeValues, answerPercentage, hasSubmitted }: ShapeAreaProps) {
  const [scalingFactor, setScalingFactor] = useState(1);
  const shapeAreaRef = useRef<HTMLDivElement | null>(null);

  // change game scaling depending on window size
  useEffect(() => {
    const handleResize = () => {
      if (!shapeAreaRef.current) return;

      const shapeAreaSize = {
        x: shapeAreaRef.current.getBoundingClientRect().width ?? 0,
        y: shapeAreaRef.current.getBoundingClientRect().height ?? 0
      }
      setScalingFactor(Math.min(shapeAreaSize.x / GAME_DIMENSIONS.x, shapeAreaSize.y / GAME_DIMENSIONS.y));
    };
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  return (
    <div className="shape-area" ref={shapeAreaRef}>
      <Shape scalingFactor={scalingFactor} shape={shape} setShapeValues={setShapeValues} answerPercentage={answerPercentage} hasSubmitted={hasSubmitted} />
    </div>
  );
}

type ShapeProps = {
  scalingFactor: number,
  shape: Shape,
  setShapeValues: React.Dispatch<React.SetStateAction<Shape>>,
  answerPercentage: number,
  hasSubmitted: boolean
}

function Shape({ scalingFactor, shape, setShapeValues, answerPercentage, hasSubmitted }: ShapeProps) {
  const guessBoxRef = useRef(null);
  const isResizing = useRef(false);
  const initialPointerPos = useRef(0);
  const initialGuess = useRef(shape.guess);

  const updateGuess = (newGuess: number) => {
    setShapeValues(prev => ({
      ...prev,
      guess: Math.min(Math.max(prev.minGuess, newGuess), prev.maxGuess)
    }));
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!hasSubmitted) {
      isResizing.current = true;
      initialPointerPos.current = shape.isVertical ? e.clientY : e.clientX;
      initialGuess.current = shape.guess;

      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    }
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (isResizing.current) {
      const curPointerPos = shape.isVertical ? e.clientY : e.clientX;
      const deltaPointerPos = shape.isVertical
        ? initialPointerPos.current - curPointerPos
        : curPointerPos - initialPointerPos.current;

      updateGuess(initialGuess.current + deltaPointerPos / scalingFactor);
    }
  };

  const handlePointerUp = () => {
    isResizing.current = false;

    document.removeEventListener("pointermove", handlePointerMove);
    document.removeEventListener("pointerup", handlePointerUp);
  };

  return (
    <div
      className="shape"
      onPointerDown={ handlePointerDown }
      onClick={(e: React.MouseEvent<HTMLDivElement>) => { e.stopPropagation() }}
      style={ getShapeStyle(shape, scalingFactor) }
    >
      <div
        className="guess-fill"
        ref={guessBoxRef}
        style={{
          width: shape.isVertical ? "100%" : shape.guess * scalingFactor,
          height: shape.isVertical ? shape.guess * scalingFactor : "100%"
        }}
      ></div>
      <div
        className="answer-fill"
        style={{
          ...(hasSubmitted ? getAnswerFillStyle(shape, answerPercentage) : ''),
          backgroundColor: (hasSubmitted && Math.abs(shape.guessPercentage - answerPercentage) >= 10**(-PRECISION))
            ? (shape.guessPercentage > answerPercentage ? 'rgba(255, 34, 0, 0.5)' : 'rgba(32, 220, 82, 0.5)')
            : undefined
        }}
      ></div>
    </div>
  );
}

type ButtonProps = {
  onClick: React.PointerEventHandler<HTMLButtonElement>,
  hasSubmitted: boolean
}

function Button({ onClick, hasSubmitted }: ButtonProps) {
  return (
    <button
      className="button"
      onClick={(e: React.PointerEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onClick(e);
      }}
    >
      <div className="button-inner">
        {hasSubmitted ? "next" : "submit"}
      </div>
    </button>
  );
}