const url = 'yad2.co.il';

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
    if (changeInfo?.url && changeInfo.url.includes(url)) {
        chrome.tabs.sendMessage(tabId, {
            message: 'urlChanged',
            url: changeInfo.url,
        });
    }
});
