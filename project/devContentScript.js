import { getParentEl } from './utils/getParentEl';

const HTML_ICON = `<div style="position: absolute; right: -25px; cursor: pointer;" class="close-ad"><svg fill="#ff0000" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24px" height="24px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve"><g id="Duotone"></g><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></g>
</svg></div>`;

const readFromStorage = async () => {
    const storagePromise = new Promise(function (resolve, reject) {
        chrome.storage.sync.get(['filtered'], (response) => {
            resolve(response.filtered);
        });
    });

    return (await storagePromise) || [];
};

const hideAllAds = () => {
    //choosing page elements to hide
    const selectors =
        '.yad1_feed_item.premium, .yad1_row.top, .recommended_agencies, .inner_aside_container, .homeprices, #desktop-top-banners, .top_boxes_row.inactive, .y1_right_side.dynamic_cmp.accordion_wide_theme, .dynamic_cmp_wrapper.size_x1_3.gray_back, .feed-list-platinum, .dominant_realtor, .yad1_list';
    const adsArray = Array.from(document.querySelectorAll(selectors));
    adsArray.forEach((ad) => (ad.style.display = 'none'));
};

const insertCloseBtn = () => {
    //Insert X button
    const pagePosts = Array.from(document.querySelectorAll('.feed_item'));
    pagePosts.forEach((post) => {
        post.insertAdjacentHTML('beforebegin', HTML_ICON);
    });
};

const setCloseBtnListeners = () => {
    // Get all elements with class="close-ad"
    const closeButtons = document.getElementsByClassName('close-ad');

    // Loop through the elements, and hide the parent, when clicked on
    for (let i = 0; i < closeButtons.length; i++) {
        closeButtons[i].addEventListener('click', onCloseBtnClick);
    }
};

const onCloseBtnClick = async (event) => {
    //
    const feedItemElement = getParentEl(event.target);
    const id = feedItemElement.firstElementChild.nextSibling.getAttribute(
        'item-id'
    );
    const savedData = { filtered: await readFromStorage() };

    let i = savedData.filtered.indexOf(id);
    if (i == -1) {
        // exist on storage
        hideItem(id, savedData, feedItemElement);
    } else {
        // does not exist on storage
        unhideItem(id, savedData, feedItemElement, i);
    }
};

const hideItem = async (id, savedData, feedItemElement) => {
    savedData.filtered.push(id);
    const colorContainer =
        feedItemElement.firstElementChild.nextSibling.firstElementChild;

    //graying: "color_container"
    colorContainer.style.backgroundColor = 'gray';

    saveToChromeStorage(savedData);
    console.log(
        `ID '${id}' wasn't on storage, therefore it was added to storage and grayed`
    );
};

const unhideItem = (id, savedData, feedItemElement, i) => {
    //remove from array
    savedData.filtered.splice(i, 1);
    //give ad normal height
    feedItemElement.firstElementChild.nextSibling.firstElementChild.style.backgroundColor = null;
    saveToChromeStorage(savedData);
    console.log(`ID '${id}' was already on storage, so it was removed`);
};

const saveToChromeStorage = (savedData) => {
    chrome.storage.sync.set({
        filtered: savedData.filtered,
    });
};

// Hide on first load id's from chrome storage
const searchHideOnLoad = (savedData) => {
    console.log(`${savedData.filtered.length} ads in memory`);
    savedData.filtered.forEach((postID) => {
        //
        //check if ID is on the page
        const postElToHide = document.querySelector(`[item-id="${postID}"]`);
        if (postElToHide) {
            //console.log(`el to hide: ${postElToHide}`);
            postElToHide.firstElementChild.style.backgroundColor = 'gray';
            console.log(`'${postID}' successfully hidden`);
        }
    });
};

window.onload = async () => {
    // DOM is loaded and ready for manipulation

    let savedData = { filtered: await readFromStorage() };

    const init = () => {
        console.log(`yad2 marker initiated`);
        hideAllAds();
        insertCloseBtn();
        setCloseBtnListeners();
        searchHideOnLoad(savedData);
    };
    init();
};
