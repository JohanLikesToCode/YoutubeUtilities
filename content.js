class AdSkip {
  constructor() {
    this.ytAdModuleObserver = null; // the MutationObserver for the div rendering ad information
    this.adModuleElement = null; // the div element rendering ad information
    this.adSkipButtonElement = null; // the custom skip button element
  }

  // observe youtube ad module for changes and run the checkForAd callback
  observeAdModule() {
    if (!this.adModuleElement) {
      this.adModuleElement = document.querySelector(
        '#ytd-player .ytp-ad-module'
      );

      if (this.adModuleElement) {
        this.checkForAd(); // run an initial check for ads
        this.ytAdModuleObserver = new MutationObserver(() => this.checkForAd());
        this.ytAdModuleObserver.observe(this.adModuleElement, {
          subtree: true,
          childList: true,
        });
      }
    }
  }

  // check if an ad is playing
  // if ad playing, automatically skip it
  checkForAd() {
    if (this.adModuleElement.innerHTML !== '') {
      this.skipAd(); // automatically skip the ad
    }
  }

  // skip ad by going to the end timestamp and clicking the youtube ad skip button
  skipAd() {
    const videoElement = document.querySelector('video');
    const skipButton = document.querySelector(
      'button.ytp-ad-skip-button-modern'
    );

    if (videoElement && isFinite(videoElement.duration)) {
      videoElement.currentTime = videoElement.duration; // jump to the end of the ad
    }

    // Click the skip button after the ad ends
    if (skipButton) {
      skipButton.click(); // click the skip button to skip the ad
    }

    // Send message to increment ad skip count
    chrome.runtime.sendMessage({ action: 'increment' });
  }
}

// Initialize and start observing
const adSkip = new AdSkip();
adSkip.observeAdModule();


// run a callback when the DOM changes
function observeDocument(callback) {
  const observer = new MutationObserver((records, observer) => {
    callback(observer);
  });
  observer.observe(document, { subtree: true, childList: true });
}

function main() {
  const adSkip = new AdSkip();

  observeDocument((observer) => {
    if (!adSkip.adModuleElement) {
      adSkip.observeAdModule();
    } else {
      observer.disconnect();
    }
  });
}

main();

// Function to remove various elements
function removeElements() {
    // Remove the download button next to like/share
    const mainDownloadButton = document.querySelector('ytd-download-button-renderer');
    if (mainDownloadButton) {
        mainDownloadButton.style.display = 'none';
    }

    // Remove the download option from the three-dot menu
    const menuDownloadButton = document.querySelector('ytd-menu-service-item-download-renderer');
    if (menuDownloadButton) {
        menuDownloadButton.style.display = 'none';
    }

    // Remove the 'Thanks' button
    const thanksButton = document.querySelector('yt-button-view-model button[aria-label="Thanks"]');
    if (thanksButton) {
        thanksButton.closest('yt-button-view-model').remove();
    }

    // Remove the 'Clip' button
    const clipButton = document.querySelector('yt-button-view-model button[aria-label="Clip"]');
    if (clipButton) {
        clipButton.closest('yt-button-view-model').remove();
    }

    // Remove sponsored ads
    const adContainer = document.querySelector('ytd-companion-slot-renderer');
    if (adContainer) {
        adContainer.remove();
    }

    // Remove 'Autoplay' button
    const autoplayButton = document.querySelector('button[aria-label="Autoplay is off"]');
    if (autoplayButton) {
        autoplayButton.style.display = 'none';
    }

    // Skip YouTube Ad Script
// This script runs in the background of YouTube pages and automatically skips ads or closes overlays if present

(function() {
    // Function to skip ads or close the overlay
    const skipAds = () => {
        const skipButton = document.querySelector('.ytp-ad-skip-button'); 
        const adOverlay = document.querySelector('.ytp-ad-overlay-close-container');
        
        if (adOverlay !== null) {
            adOverlay.click();  // Close ad overlay
        }
        
        if (skipButton !== null) {
            skipButton.click();  // Skip ad
        }
    };

    // Run the function every 2 seconds to ensure that it can catch all ads
    setInterval(skipAds, 2000);
})();

}



// Initial cleanup on page load
removeElements();

// Run again whenever the page changes (for SPA behavior)
const observer = new MutationObserver(removeElements);
observer.observe(document.body, { childList: true, subtree: true });
