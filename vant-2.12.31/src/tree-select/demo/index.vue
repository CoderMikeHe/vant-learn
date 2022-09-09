<template>
  <demo-section>
    <demo-block :title="t('radioMode')">
      <!-- ref="treeSelect" -->
      <tree-select
        height="55vw"

        :items="items"
        :active-id.sync="activeId"
        :main-active-index.sync="activeIndex"
        @click-item="onClickItem"
        @click-nav="onClickNav"
      />
    </demo-block>

    <demo-block :title="t('multipleMode')">
      <tree-select
        :items="items"
        :active-id.sync="activeIds"
        :main-active-index.sync="activeIndex2"
      />
    </demo-block>

    <demo-block :title="t('customContent')">
      <tree-select
        height="55vw"
        :items="simpleItems"
        :main-active-index.sync="activeIndex3"
      >
        <template #content>
          <van-image
            v-if="activeIndex3 === 0"
            :show-loading="false"
            src="https://img01.yzcdn.cn/vant/apple-1.jpg"
          />
          <van-image
            v-if="activeIndex3 === 1"
            :show-loading="false"
            src="https://img01.yzcdn.cn/vant/apple-2.jpg"
          />
        </template>
      </tree-select>
    </demo-block>

    <demo-block :title="t('showBadge')">
      <tree-select
        height="55vw"
        :items="badgeItems"
        :active-id.sync="activeId2"
        :main-active-index.sync="activeIndex4"
      />
    </demo-block>
  </demo-section>
</template>

<script>
import { zhCNData } from './data-zh';
import { enUSData } from './data-en';
import { deepClone } from '../../utils/deep-clone';
import { scrollTopTo } from '../../tabs/utils';

// Components
import TreeSelect from '../index.tsx';


export default {
  i18n: {
    'zh-CN': {
      showBadge: '徽标提示',
      radioMode: '单选模式',
      multipleMode: '多选模式',
      customContent: '自定义内容',
      data: zhCNData,
      dataSimple: [{ text: '分组 1' }, { text: '分组 2' }],
    },
    'en-US': {
      showBadge: 'Show Badge',
      radioMode: 'Radio Mode',
      multipleMode: 'Multiple Mode',
      customContent: 'Custom Content',
      data: enUSData,
      dataSimple: [{ text: 'Group 1' }, { text: 'Group 2' }],
    },
  },

  components: {
    TreeSelect
  },

  data() {
    return {
      activeId: 10006,
      activeId2: 1,
      activeIds: [100006, 100009],

      activeIndex: 2,
      activeIndex2: 0,
      activeIndex3: 0,
      activeIndex4: 0,
    };
  },

  computed: {
    items() {
      return this.t('data');
    },

    simpleItems() {
      return this.t('dataSimple');
    },

    badgeItems() {
      const data = deepClone(this.t('data')).slice(0, 2);

      data[0].dot = true;
      data[1].badge = 5;

      return data;
    },
  },

  async mounted() {
    // 获取
    await this.$nextTick();

    const { children = [] } = this.$refs.treeSelect;
    const [navScroller, scroller] = children;

    this.navScroller = navScroller;
    this.scroller = scroller;

    // 滚动指定的nav和content索引
    this.scrollToView(true)
  },

  activated() {
    // 滚动指定的nav和content索引
    this.scrollToView(true)
  },

  methods: {

    // 点击左侧导航时触发 或者 mainActiveIndex 切换也会调用
    async onClickNav(index) {

      // 0 获取 item
      // 3、navScroller一直滚动到中间位置
      this.scrollIntoNavView(index, false);

      // 4、重置content的滚动条
      // 滚动到指定的contentView
      this.scrollIntoContentView(this.getCurrentContentIndex(index), true);
    },

    // 点击右侧选择项时触发
    async onClickItem(item) {
      const { id } = item;
      let index = -1
      const { children } = this.items[+this.activeIndex]
      for (let i = 0; i < children.length; i++) {
        const c = children[i];
        if (c.id === id) {
          index = i
          break
        }
      }

      // content 要滚动到中间
      this.scrollIntoContentView(index);

      // 由于content可以支持多选，所以要记录最后一次滚动的item
      this.lastScrollActiveId = item.id
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
      this.navScroller && this.scrollIntoNavView(+this.activeIndex, immediate)
      this.scroller && this.scrollIntoContentView(this.getCurrentContentIndex(+this.activeIndex), immediate)
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

      // 滚动到指定位置
      const to =
        nav.offsetTop - (navScroller.offsetHeight - nav.offsetHeight) / 2;
      scrollTopTo(navScroller, to, immediate ? 0 : 0.3);
    },

    // 滚动到指定view
    scrollIntoContentView(index, immediate) {
      const {scroller} = this;

      // 容错
      if (!scroller) {
        return;
      }

      // 获取当前nav index
      if (index < 0) {
        return;
      }

      // 获取
      const content = scroller.children[index];
      if (!content) {
        return;
      }

      // 滚动到指定位置
      const to =
        content.offsetTop - (scroller.offsetHeight - content.offsetHeight) / 2;
      scrollTopTo(scroller, to, immediate ? 0 : 0.3);
    },
  },
};
</script>
