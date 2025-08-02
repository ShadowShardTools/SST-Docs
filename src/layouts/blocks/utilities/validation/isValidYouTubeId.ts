export const isValidYouTubeId = (id: string): boolean => {
  const youtubeRegex = /^[a-zA-Z0-9_-]{11}$/;
  return youtubeRegex.test(id);
};

export default isValidYouTubeId;
