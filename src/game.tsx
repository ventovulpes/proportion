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
      isVertical: isVertical
    };
  }

  function createRandomPrompt() {
    let denominator = Math.floor(Math.random() * 18) + 2;
    let numerator = Math.floor(Math.random() * (denominator - 1)) + 1;

    // get gcd using Euclidean algorithm
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);

    // check if fraction can be reduced using gcd. if so, generate new fraction
    while (gcd(numerator, denominator) > 1) {
      denominator = Math.floor(Math.random() * 18) + 2;
      numerator = Math.floor(Math.random() * (denominator - 1)) + 1;
    }
    return {
      numerator: numerator,
      denominator: denominator
    };
  }

  const handleSubmit = () => {
    const goalPercentage = prompt.numerator / prompt.denominator;
    const guessPercentage = boxValues.guess / (boxValues.isVertical ? boxValues.boxHeight : boxValues.boxWidth);
    console.log(goalPercentage, guessPercentage);
    setHasSubmitted(true);
  };

  const handleNext = () => {
    setBoxValues(createRandomInitialBoxValues);
    setPrompt(createRandomPrompt);
    setHasSubmitted(false);
  }

  return (
    <div className='game'>
      <Fraction prompt={prompt} />
      <BoxArea boxValues={boxValues} setBoxValues={setBoxValues} />
      <Button onClick={hasSubmitted ? handleNext : handleSubmit} hasSubmitted={hasSubmitted} />
    </div>
  );
}

function Fraction({ prompt }) {
  return (
    <div className='fraction'>
      <p className='fraction-top'>{ prompt.numerator }</p>
      <p className='fraction-bottom'>{ prompt.denominator }</p>
    </div>
  );
}

function BoxArea({ boxValues, setBoxValues }) {
  const [scalingFactor, setScalingFactor] = useState(1);
  const boxAreaRef = useRef(null);

  // change game scaling depending on window size
  useEffect(() => {
    const handleResize = () => {
      const boxAreaSize = {
        x: boxAreaRef.current.getBoundingClientRect().width,
        y: boxAreaRef.current.getBoundingClientRect().height
      }
      setScalingFactor(Math.min(boxAreaSize.x / GAME_DIMENSIONS.x, boxAreaSize.y / GAME_DIMENSIONS.y));
    };
    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  return (
    <div className='box-area' ref={boxAreaRef}>
      <Box scalingFactor={scalingFactor} boxValues={boxValues} setBoxValues={setBoxValues} />
    </div>
  );
}

function Box({ scalingFactor, boxValues, setBoxValues }) {
  const guessRef = useRef(null);
  const isResizing = useRef(false);
  const initialMousePos = useRef(0);
  const initialGuess = useRef(boxValues.guess);

  const handleMouseDown = (e: React.MouseEvent) => {
    isResizing.current = true;
    initialMousePos.current = boxValues.isVertical ? e.clientY : e.clientX;
    initialGuess.current = boxValues.guess;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
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

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className="box"
      onMouseDown={handleMouseDown}
      style={{
        width: boxValues.boxWidth * scalingFactor,
        height: boxValues.boxHeight * scalingFactor,
        flexDirection: boxValues.isVertical ? "column" : "row",
        justifyContent: boxValues.isVertical ? "end" : "start"
      }}
    >
      <div
        className="guess-box"
        ref={guessRef}
        style={{
          width: boxValues.isVertical ? '100%' : boxValues.guess * scalingFactor,
          height: boxValues.isVertical ? boxValues.guess * scalingFactor : '100%',
          borderTop: boxValues.isVertical ? '2px solid #282828' : undefined,
          borderRight: boxValues.isVertical ? undefined : '2px solid #282828'
        }}
      ></div>
    </div>
  );
}

function Button({ onClick, hasSubmitted }) {
  return (
    <button onClick={onClick}>{hasSubmitted ? 'next' : 'submit'}</button>
  );
}