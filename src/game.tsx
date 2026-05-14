import { useEffect, useState, useRef } from "react"
const GAME_DIMENSIONS = { x: 1000, y: 1000 }

export default function Game() {
  const [boxValues, setBoxValues] = useState(createRandomInitialBoxValues);
  const [prompt, setPrompt] = useState(createRandomPrompt);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  function createRandomInitialBoxValues() {
    const newBoxHeight = Math.random() * 600 + 400;

    return {
      boxWidth: Math.random() * 800 + 200,
      boxHeight: newBoxHeight,
      guessHeight: Math.random() * (newBoxHeight - 10) + 10
    };
  }

  function createRandomPrompt() {
    const denominator = Math.floor(Math.random() * 18) + 2;
    return {
      numerator: Math.floor(Math.random() * (denominator - 1)) + 1,
      denominator: denominator
    };
  }

  const handleSubmit = () => {
    const goalPercentage = prompt.numerator / prompt.denominator;
    const guessPercentage = boxValues.guessHeight / boxValues.boxHeight;
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
  const initialYPos = useRef(0);
  const initialGuess = useRef(boxValues.guessHeight);

  const handleMouseDown = (e: React.MouseEvent) => {
    isResizing.current = true;
    initialYPos.current = e.clientY;
    initialGuess.current = boxValues.guessHeight;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing.current) {
      const newGuessHeight = initialGuess.current + (initialYPos.current - e.clientY) / scalingFactor;
      setBoxValues(prev => ({
        ...prev,
        guessHeight: Math.min(Math.max(10, newGuessHeight), 990)
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
      style={{
        width: boxValues.boxWidth * scalingFactor,
        height: boxValues.boxHeight * scalingFactor
      }}
    >
      <div
        className="guess-box"
        ref={guessRef}
        onMouseDown={handleMouseDown}
        style={{
          width: '100%',
          height: boxValues.guessHeight * scalingFactor
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