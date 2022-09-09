// Utils
import { createNamespace, addUnit } from '../utils';
import { scrollTopTo } from '../tabs/utils';

// Components
import Icon from '../icon';
import Sidebar from '../sidebar';
import SidebarItem from '../sidebar-item';


const [createComponent, bem] = createNamespace('tree-select');

export default createComponent({
  props: {
    max: {
      type: [Number, String],
      default: Infinity,
    },
    items: {
      type: Array,
      default: () => [],
    },
    height: {
      type: [Number, String],
      default: 300,
    },
    activeId: {
      type: [Number, String, Array],
      default: 0,
    },
    selectedIcon: {
      type: String,
      default: 'success',
    },
    mainActiveIndex: {
      type: [Number, String],
      default: 0,
    },
  },

  data() {
    return {

    }
  },

  computed: {
    isMultiple(){
      return Array.isArray(this.activeId);
    }
  },

  watch: {
    // 也需要监听左侧导航栏索引的变化，但是滚动时不加动画，因为此值有可能是异步设置的
    mainActiveIndex(val) {
      // 这种场景直接滚动
      this.scrollIntoNavView(+val, true)
    },

    // 也需要监听右侧内容栏索引的的变化，但是滚动时不加动画，因为此值有可能是异步设置的
    activeId() {
      // 这种场景直接滚动
      this.scrollIntoContentView(this.getCurrentContentIndex(+this.mainActiveIndex), true)
    },

    // 数据源变化了 设置一下
    items(){
      this.init()
    }
  },

  async mounted() {
    await this.$nextTick()
    // 获取滚动器
    const { navScroller, scroller } = this.$refs
    this.navScroller = navScroller.$el
    this.scroller = scroller

    // 滚动指定的nav和content索引
    this.scrollToView(true)
  },

  activated() {
    this.scrollToView(true)
  },

  methods: {

    async init() {
      // 这里要置空
      this.lastScrollActiveId = null

      await this.$nextTick()

      // 滚动指定的nav和content索引
      this.scrollToView(true)
    },

    isActiveItem(id) {
      return this.isMultiple
        ? this.activeId.indexOf(id) !== -1
        : this.activeId === id;
    },


    renderContent() {
      if (this.slots.content) {
        return this.slots.content();
      }

      const selectedItem = this.items[+this.mainActiveIndex] || {};
      const subItems = selectedItem.children || [];

      return subItems.map((item, index) => (
        <div
          key={item.id}
          class={[
            'van-ellipsis',
            bem('item', {
              active: this.isActiveItem(item.id),
              disabled: item.disabled,
            }),
          ]}
          onClick={() => {
            if (!item.disabled) {
              let newActiveId = item.id;
              if (this.isMultiple) {
                newActiveId = (this.activeId).slice();

                const index = newActiveId.indexOf(item.id);

                if (index !== -1) {
                  newActiveId.splice(index, 1);
                } else if (newActiveId.length < this.max) {
                  newActiveId.push(item.id);
                }
              }

              this.$emit('update:active-id', newActiveId);
              this.$emit('click-item', item);
              // compatible with legacy usage, should be removed in next major version
              this.$emit('itemclick', item);

              // 滚动到指定的index
              this.scrollIntoContentView(index)

              // 由于content可以支持多选，所以要记录最后一次滚动的item
              this.lastScrollActiveId = item.id
            }
          }}
        >
          {item.text}
          {this.isActiveItem(item.id) && (
            <Icon name={this.selectedIcon} class={bem('selected')} />
          )}
        </div>
      ));
    },

    // 获取当前content索引
    getCurrentContentIndex(mainActiveIndex) {
      let index = 0
      const activeId = this.isMultiple ? this.lastScrollActiveId : this.activeId
      const selectedItem = this.items[mainActiveIndex] || {};
      const subItems = selectedItem.children || [];
      for (let i = 0; i < subItems.length; i++) {
        const { id } = subItems[i];
        if (activeId === id) {
          index = i
          break
        }
      }
      return index
    },

    // 滚动到指定的 nav 和 content
    scrollToView(immediate) {
      this.navScroller && this.scrollIntoNavView(+this.mainActiveIndex, immediate)
      this.scroller && this.scrollIntoContentView(this.getCurrentContentIndex(+this.mainActiveIndex), immediate)
    },

    // 滚动到某个nav 居中
    scrollIntoNavView(index, immediate) {
      const {navScroller} = this;

      // 容错
      if (!navScroller) {
        return;
      }

      // 获取当前nav index
      const mIdx = index;
      if (mIdx < 0) {
        return;
      }

      // 获取
      const nav = navScroller.children[mIdx];
      if (!nav) {
        return;
      }

      // 如果还在动画中 直接过掉
      if (this.navAnimating) {
        return
      }

      // 动画开始
      this.navAnimating = true
      // 滚动到指定位置
      const to =
        nav.offsetTop - (navScroller.offsetHeight - nav.offsetHeight) / 2;
      scrollTopTo(navScroller, to, immediate ? 0 : 0.3, () => {
        // 动画结束
        this.navAnimating = false
      });
    },

    // 滚动到指定view
    scrollIntoContentView(index, immediate) {
      const {scroller} = this;

      // 容错
      if (!scroller) {
        return;
      }

      // index
      if (index < 0) {
        return;
      }

      // 获取
      const content = scroller.children[index];
      if (!content) {
        return;
      }

      // 如果还在动画中 直接过掉
      if (this.contentAnimating) {
        return
      }

      // 动画开始
      this.contentAnimating = true;

      // 滚动到指定位置
      const to =
        content.offsetTop - (scroller.offsetHeight - content.offsetHeight) / 2;
      scrollTopTo(scroller, to, immediate ? 0 : 0.3, () => {
        this.contentAnimating = false;
      });
    },
  },

  render() {

    if (process.env.NODE_ENV === 'development') {
      if (this.$listeners.navclick) {
        console.warn(
          '[Vant] TreeSelect: "navclick" event is deprecated, use "click-nav" instead.'
        );
      }
      if (this.$listeners.itemclick) {
        console.warn(
          '[Vant] TreeSelect: "itemclick" event is deprecated, use "click-item" instead.'
        );
      }
    }

    const Navs = this.items.map((item) => (
      <SidebarItem
        dot={item.dot}
        info={item.badge ?? item.info}
        title={item.text}
        disabled={item.disabled}
        class={[bem('nav-item'), item.className]}
      />
    ));

    return (
      <div class={bem()} style={{ height: addUnit(this.height) }}>
        <Sidebar
          ref="navScroller"
          class={bem('nav')}
          activeKey={this.mainActiveIndex}
          onChange={(index) => {
            this.$emit('update:main-active-index', index);
            this.$emit('click-nav', index);
            // compatible with legacy usage, should be removed in next major version
            this.$emit('navclick', index);

            // 滚动到指定位置
            this.scrollIntoNavView(index);

            // 滚动到指定的contentView
            this.scrollIntoContentView(this.getCurrentContentIndex(index), true);
          }}
        >
          {Navs}
        </Sidebar>
        <div ref="scroller" class={bem('content')}>{this.renderContent()}</div>
      </div>
    );
  }

});
