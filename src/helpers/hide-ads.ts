const ADS_SELECTORS = [
    '.yad1_feed_item.premium',
    '.yad1_row.top',
    '.recommended_agencies',
    '.inner_aside_container',
    '.homeprices',
    '#desktop-top-banners',
    '.top_boxes_row.inactive',
    '.y1_right_side.dynamic_cmp.accordion_wide_theme',
    '.dynamic_cmp_wrapper.size_x1_3.gray_back',
    '.feed-list-platinum',
    '.dominant_realtor',
    '.yad1_list',
    '.dfp_v2',
];
export const hideAllAds = () => {
    const adsArray = document.querySelectorAll<HTMLElement>(ADS_SELECTORS.join(', '));

    for (const ad of adsArray) {
        ad.style.display = 'none';
    }
};
