const STORAGE_KEY = 'yad2-marker';
const HTML_ICON = `<div style="position: absolute; right: -25px; cursor: pointer;" class="close-ad"><svg fill="#ff0000" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24px" height="24px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve"><g id="Duotone"></g><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></g>
</svg></div>`;

type adStorage = Record<string, number>;

export const getParentEl = (el: HTMLElement) => {
    while (
        !el.classList.contains('feeditem') &&
        !el.classList.contains('table')
    ) {
        el = el.parentElement!;
    }
    return el;
};

const readFromStorage = async (): Promise<adStorage> => {
    const storage = new Promise(function (resolve) {
        chrome.storage.sync.get(STORAGE_KEY, (response) => {
            resolve(response[STORAGE_KEY]);
        });
    });

    return ((await storage) as adStorage) ?? {};
};

const hideAllAds = () => {
    //choosing page elements to hide
    const selectors =
        '.yad1_feed_item.premium, .yad1_row.top, .recommended_agencies, .inner_aside_container, .homeprices, #desktop-top-banners, .top_boxes_row.inactive, .y1_right_side.dynamic_cmp.accordion_wide_theme, .dynamic_cmp_wrapper.size_x1_3.gray_back, .feed-list-platinum, .dominant_realtor, .yad1_list';
    const adsArray = Array.from(
        document.querySelectorAll(selectors)
    ) as HTMLElement[];
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

const onCloseBtnClick = async (event: Event) => {
    //
    const feedItemElement = getParentEl(event.target as HTMLElement);
    const id = (
        feedItemElement!.firstElementChild!.nextSibling as HTMLElement
    ).getAttribute('item-id')!;
    const storage = await readFromStorage();

    if (id in storage) {
        delete storage[id];
        await saveToStorage(storage);
        unhideItem({ id, feedItemElement });
    } else {
        storage[id] = 1;
        await saveToStorage(storage);
        console.log(storage);
        hideItem({ feedItemElement });
    }
};

interface IHideItem {
    feedItemElement: HTMLElement;
}

const hideItem = async ({ feedItemElement }: IHideItem) => {
    const colorContainer = (
        feedItemElement!.firstElementChild!.nextSibling! as HTMLElement
    ).firstElementChild;

    if (colorContainer) {
        (colorContainer as HTMLElement).style.backgroundColor = 'gray';
    }
};

interface IUnhideItem {
    id: string;
    feedItemElement: HTMLElement;
}

const unhideItem = ({ id, feedItemElement }: IUnhideItem) => {
    //give ad normal height
    (
        feedItemElement.firstElementChild!.nextSibling!
            .firstChild! as HTMLElement
    ).style.backgroundColor = '';

    console.log(`ID '${id}' Removed`);
};

const saveToStorage = (storage: adStorage) => {
    chrome.storage.sync.set({
        [STORAGE_KEY]: storage,
    });
};

// Hide on first load id's from chrome storage
const searchHideOnLoad = (storage: adStorage) => {
    const ids = Object.keys(storage);
    console.log(`${ids.length} ads in memory`);
    for (const id of ids) {
        const postElToHide = document.querySelector(`[item-id="${id}"]`);
        if (postElToHide) {
            (
                postElToHide!.firstElementChild as HTMLElement
            ).style.backgroundColor = 'gray';
        }
    }
};

window.onload = async () => {
    const storage = await readFromStorage();
    console.log(storage);
    const init = () => {
        console.log(`yad2 marker initialized`);
        hideAllAds();
        insertCloseBtn();
        setCloseBtnListeners();
        searchHideOnLoad(storage);
    };
    init();
};
