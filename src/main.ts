import { hideAllAds } from './components/hide-ads';

const STORAGE_KEY = 'yad2-marker';
const HTML_ICON = `<div style="position: absolute; right: -25px; cursor: pointer;" class="close-ad"><svg fill="#ff0000" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24px" height="24px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve"><g id="Duotone"></g><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></g>
</svg></div>`;

type adStorage = Record<string, number>;

export const getFeedItem = (el: HTMLElement) => {
    while (el.classList.value !== 'feeditem table') {
        el = el.parentElement!;
    }
    return el;
};

const readFromStorage = async (): Promise<adStorage> => {
    const storage =
        ((await new Promise(function (resolve) {
            chrome.storage.sync.get(STORAGE_KEY, (response) => {
                resolve(response[STORAGE_KEY]);
            });
        })) as adStorage) ?? {};

    return storage;
};

const insertButton = () => {
    const feedItems = document.querySelectorAll('.feed_item');
    for (const item of feedItems) {
        item.insertAdjacentHTML('beforebegin', HTML_ICON);
    }

    const buttons = document.getElementsByClassName('close-ad');
    for (const button of buttons) {
        button.addEventListener('click', onButtonClick);
    }
};

const onButtonClick = async (event: Event) => {
    const feedItemElement = getFeedItem(event.target as HTMLElement);
    const id = (
        feedItemElement.firstElementChild!.nextSibling as HTMLElement
    ).getAttribute('item-id')!;

    const storage = await readFromStorage();

    if (id in storage) {
        unhideItem(feedItemElement);
        delete storage[id];
        console.log(`'${id}' Removed`);
        await saveToStorage(storage);
    } else {
        hideItem(feedItemElement);
        storage[id] = 1;
        console.log(`'${id}' Added`);
        await saveToStorage(storage);
    }
};

const hideItem = async (feedItemElement: HTMLElement) => {
    (
        feedItemElement.firstElementChild!.nextSibling!
            .firstChild as HTMLElement
    ).style.backgroundColor = 'gray';
};

const unhideItem = (feedItemElement: HTMLElement) => {
    (
        feedItemElement.firstElementChild!.nextSibling!
            .firstChild! as HTMLElement
    ).style.backgroundColor = '';
};

const saveToStorage = (storage: adStorage) => {
    chrome.storage.sync.set({
        [STORAGE_KEY]: storage,
    });
};

// Hide on first load id's from chrome storage
const searchHideOnLoad = (storage: adStorage) => {
    const ids = Object.keys(storage);
    console.log(`${ids.length} Items in memory`);
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
    console.log(`yad2 marker initialized`);
    hideAllAds();
    insertButton();
    searchHideOnLoad(storage);
};
