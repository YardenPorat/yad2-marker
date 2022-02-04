chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
    if (changeInfo?.url) {
        chrome.tabs.sendMessage(tabId, {
            message: 'urlChanged',
            url: changeInfo.url,
        });
    }
});
