import { useEffect, useState, useRef } from "react"
import { type Shape, createRectangle, getShapeStyle, getGuessPercentage, getAnswerFillStyle } from "./shapes";
const GAME_DIMENSIONS = { x: 1000, y: 1000 }

export default function Game() {
  const SHAPE_GENERATORS = [createRectangle];
  const [shape, setShapeValues] = useState<Shape>(createRandomInitialShapeValues);
  const [prompt, setPrompt] = useState(createRandomPrompt);
  const [hasSubmitted, setHasSubmitted] = useState(false);
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
      percentage: Math.round((numerator / denominator) * 1000) / 1000
    };
  }

  const handleSubmit = () => {
    const newGuessPercentage = getGuessPercentage(shape);
    setShapeValues(prev => ({
      ...prev,
      guessPercentage: newGuessPercentage
    }));
    setHasSubmitted(true);
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
        newGuess += 0.001 * shape.height;
      } else {
        newGuess -= 0.001 * shape.height;
      }
    } else {
      if (e.clientX > gameScreenRef.current.getBoundingClientRect().width / 2) {
        newGuess += 0.001 * shape.width;
      } else {
        newGuess -= 0.001 * shape.width;
      }
    }

    setShapeValues(prev => ({
      ...prev,
      guess: Math.min(Math.max(prev.minGuess, newGuess), prev.maxGuess)
    }));
  }

  return (
    <div className="game" onClick={handleGameScreenClick} ref={gameScreenRef}>
      <Fraction prompt={prompt} />
      <Result answerPercentage={prompt.percentage} guessPercentage={shape.guessPercentage} hasSubmitted={hasSubmitted} />
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

type ResultProps = {
  answerPercentage: number,
  guessPercentage: number,
  hasSubmitted: boolean
}

function Result({ answerPercentage, guessPercentage, hasSubmitted }: ResultProps) {
  let result: string;

  const percentageOff = (Math.abs(guessPercentage - answerPercentage) * 100).toFixed(1);
  
  if (percentageOff === '0.0') {
    result = "perfect!";
  } else {
    result = `${guessPercentage - answerPercentage >= 0 ? '+' : '-'} ${percentageOff}%`
  }

  return (
    <div className="result">
      {hasSubmitted ? result : ""}
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
          backgroundColor: (hasSubmitted && Math.abs(shape.guessPercentage - answerPercentage) >= 0.001)
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