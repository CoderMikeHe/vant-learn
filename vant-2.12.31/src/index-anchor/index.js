import { createNamespace } from '../utils';
import { ChildrenMixin } from '../mixins/relation';
import { BORDER_BOTTOM } from '../utils/constant';
import { getScrollTop, getRootScrollTop } from '../utils/dom/scroll';

const [createComponent, bem] = createNamespace('index-anchor');

export default createComponent({
  mixins: [ChildrenMixin('vanIndexBar', { indexKey: 'childrenIndex' })],

  props: {
    index: [Number, String],
    // 拓展属性
    // 如果不传 高亮颜色 会去取 父组件的 highlightColor 属性
    // 高亮时标签 文字颜色 
    highlightColor: String,
  },

  data() {
    return {
      top: 0,
      left: null,
      rect: { top: 0, height: 0 },
      width: null,
      active: false,
    };
  },

  computed: {
    sticky() {
      return this.active && this.parent.sticky;
    },

    anchorStyle() {
      // 只有吸顶才需要
      if (this.sticky) {
        return {
          zIndex: `${this.parent.zIndex}`,
          left: this.left ? `${this.left}px` : null,
          width: this.width ? `${this.width}px` : null,
          transform: `translate3d(0, ${this.top}px, 0)`,
          color: this.highlightColor || this.parent.highlightColor,
        };
      }
    },
  },

  mounted() {
    const rect = this.$el.getBoundingClientRect();
    this.rect.height = rect.height;
  },

  methods: {
    scrollIntoView() {
      // https://developer.mozilla.org/zh-CN/docs/Web/API/Element/scrollIntoView
      this.$el.scrollIntoView();
    },
    // 计算这个元素在滚动容器的位置
    getRect(scroller, scrollerRect) {
      const el = this.$el;
      const elRect = el.getBoundingClientRect();
      this.rect.height = elRect.height;
      
      if (scroller === window || scroller === document.body) {
        this.rect.top = elRect.top + getRootScrollTop();
      } else {
        this.rect.top = elRect.top + getScrollTop(scroller) - scrollerRect.top;
      }

      return this.rect;
    },
  },

  render() {
    const { sticky } = this;

    return (
      <div style={{ height: sticky ? `${this.rect.height}px` : null }}>
        <div
          style={this.anchorStyle}
          class={[bem({ sticky }), { [BORDER_BOTTOM]: sticky }]}
        >
          {this.slots('default') || this.index}
        </div>
      </div>
    );
  },
});
