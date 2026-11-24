export const getEmbedUrl = (url?: string) => {
  // Check if url is falsy (undefined, null, or empty string)
  if (!url) return ""; 

  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const videoId = url.split("v=")[1]?.split("&")[0] || url.split("/").pop();
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
};
// export const getEmbedUrl = (url: string) => {
//   if (url.includes("youtube.com") || url.includes("youtu.be")) {
//     const videoId = url.split("v=")[1]?.split("&")[0] || url.split("/").pop();
//     return `https://www.youtube.com/embed/${videoId}`;
//   }
//   return url;
// };
