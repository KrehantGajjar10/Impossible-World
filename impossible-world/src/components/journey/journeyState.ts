// Stores the scroll journey state globally to avoid expensive React re-renders on every frame.
// 0 = top of page, 1 = bottom of page.
export const journeyState = {
  progress: 0,
};
