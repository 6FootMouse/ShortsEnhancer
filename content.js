// In order to resolve the import statement error, we are including the content of utils directly into content.js
import { pauseVideoAndRetrieveTimestamp } from './content_scripts/youtubeShortsHandler.js';

function isShortsURL(url) {
  return url.includes('youtube.com/shorts/');
}

function sendMessageToPopup(message) {
  if (chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage(message);
  }
}

function handleMessage(request, sender, sendResponse) {
  if (request.action === 'checkShortsPage') {
    sendMessageToPopup({
      action: 'updateButtonState',
      isEnabled: isShortsURL(window.location.href)
    });
  }

  if (request.action === 'pauseAndGetTimestamp') {
    pauseVideoAndRetrieveTimestamp().then((timestamp) => {
      console.log('Video paused at:', timestamp);
      sendResponse({ timestamp: timestamp });
    }).catch((error) => {
      console.error('Error pausing video:', error);
      sendResponse({ timestamp: null, error: error });
    });
    return true; // Keep the message channel open for async response
  }
}

chrome.runtime.onMessage.addListener(handleMessage);

function sendButtonState(url) {
  sendMessageToPopup({ action: 'updateButtonState', isEnabled: isShortsURL(url) });
}

sendButtonState(window.location.href);

window.addEventListener('yt-navigate-finish', () => {
  sendButtonState(window.location.href);
});

window.addEventListener('unload', () => {
  chrome.runtime.onMessage.removeListener(handleMessage);
});
