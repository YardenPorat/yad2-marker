chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
    if (changeInfo.url && changeInfo.url.includes('yad2.co.il/realestate')) {
        chrome.tabs.sendMessage(tabId, {
            message: 'enteredRealEstate',
            url: changeInfo.url,
        });
    }
});
