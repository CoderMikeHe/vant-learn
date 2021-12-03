// Utils
import { createNamespace, isDef } from '../utils';
import { isHidden } from '../utils/dom/style';
import { preventDefault } from '../utils/dom/event';
import {
  getScroller,
  getScrollTop,
  getRootScrollTop,
  setRootScrollTop,
} from '../utils/dom/scroll';

// Mixins
import { TouchMixin } from '../mixins/touch';
import { ParentMixin } from '../mixins/relation';
import { BindEventMixin } from '../mixins/bind-event';


// A ~ Z
function genAlphabet() {
  const indexList = [];
  const charCodeOfA = 'A'.charCodeAt(0);

  for (let i = 0; i < 26; i++) {
    indexList.push(String.fromCharCode(charCodeOfA + i));
  }

  return indexList;
}

const [createComponent, bem] = createNamespace('index-bar');

export default createComponent({
  mixins: [
    TouchMixin,
    ParentMixin('vanIndexBar'),
    BindEventMixin(function (bind) {
      // bind: on/off 函数
      if (!this.scroller) {
        this.scroller = getScroller(this.$el);
      }
      bind(this.scroller, 'scroll', this.onScroll);
    }),
  ],

  props: {
    // z-index 层级
    zIndex: [Number, String],
    // 索引字符高亮颜色
    highlightColor: String,
    // 是否开启锚点自动吸顶 默认开启
    sticky: {
      type: Boolean,
      default: true,
    },
    // 锚点自动吸顶时与顶部的距离
    stickyOffsetTop: {
      type: Number,
      default: 0,
    },
    // 索引字符列表
    indexList: {
      type: Array,
      default: genAlphabet,
    },

    // 拓展属性
    // index-bar Hint 弹出类型，
    // none：vant 默认样式
    // left: 微信通讯录样式
    // center: 手机通讯录样式
    hintType: {
      type: String,
      default: 'none',
    },

    // 高亮时index-tag背景色
    highlightBackgroundColor: String,

    // 忽略的Tags，这些忽略Tag, 不会高亮显示，点击或长按 不会弹出 tagHint
    ignoreTags: {
      type: Array,
      default: () => []
    },
  },

  data() {
    return {
      // 默认 锚点索引
      activeAnchorIndex: null,

      // 是否是手指正在触摸状态
      isTouching: false,
      // 手指按下时 活跃的锚点
      touchActiveAnchorIndex: null
    };
  },

  computed: {
    // 侧边栏样式
    sidebarStyle() {
      // 侧边栏永远要比indexBar高
      if (isDef(this.zIndex)) {
        return {
          zIndex: this.zIndex + 1,
        };
      }
    },
    // 高亮字体颜色
    highlightStyle() {
      const { highlightColor } = this;
      if (highlightColor) {
        return {
          color: highlightColor,
        };
      }
    },
  },

  watch: {
    // 索引列表一旦变化 
    indexList() {
      this.$nextTick(this.onScroll);
    },

    // 高亮的锚点索引变化
    activeAnchorIndex(value) {
      if (value) {
        this.$emit('change', value);
      }
    },
  },

  methods: {
    onScroll() {
      if (isHidden(this.$el)) {
        return;
      }
      // 获取滚动容器的scrollTop
      const scrollTop = getScrollTop(this.scroller);
      // 返回滚动容器元素的大小及其相对于视口的位置 因为滚动容器可能不是 window/body，而且也有可能距离视口顶部有一段距离
      const scrollerRect = this.getScrollerRect();
      // 计算每一个锚点在滚动容器中的具体位置 top/height
      const rects = this.children.map((item) =>
        item.getRect(this.scroller, scrollerRect)
      );
      // 获取当前活跃的锚点
      const active = this.getActiveAnchorIndex(scrollTop, rects);

      this.activeAnchorIndex = this.indexList[active];

      if (this.sticky) {
        this.children.forEach((item, index) => {
          // 由于要设置 active 和 active-1 锚点的 fixed 属性，所以要把其，父容器的宽高 继承过来
          if (index === active || index === active - 1) {
            const rect = item.$el.getBoundingClientRect();
            item.left = rect.left;
            item.width = rect.width;
          } else {
            item.left = null;
            item.width = null;
          }

          // 核心代码
          if (index === active) {
            // 这里锚点已经是 fixed 定位
            item.active = true;
            
            // 计算top: 由于锚点 fixed 定位的 top为0,这里设置的top 是用于设置自身锚点的transform.y
            // rects[index].top 是相对于滚动容器的位置，是固定值
            // scrollTop: 是变量，向上滚动 增大， 向下滚动 减小
            item.top =
              Math.max(this.stickyOffsetTop, rects[index].top - scrollTop) +
              scrollerRect.top;
          } else if (index === active - 1) {
            // 由于涉及到上一个活跃锚点 会被新的活跃锚点 随着滚动而顶掉
            const activeItemTop = rects[active].top - scrollTop;
            // 是否活跃：当活跃的锚点的顶部正好和滚动容器的顶部重合
            item.active = activeItemTop > 0;
            // 设置其top
            item.top = activeItemTop + scrollerRect.top - rects[index].height;
          } else {
            item.active = false;
          }
        });
      }
    },

    getScrollerRect() {
      if (this.scroller.getBoundingClientRect) {
        return this.scroller.getBoundingClientRect();
      }
      return {
        top: 0,
        left: 0,
      };
    },
    // 获取有效的锚点索引
    getActiveAnchorIndex(scrollTop, rects) {
      // 细节：从后往前遍历 找到第一个满足条件的锚点退出即可
      for (let i = this.children.length - 1; i >= 0; i--) {
        // 取出上一个活跃（吸顶）锚点的高度
        const prevHeight = i > 0 ? rects[i - 1].height : 0;
        const reachTop = this.sticky ? prevHeight + this.stickyOffsetTop : 0;
        // 判断某个锚点第一次进入临界值 这里计算的都是相对 滚动容器 来计算的 所以是统一坐标系
        if (scrollTop + reachTop >= rects[i].top) {
          return i;
        }
      }
      return -1;
    },

    onClick(event) {
      this.scrollToElement(event.target);
    },

    // 开始触摸
    onTouchStart(event) {
      // 正在触摸
      this.isTouching = true
      // 调用touch start方法
      this.touchStart(event)

      // 处理事件
      this.handleTouchEvent(event)
    },

    // 正在触摸
    onTouchMove(event) {
      this.touchMove(event);

      if (this.direction === 'vertical') {
        // 阻止默认事件
        preventDefault(event);

        // 处理touch事件
        this.handleTouchEvent(event)
      }
    },

    // 结束或取消touch
    onTouchEnd() {
      this.active = null;

      // 结束触摸
      this.isTouching = false
      // 这里清掉
      this.touchActiveAnchorIndex = null
    },

    // 触摸事件处理
    handleTouchEvent(event){
      const { clientX, clientY } = event.touches[0];
      // https://developer.mozilla.org/zh-CN/docs/Web/API/Document/elementFromPoint
      // 获取点击的元素
      const target = document.elementFromPoint(clientX, clientY);
      if (target) {
        // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset

        // const { index } = target.dataset;
        const index = this.findDatasetIndex(target)

        /* istanbul ignore else */
        if (index && this.touchActiveIndex !== index) {
          
          this.touchActiveIndex = index;

          // 记录手指触摸下的索引
          this.touchActiveAnchorIndex = index

          this.scrollToElement(target);
        }
      }
    },

    scrollTo(index) {
      // 找到指定标签的组件
      const match = this.children.filter(
        (item) => String(item.index) === index
      );

      if (match[0]) {
        // 滚动到父组件的顶部 会触发 onScroll 方法
        match[0].scrollIntoView();

        // ？主要是为了让内容在 锚点组件下
        if (this.sticky && this.stickyOffsetTop) {
          // 向上滚动 stickyOffsetTop
          setRootScrollTop(getRootScrollTop() - this.stickyOffsetTop);
        }
        // 选中某个标签的事件
        this.$emit('select', match[0].index);
      }
    },

    // 滚动到指定的元素
    scrollToElement(element) {
      // const { index } = element.dataset;
      const index = this.findDatasetIndex(element)
      if (index) {
        this.scrollTo(index);
      }
    },

    // 查询dataset index
    findDatasetIndex(target) {
      if (target) {
        const { index } = target.dataset;
        if (index) {
          return index
        }
        return this.findDatasetIndex(target.parentElement)
      }
      return undefined
    },


    // UI层
    // 渲染索引
    renderIndexes(){
      return this.indexList.map((index) => {
        // const active = index === this.activeAnchorIndex;
        // 这里区分一下 按下和松手 这两个状态的 活跃索引 
        const active = this.isTouching ? (index === this.touchActiveAnchorIndex) : (index === this.activeAnchorIndex);
        const ignore = this.ignoreTags.some((value) => {
          return value === index
        })

        return (
          <span
            class={bem('index', { active: active && !ignore })}
            style={active && !ignore ? this.highlightStyle : null}
            data-index={index}
          >
            {this.renderIndexTag(index, active, ignore)}
            { this.hintType === 'left' ? this.renderIndexLeftHint(index, active, ignore) : null}
          </span>
        );
      });
    },

    // 渲染索引tag
    renderIndexTag(index, active, ignore) {
      // 有插槽
      const slot = this.slots('tag', { index, active, ignore });
      if (slot) {
        return slot
      }

      // 默认状态下的样式
      const style = {}
      // 活跃状态且不忽略的场景下
      if (active&&!ignore) {
        if (this.highlightColor) {
          style.color = this.highlightColor;
        }
        if (this.highlightBackgroundColor) {
          style.backgroundColor = this.highlightBackgroundColor;
        }
      }
      return <span style={style} data-index={index}>{index}</span>
    },

    // 渲染索引左侧Hint
    renderIndexLeftHint(index, active, ignore) {
      // 显示hint的场景
      const show = active && this.isTouching && !ignore
      // 获取插槽内容
      const slot = this.slots('hint', { index, active, ignore });
      
      if (slot) {
        return show ? slot : ''
      }

      // 默认场景
      return (
        <div vShow={show} class={bem('hint','pop-left')}>
          <span>{index}</span>
        </div>
      )
    },

    // 渲染索引中间Hint
    renderIndexCenterHint() {

      if (this.hintType !== 'center') {
        return null
      }

      const index = this.touchActiveAnchorIndex
      const active = index !== null
      const ignore = this.ignoreTags.some((value) => {
        return value === index
      })

      // 显示hint的场景
      const show = active && this.isTouching && !ignore
      // 获取插槽内容
      const slot = this.slots('hint', { index, active, ignore });
      
      if (slot) {
        return show ? slot : ''
      }

      // 默认场景
      return (
        <div vShow={show} class={bem('hint','pop-center')}>
          <span>{index}</span>
        </div>
      )
    }
  },

  // UI层
  render() {
    const Indexes = this.renderIndexes()
    const centerHint = this.renderIndexCenterHint()
    return (
      <div class={bem()}>
        <div
          class={bem('sidebar')}
          style={this.sidebarStyle}
          onClick={this.onClick}
          onTouchstart={this.onTouchStart}
          onTouchmove={this.onTouchMove}
          onTouchend={this.onTouchEnd}
          onTouchcancel={this.onTouchEnd}
        >
          {Indexes}
        </div>
        {this.slots('default')}
        {centerHint}
      </div>
    );
  }
});
