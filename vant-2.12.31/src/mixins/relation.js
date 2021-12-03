import { sortChildren } from '../utils/vnodes';

export function ChildrenMixin(parent, options = {}) {
  const indexKey = options.indexKey || 'index';

  return {
    inject: {
      [parent]: {
        default: null,
      },
    },

    computed: {
      // 获取父元素
      parent() {
        if (this.disableBindRelation) {
          return null;
        }

        return this[parent];
      },

      [indexKey]() {
        this.bindRelation();
        if (this.parent) {
          return this.parent.children.indexOf(this);
        }

        return null;
      },
    },

    watch: {
      disableBindRelation(val) {
        if (!val) {
          this.bindRelation();
        }
      },
    },

    mounted() {
      this.bindRelation();
    },

    beforeDestroy() {
      if (this.parent) {
        this.parent.children = this.parent.children.filter(
          (item) => item !== this
        );
      }
    },

    methods: {
      bindRelation() {
        if (!this.parent || this.parent.children.indexOf(this) !== -1) {
          return;
        }
        // 不断的扩充children数组
        const children = [...this.parent.children, this];
        // 排序
        sortChildren(children, this.parent);
        // 记录
        this.parent.children = children;
      },
    },
  };
}

export function ParentMixin(parent) {
  return {
    // 向子孙后代注入一个依赖
    // https://cn.vuejs.org/v2/api/#provide-inject
    provide() {
      return {
        [parent]: this,
      };
    },

    data() {
      return {
        children: [],
      };
    },
  };
}
