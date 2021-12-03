/**
 * Bind event when mounted or activated
 */
import { on, off } from '../utils/dom/event';

let uid = 0;

// - [JS中call()、apply()、bind()的区别及用法](https://blog.csdn.net/wyyandyou_6/article/details/81488103)
export function BindEventMixin(handler) {
  const key = `binded_${uid++}`;

  // 绑定事件
  function bind() {
    if (!this[key]) {
      handler.call(this, on, true);
      this[key] = true;
    }
  }

  // 解绑事件
  function unbind() {
    if (this[key]) {
      handler.call(this, off, false);
      this[key] = false;
    }
  }

  return {
    mounted: bind,
    activated: bind,
    deactivated: unbind,
    beforeDestroy: unbind,
  };
}
