type BaseShape = {
  isVertical: boolean,
  guess: number,
  guessPercentage: number,
  maxGuess: number,
  minGuess: number
};

type Rectangle = BaseShape & {
  type: "rectangle",
  width: number,
  height: number
}

type Shape = Rectangle;

function createRectangle(): Rectangle {
  const isVertical = Math.random() < 0.5;
  const width = Math.round(Math.random() * 800 + 200);
  const height = Math.round(Math.random() * 800 + 200);

  return {
    type: "rectangle",
    isVertical: isVertical,
    guess: Math.random() * ((isVertical ? height : width) - 10) + 10,
    guessPercentage: 0,
    width: width,
    height: height,
    maxGuess: isVertical ? height : width,
    minGuess: 0
  }
}

function getShapeAreaToLine(shape: Shape, measure: number): number {
  switch (shape.type) {
    case "rectangle":
      if (shape.isVertical) {
        return measure * shape.width;
      } else {
        return measure * shape.height;
      }
  }
}

function getTotalShapeArea(shape: Shape): number {
  switch (shape.type) {
    case "rectangle":
      return shape.width * shape.height;
  }
}

function getShapeStyle(shape: Shape, scalingFactor: number): React.CSSProperties {
  switch (shape.type) {
    case "rectangle":
      return {
        width: shape.width * scalingFactor,
        height: shape.height * scalingFactor
      };
  }
}

function getGuessPercentage(shape: Shape): number {
  return Math.round((getShapeAreaToLine(shape, shape.guess) / getTotalShapeArea(shape)) * 1000) / 1000;
}

function getAnswerFillStyle(shape: Shape, percentage: number): React.CSSProperties {
  switch (shape.type) {
    case "rectangle":
      return {
        width: shape.isVertical ? "100%" : `${percentage * 100}%`,
        height: shape.isVertical ? `${percentage * 100}%` : "100%"
      }
  }
}

export { type Shape, createRectangle, getShapeStyle, getGuessPercentage, getAnswerFillStyle}
