# DropdownMenu

### Install

```js
import Vue from 'vue';
import { DropdownMenu, DropdownItem } from 'vant';

Vue.use(DropdownMenu);
Vue.use(DropdownItem);
```

## Usage

### Basic Usage

```html
<van-dropdown-menu>
  <van-dropdown-item v-model="value1" :options="option1" />
  <van-dropdown-item v-model="value2" :options="option2" />
</van-dropdown-menu>
```

```js
export default {
  data() {
    return {
      value1: 0,
      value2: 'a',
      option1: [
        { text: 'Option1', value: 0 },
        { text: 'Option2', value: 1 },
        { text: 'Option3', value: 2 },
      ],
      option2: [
        { text: 'Option A', value: 'a' },
        { text: 'Option B', value: 'b' },
        { text: 'Option C', value: 'c' },
      ],
    };
  },
};
```

### Custom Content

```html
<van-dropdown-menu>
  <van-dropdown-item v-model="value" :options="option" />
  <van-dropdown-item title="Title" ref="item">
    <van-cell center title="Title">
      <template #right-icon>
        <van-switch v-model="switch1" size="24" active-color="#ee0a24" />
      </template>
    </van-cell>
    <van-cell center title="Title">
      <template #right-icon>
        <van-switch v-model="switch2" size="24" active-color="#ee0a24" />
      </template>
    </van-cell>
    <div style="padding: 5px 16px;">
      <van-button type="danger" block round @click="onConfirm">
        Confirm
      </van-button>
    </div>
  </van-dropdown-item>
</van-dropdown-menu>
```

```js
export default {
  data() {
    return {
      value: 0,
      switch1: false,
      switch2: false,
      option: [
        { text: 'Option1', value: 0 },
        { text: 'Option2', value: 1 },
        { text: 'Option3', value: 2 },
      ],
    };
  },
  methods: {
    onConfirm() {
      this.$refs.item.toggle();
    },
  },
};
```

### Custom Active Color

Use `active-color` prop to custom active color of the title and options.

```html
<van-dropdown-menu active-color="#1989fa">
  <van-dropdown-item v-model="value1" :options="option1" />
  <van-dropdown-item v-model="value2" :options="option2" />
</van-dropdown-menu>
```

### Expand Direction

```html
<van-dropdown-menu direction="up">
  <van-dropdown-item v-model="value1" :options="option1" />
  <van-dropdown-item v-model="value2" :options="option2" />
</van-dropdown-menu>
```

### Disabled

```html
<van-dropdown-menu>
  <van-dropdown-item v-model="value1" disabled :options="option1" />
  <van-dropdown-item v-model="value2" disabled :options="option2" />
</van-dropdown-menu>
```

## API

### DropdownMenu Props

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| active-color | Active color of title and option | _string_ | `#ee0a24` |
| direction | Expand direction, can be set to `up` | _string_ | `down` |
| z-index | z-index of menu item | _number \| string_ | `10` |
| duration | Transition duration, unit second | _number \| string_ | `0.2` |
| overlay | Whether to show overlay | _boolean_ | `true` |
| close-on-click-overlay | Whether to close when overlay is clicked | _boolean_ | `true` |
| close-on-click-outside | Whether to close when outside is clicked | _boolean_ | `true` |

### DropdownItem Props

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| value | Value of current option，can use `v-model` | _number \| string_ | - |
| title | Item title | _string_ | Text of selected option |
| options | Options | _Option[]_ | `[]` |
| disabled | Whether to disable dropdown item | _boolean_ | `false` |
| lazy-render `v2.8.5` | Whether to lazy render util opened | _boolean_ | `true` |
| title-class | Title class | _string_ | - |
| get-container | Return the mount node for menu | _string \| () => Element_ | - |

### DropdownItem Events

| Event  | Description                             | Arguments |
| ------ | --------------------------------------- | --------- |
| change | Emitted select option and value changed | value     |
| open   | Emitted when opening menu               | -         |
| close  | Emitted when closing menu               | -         |
| opened | Emitted when menu is opened             | -         |
| closed | Emitted when menu is closed             | -         |

### DropdownItem Slots

| Name    | Description  |
| ------- | ------------ |
| default | Content      |
| title   | Custom title |

### DropdownItem Methods

Use [ref](https://vuejs.org/v2/api/#ref) to get DropdownItem instance and call instance methods.

| Name   | Description    | Attribute       | Return value |
| ------ | -------------- | --------------- | ------------ |
| toggle | Toggle display | _show: boolean_ | -            |

### Data Structure of Option

| Key   | Description | Type               |
| ----- | ----------- | ------------------ |
| text  | Text        | _string_           |
| value | Value       | _number \| string_ |
| icon  | Left icon   | _string_           |

### Less Variables

How to use: [Custom Theme](#/en-US/theme).

| Name | Default Value | Description |
| --- | --- | --- |
| @dropdown-menu-height | `48px` | - |
| @dropdown-menu-background-color | `@white` | - |
| @dropdown-menu-box-shadow | `0 2px 12px fade(@gray-7, 12)` | - |
| @dropdown-menu-title-font-size | `15px` | - |
| @dropdown-menu-title-text-color | `@text-color` | - |
| @dropdown-menu-title-active-text-color | `@red` | - |
| @dropdown-menu-title-disabled-text-color | `@gray-6` | - |
| @dropdown-menu-title-padding | `0 @padding-xs` | - |
| @dropdown-menu-title-line-height | `@line-height-lg` | - |
| @dropdown-menu-option-active-color | `@red` | - |
| @dropdown-menu-content-max-height | `80%` | - |
| @dropdown-item-z-index | `10` | - |
