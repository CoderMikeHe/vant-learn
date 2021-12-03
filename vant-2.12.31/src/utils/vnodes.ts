import { VNode } from 'vue';

function flattenVNodes(vnodes: VNode[]) {
  const result: VNode[] = [];

  function traverse(vnodes: VNode[]) {
    vnodes.forEach((vnode) => {
      result.push(vnode);

      // componentInstance: 当前节点对应的组件的实例
      if (vnode.componentInstance) {
        traverse(vnode.componentInstance.$children.map((item) => item.$vnode));
      }

      if (vnode.children) {
        traverse(vnode.children);
      }
    });
  }

  traverse(vnodes);
  return result;
}

// sort children instances by vnodes order
export function sortChildren(children: Vue[], parent: Vue) {

  const { componentOptions } = parent.$vnode;
  // componentOptions: 组件的option选项
  if (!componentOptions || !componentOptions.children) {
    return;
  }
  // 将所有的节点  展开成一维数组
  const vnodes = flattenVNodes(componentOptions.children);
  children.sort((a, b) => vnodes.indexOf(a.$vnode) - vnodes.indexOf(b.$vnode));
}
