import { useEffect, useState, useRef } from "react"
const GAME_DIMENSIONS = { x: 1000, y: 1000 }

export default function Game() {
  const [boxWidth, setBoxWidth] = useState(500);
  const [boxHeight, setBoxHeight] = useState(200);

  useEffect(() => {
    handleSubmit()
  }, [])

  function handleSubmit() {
    setBoxWidth(Math.random() * 800 + 200);
    setBoxHeight(Math.random() * 600 + 400);
  }

  return (
    <div className='game'>
      <Fraction />
      <BoxArea boxWidth={boxWidth} boxHeight={boxHeight} />
      <SubmitButton onClick={handleSubmit} />
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

function BoxArea({ boxWidth, boxHeight }) {
  const [scalingFactor, setScalingFactor] = useState(1);
  const boxAreaRef = useRef(null);

  // change game scaling depending on window size
  useEffect(() => {
    function handleResize() {
      const boxAreaSize = {
        x: boxAreaRef.current.getBoundingClientRect().width,
        y: boxAreaRef.current.getBoundingClientRect().height
      }
      setScalingFactor(Math.min(boxAreaSize.x / GAME_DIMENSIONS.x, boxAreaSize.y / GAME_DIMENSIONS.y));
      console.log(boxAreaSize.x / GAME_DIMENSIONS.x, boxAreaSize.y / GAME_DIMENSIONS.y);
    }
    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    }
  })

  return (
    <div className='box-area' ref={boxAreaRef}>
      <Box scalingFactor={scalingFactor} width={boxWidth} height={boxHeight} />
    </div>
  )
}

function Box({ scalingFactor, width, height }) {
  return (
    <div
      className="box"
      style={{
        width: width * scalingFactor,
        height: height * scalingFactor
      }}
    ></div>
  )
}

function SubmitButton({ onClick }) {

  return (
    <button onClick={onClick}>submit</button>
  )
}