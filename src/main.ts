import { hideAllAds } from './components/hide-ads';

const STORAGE_KEY = 'yad2-marker';
const HTML_ICON = `<div style="position: absolute; right: -25px; cursor: pointer;" class="close-ad"><svg fill="#ff0000" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24px" height="24px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve"><g id="Duotone"></g><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></g>
</svg></div>`;

type adStorage = Record<string, number>;

const buttonListeners: Element[] = [];
const DEBUG = false;
// eslint-disable-next-line no-console
const log = (message: string) => DEBUG && console.log(message);

export const getFeedItem = (el: HTMLElement) => {
    while (el.classList.value !== 'feeditem table') {
        el = el.parentElement!;
    }
    return el;
};

const readFromStorage = async (): Promise<adStorage> => {
    const storage =
        (await new Promise(function (resolve) {
            chrome.storage.sync.get(STORAGE_KEY, (response) => {
                resolve(response[STORAGE_KEY]);
            });
        })) ?? {};

    return storage as adStorage;
};

const insertButton = () => {
    const feedItems = document.querySelectorAll('.feed_item');
    for (const item of feedItems) {
        item.insertAdjacentHTML('beforebegin', HTML_ICON);
    }

    const buttons = document.getElementsByClassName('close-ad');
    buttonListeners.push(...buttons);
    for (const button of buttons) {
        button.addEventListener('click', onButtonClick);
    }
};

const onButtonClick = (event: Event) => {
    const feedItemElement = getFeedItem(event.target as HTMLElement);
    const id = (feedItemElement.firstElementChild!.nextSibling as HTMLElement).getAttribute('item-id')!;

    void (async function () {
        const storage = await readFromStorage();
        if (id in storage) {
            unhideItem(feedItemElement);
            delete storage[id];
            // eslint-disable-next-line no-console
            console.log(`'${id}' Removed`);
            await saveToStorage(storage);
        } else {
            hideItem(feedItemElement);
            storage[id] = 1;
            // eslint-disable-next-line no-console
            console.log(`'${id}' Added`);
            await saveToStorage(storage);
        }
    })();
};

const hideItem = (feedItemElement: HTMLElement) => {
    (feedItemElement.firstElementChild!.nextSibling!.firstChild as HTMLElement).style.backgroundColor = 'gray';
};

const unhideItem = (feedItemElement: HTMLElement) => {
    (feedItemElement.firstElementChild!.nextSibling!.firstChild! as HTMLElement).style.backgroundColor = '';
};

const saveToStorage = async (storage: adStorage) => {
    await chrome.storage.sync.set({
        [STORAGE_KEY]: storage,
    });
};

/** Hide on first load id's from chrome storage */
const searchHideOnLoad = async () => {
    const storage = await readFromStorage();
    const ids = Object.keys(storage);
    // eslint-disable-next-line no-console
    console.log(`${ids.length} Items in memory`);
    for (const id of ids) {
        const postElToHide = document.querySelector(`[item-id="${id}"]`);
        if (postElToHide) {
            log(`Found '${id}', trying to hide`);
            (postElToHide.firstElementChild as HTMLElement).style.backgroundColor = 'gray';
        }
    }
};

async function init() {
    // eslint-disable-next-line no-console
    console.log(`Yad2 marker initialized`);
    hideAllAds();
    insertButton();
    await searchHideOnLoad();
}

window.onload = async () => {
    log('onload event');
    await init();
};

chrome.runtime.onMessage.addListener(function (request) {
    if (request.message === 'urlChanged') {
        log('urlChanged event');
        cleanListeners();
        setTimeout(() => void init(), 2_000);
    }
});

function cleanListeners() {
    for (const button of buttonListeners) {
        button.removeEventListener('click', onButtonClick);
        button.remove();
    }
    buttonListeners.splice(0);
}
