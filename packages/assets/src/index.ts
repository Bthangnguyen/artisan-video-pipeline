// Enum of valid asset IDs in the system
export enum SvgAssetId {
  BROKEN_HEART = "broken_heart",
  SMILEY_FACE = "smiley_face",
  STAR = "star",
}

// Ensure the enum values match our allowed types
export type ValidAssetId = `${SvgAssetId}`;

// In a real application, you might export React components or file paths here.
// For now, these ID strings will be used by the Remotion renderer to decide which
// internal SVG component to render!
