let pauseAndOpenVideoButton = document.getElementById('pauseAndOpenVideo');

function isShortsURL(url) {
  return url.includes('youtube.com/shorts/');
}

function updateButtonState(isEnabled) {
  pauseAndOpenVideoButton.disabled = !isEnabled;
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'updateButtonState') {
    updateButtonState(message.isEnabled);
  }
});

chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  let url = tabs[0]?.url;
  if (isShortsURL(url)) {
    updateButtonState(true);
  }
});

chrome.runtime.sendMessage({ action: 'checkShortsPage' });

pauseAndOpenVideoButton.addEventListener('click', async () => {
  const tabs = await chrome.tabs.query({active: true, currentWindow: true});
  const tabId = tabs[0]?.id;
  if (tabId && isShortsURL(tabs[0].url)) {
    try {
      const response = await chrome.scripting.executeScript({
        target: {tabId: tabId},
        func: pauseAndRetrieveCurrentTime
      });
      const timestamp = response[0]?.result;
      if (timestamp !== undefined && timestamp !== null) {
        console.log('Timestamp received:', timestamp);
        let videoID = getYoutubeShortsIdFromUrl(tabs[0].url);
        let videoURL = `https://www.youtube.com/watch?v=${videoID}&t=${timestamp}s`;
        videoURL = encodeURI(videoURL);
        chrome.tabs.create({
          url: videoURL,
          active: true
        }, function(newTab) {
          if (chrome.runtime.lastError || !newTab) {
            console.error('Failed to open video in a new tab', chrome.runtime.lastError.message);
          }
        });
      } else {
        console.error('Failed to receive timestamp from content script.');
      }
    } catch (error) {
      console.error('Error executing script in tab:', error);
    }
  }
});

function getYoutubeShortsIdFromUrl(url) {
  const shortsId = url.split('/shorts/')[1];
  if (shortsId) {
    return shortsId.split('?')[0];
  }
  throw new Error('Cannot extract Shorts ID from URL');
}

function pauseAndRetrieveCurrentTime() {
  const video = document.querySelector('video');
  if (video) {
    video.pause();
    return Math.floor(video.currentTime);
  }
  return null;
}
