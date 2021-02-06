const HTML_ICON = `<div style="position: absolute; right: -25px; cursor: pointer;" class="close-ad"><svg fill="#ff0000" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24px" height="24px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve"><g id="Duotone"></g><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></g>
</svg></div>`;

window.onload = async function () {
  // DOM is loaded and ready for manipulation

  let savedData = { filtered: await readFromStorage() };
  init();

  function init() {
    console.log(`yad2 marker initiated`);
    hideAllAds();
    insertXButton();
    addXbuttonListeners();
    searchHideOnLoad();
  }

  function hideAllAds() {
    //choosing page elements to hide
    adsArray = Array.from(
      document.querySelectorAll(
        '.yad1_feed_item.premium, .yad1_row.top, .recommended_agencies, .inner_aside_container, .homeprices, #desktop-top-banners, .top_boxes_row.inactive, .y1_right_side.dynamic_cmp.accordion_wide_theme, .dynamic_cmp_wrapper.size_x1_3.gray_back, .feed-list-platinum, .dominant_realtor, .yad1_list'
      )
    );
    adsArray.forEach((ad) => (ad.style.display = 'none'));
  }
  function insertXButton() {
    //Insert X button
    pagePosts = Array.from(document.querySelectorAll('.feed_item'));
    pagePosts.forEach((post) => {
      post.insertAdjacentHTML('beforebegin', HTML_ICON);
    });
  }

  function addXbuttonListeners() {
    /* Get all elements with class="close" */
    const closebtns = document.getElementsByClassName('close-ad');

    /* Loop through the elements, and hide the parent, when clicked on */
    for (let i = 0; i < closebtns.length; i++) {
      closebtns[i].addEventListener('click', function (event) {
        //to el: "color_container"
        this.nextSibling.firstElementChild.style.backgroundColor = 'gray';

        //3 elements upward to "feed_item_X"
        id = this.nextSibling.getAttribute('item-id');

        //add to db
        saveIdToStorage(id);
      });
    }
  }

  async function readFromStorage() {
    var p = new Promise(function (resolve, reject) {
      chrome.storage.sync.get(['filtered'], (res) => {
        resolve(res.filtered);
      });
    });

    const memoryData = (await p) || [];
    // console.log(memoryData);
    return memoryData;
  }

  // Store your data
  function saveIdToStorage(id) {
    let i = savedData.filtered.indexOf(id);
    if (id != null) {
      if (i == -1) {
        savedData.filtered.push(id);
        console.log(
          `ID '${id}' wasn't on storage, therefore it was added to storage and grayed`
        );
      } else {
        removeFromStorage(i, id);
        console.log(`ID '${id}' was already on storage, so it was removed`);
      }
    }

    chrome.storage.sync.set({
      filtered: savedData.filtered,
    });

    function removeFromStorage(i, id) {
      //remove from array
      savedData.filtered.splice(i, 1);
      //give ad normal height
      const hideMe = document.querySelector(`[item-id="${id}"]`);
      hideMe.firstElementChild.style.backgroundColor = null;
    }
  }

  // Hide on first load id's from localStorage
  function searchHideOnLoad() {
    console.log(`${savedData.filtered.length} ads in memory`);
    savedData.filtered.forEach((postID) => {
      //
      //check if ID is on the page
      const postElToHide = document.querySelector(`[item-id="${postID}"]`);
      if (postElToHide) {
        //console.log(`el to hide: ${postElToHide}`);
        postElToHide.firstElementChild.style.backgroundColor = 'gray';
        console.log(`'${postID}' succesfully hidden`);
      }
    });
  }
};
