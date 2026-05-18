const ratings = [
  { min: 0.00, max: 0.01, label: "perfect"},
  { min: 0.01, max: 0.5, label: "excellent"},
  { min: 0.5, max: 1, label: "good"},
  { min: 1, max: 3, label: "okay"},
  { min: 3, max: 100.1, label: "miss"}
]

function scoreToRating(score: number): {label: string, color: string} {
  const rating = ratings.find(range => score >= range.min && score < range.max);
  if (!rating){
    return undefined;
  }
  return { label: (rating.label === "perfect" ? "perfect!" : rating.label), color: `var(--${rating.label}-rating)` };
}

function scoreContinuesStreak(score: number): boolean {
  console.log(score)
  return score < ratings[ratings.length - 1].min;
}


const PRECISION = 4;

function roundToPrecision(value: number): number {
  return Math.round(value * 10**PRECISION) / 10**PRECISION;
}

export { scoreToRating, scoreContinuesStreak, PRECISION, roundToPrecision }