export function isHidden(el: HTMLElement) {
  const style = window.getComputedStyle(el);
  const hidden = style.display === 'none';

  // offsetParent returns null in the following situations:
  // 1. The element or its parent element has the display property set to none.
  // 2. The element has the position property set to fixed
  // https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLElement/offsetParent
  // https://blog.csdn.net/u012532033/article/details/72851692 
  const parentHidden = el.offsetParent === null && style.position !== 'fixed';

  return hidden || parentHidden;
}
