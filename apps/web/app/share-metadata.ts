export type ReadingEstimate = {
  minutes: number;
  text: string;
  words: number;
};

const wordsPerMinute = 225;

export function estimateReadingTime(markdown: string): ReadingEstimate {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_[\]()`~!|-]/g, " ");
  const words = text.match(/[\p{L}\p{N}]+(?:['-][\p{L}\p{N}]+)*/gu) ?? [];
  const wordCount = words.length;
  const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));

  return {
    minutes,
    text: `${minutes} min read`,
    words: wordCount,
  };
}
