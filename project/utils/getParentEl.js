export const getParentEl = (el) => {
  while (
    !el.classList.contains('feeditem') &&
    !el.classList.contains('table')
  ) {
    el = el.parentElement;
  }
  return el;
};
