let url = '';
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
    if (changeInfo.url && changeInfo.url !== url) {
        url = changeInfo.url;
        chrome.tabs.sendMessage(tabId, {
            message: 'urlChanged',
            url: changeInfo.url,
        });
    }
});
