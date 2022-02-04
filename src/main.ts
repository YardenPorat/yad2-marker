import { debounce } from './helpers/debounce';
import { hideAllAds } from './helpers/hide-ads';

const STORAGE_KEY = 'yad2-marker';
const HTML_ICON = `
<div style="position: absolute; right: -25px; cursor: pointer;" class="close-ad">
    <svg 
        fill="#ff0000"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        width="24px"
        height="24px"
        viewBox="0 0 24 24"
        enable-background="new 0 0 24 24">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
    </svg>
</div>`.trim();

type adStorage = Record<string, number>;

const buttonListeners: Element[] = [];
const DEBUG = false;
// eslint-disable-next-line no-console
const log = (message: string) => DEBUG && console.log(message);
const isMapMode = (url: string) => url.includes('/map?');

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
    isMapMode(location.href)
        ? ((feedItemElement.firstChild!.nextSibling as HTMLElement).style.backgroundColor = 'gray')
        : ((feedItemElement.firstChild!.nextSibling!.firstChild as HTMLElement).style.backgroundColor = 'gray');
};

const unhideItem = (feedItemElement: HTMLElement) => {
    isMapMode(location.href)
        ? ((feedItemElement.firstChild!.nextSibling as HTMLElement).style.backgroundColor = 'unset')
        : ((feedItemElement.firstElementChild!.nextSibling!.firstChild! as HTMLElement).style.backgroundColor = '');
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

    log(`${ids.length} Items in memory`);

    for (const id of ids) {
        const postElToHide = document.querySelector<HTMLElement>(`[item-id="${id}"]`);
        if (postElToHide) {
            log(`Found '${id}', trying to hide`);

            if (isMapMode(location.href)) {
                log('on map mode');
                postElToHide.style.backgroundColor = 'gray';
            } else {
                (postElToHide.firstElementChild as HTMLElement).style.backgroundColor = 'gray';
            }
        }
    }
};

function init(wait = 1_000) {
    setTimeout(() => {
        log(`Yad2 marker init()`);
        hideAllAds();
        insertButton();
        void searchHideOnLoad();
    }, wait);
}

let mapFeedObserver: MutationObserver;
window.onload = () => {
    log('onload event');
    shortDebouncedInit();
    if (isMapMode(location.href)) {
        observeMapFeed();
    } else if (mapFeedObserver) {
        mapFeedObserver.disconnect();
    }
};

chrome.runtime.onMessage.addListener(function (request) {
    if (request.message === 'urlChanged') {
        log('urlChanged event with url: ' + request.url);
        cleanListeners();
        shortDebouncedInit();
        if (isMapMode(location.href)) {
            observeMapFeed();
        } else if (mapFeedObserver) {
            mapFeedObserver.disconnect();
        }
    }
});

/** Should be activates on url change since there are no listener on load */
function cleanListeners() {
    for (const button of buttonListeners) {
        button.removeEventListener('click', onButtonClick);
        button.remove();
    }
    buttonListeners.splice(0);
}

const shortDebouncedInit = debounce(init, 1_000);
const observeMapFeed = () => {
    const target = document.querySelector('.feed') as HTMLTitleElement;
    mapFeedObserver = new MutationObserver(() => {
        log('MutationObserver event');
        shortDebouncedInit();
    });
    mapFeedObserver.observe(target, { childList: true });
};
