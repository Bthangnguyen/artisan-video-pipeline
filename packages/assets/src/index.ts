export enum SvgAssetId {
  BROKEN_HEART = "broken_heart",
  SMILEY_FACE = "smiley_face",
  STAR = "star",
  ROCKET = "rocket",
  INFINITE = "infinite",
  MOUNTAIN = "mountain",
  TROPHY = "trophy",
  EYE = "eye",
  BOOK = "book",
  CLOCK = "clock",
  TARGET = "target",
  CROSS = "cross",
  FLAME = "flame",
}

// Map of SVG paths for each ID
export const SVG_PATHS: Record<string, string> = {
  rocket: "M13.13 2.188c-4.437 2.122-7.58 6.474-7.58 11.442 0 .61.045 1.206.13 1.786l-2.072 2.072-.707-.707c-.39-.39-1.023-.39-1.414 0s-.39 1.023 0 1.414l2.12 2.12c.39.39 1.023.39 1.414 0s.39-1.023 0-1.414l-.707-.708 2.072-2.072c.58.085 1.176.13 1.786.13 4.968 0 9.32-3.143 11.442-7.58-.33.155-.66.305-1 .45 1.745-3.328 1.43-7.55-1.12-10.55-3 3-7.222 3.325-10.55 1.12.145-.34.295-.67.45-1z",
  infinite: "M11.5 6c-1.6 0-3 1.3-4.1 2.5C6.3 9.8 4.9 11 3.5 11 2.1 11 1 9.9 1 8.5 1 7.1 2.1 6 3.5 6c.5 0 1 .1 1.4.4l1.1-1.1C5.3 5.1 4.4 5 3.5 5 1.6 5 0 6.6 0 8.5S1.6 12 3.5 12c1.6 0 3-1.3 4.1-2.5 1.1-1.3 2.5-2.5 3.9-2.5 1.4 0 2.5 1.1 2.5 2.5 0 1.4-1.1 2.5-2.5 2.5-.5 0-1-.1-1.4-.4l-1.1 1.1c.7.2 1.6.3 2.5.3 1.9 0 3.5-1.6 3.5-3.5S13.4 5 11.5 5z",
  mountain: "M8 0L0 12h16L8 0zM8 2.5l5.3 8H2.7L8 2.5zM7 7h2v2H7z",
  trophy: "M15 2h-2V0H3v2H1c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h2c.6 1.7 2.1 3 3.9 3.4C7.5 12.5 8 13.7 8 15h2c0-1.3.5-2.5 1.1-3.6 1.8-.4 3.3-1.7 3.9-3.4h2c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM3 6H2V4h1v2zm10 0h1V4h-1v2z",
  broken_heart: "M8 1.3c-1.6-1.7-4.2-1.7-5.8 0-1.6 1.7-1.6 4.4 0 6.1L8 14l5.8-6.6c1.6-1.7 1.6-4.4 0-6.1-1.6-1.7-4.2-1.7-5.8 0z",
  star: "M8 0l2.4 5h5.1l-4.1 3.5 1.6 5-4-3.1-4 3.1 1.6-5L0 5h5.1z",
  eye: "M8 3c-4.4 0-8 5-8 5s3.6 5 8 5 8-5 8-5S12.4 3 8 3zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5S6.1 4.5 8 4.5s3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zM8 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z",
  book: "M1 2v13c0 .5.4 1 1 1h12c.5 0 1-.4 1-1V2c0-.5-.4-1-1-1H2c-.5 0-1 .4-1 1zm2 1h10v11H3V3zm1 2v1h8V5H4zm0 3v1h8V8H4z",
  clock: "M8 0c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6zm1-6.4V4H7v4.6l3 1.8.8-1.2-1.8-1.2z",
  target: "M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6zm0-10C5.8 4 4 5.8 4 8s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z",
  cross: "M14.1 3.3l-1.4-1.4L8 6.6 3.3 1.9 1.9 3.3 6.6 8l-4.7 4.7 1.4 1.4L8 9.4l4.7 4.7 1.4-1.4L9.4 8l4.7-4.7z",
  flame: "M8 0C6.5 1.5 5 3.5 4 6c-1 2.5-1 5 .5 7s4 2.5 6 1.5 3-4 .5-6.5C10 6.5 9 5 8 0zM8 12c-1.5-.5-2-2-1-3 1 1 2 2 3 .5C10.5 11 9.5 12.5 8 12z",
};

// Ensure the enum values match our allowed types
export type ValidAssetId = `${SvgAssetId}`;

// In a real application, you might export React components or file paths here.
// For now, these ID strings will be used by the Remotion renderer to decide which
// internal SVG component to render!
