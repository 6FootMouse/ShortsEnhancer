function isShortsURL(url) {
  return url.includes('youtube.com/shorts/');
}

// Export the function for use in other scripts
// This module now only contains the isShortsURL function since
// pauseVideoAndRetrieveTimestamp has been inlined in content.js
global.isShortsURL = isShortsURL;
