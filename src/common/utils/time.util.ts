export const parseTimeToSeconds = (time: string | undefined, defaultSeconds: number): number => {
  if (!time) return defaultSeconds;
  
  const match = time.match(/^(\d+)([hd])$/);
  if (!match) return defaultSeconds;

  const [, value, unit] = match;
  const numValue = parseInt(value);

  switch (unit) {
    case 'h':
      return numValue * 60 * 60;
    case 'd':
      return numValue * 24 * 60 * 60;
    default:
      return defaultSeconds;
  }
}; 