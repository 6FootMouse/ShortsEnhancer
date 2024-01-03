// background_worker.js

chrome.runtime.onInstalled.addListener(function() {
  console.log('ShortsEnhancer has been installed.');
  // Note: Service workers do not support persistent state and direct DOM manipulation.
});