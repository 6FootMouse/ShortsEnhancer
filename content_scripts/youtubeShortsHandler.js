export function pauseVideoAndRetrieveTimestamp() {
  return new Promise((resolve, reject) => {
    const video = document.querySelector('video');
    if (video) {
      video.pause();
      const timestamp = Math.floor(video.currentTime);
      resolve(timestamp);
    } else {
      reject('No active video element found.');
    }
  });
}
