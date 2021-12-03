# Area

### Intro

The Picker component is usually used with [Popup](#/en-US/popup) Component.

### Install

```js
import Vue from 'vue';
import { Area } from 'vant';

Vue.use(Area);
```

## Usage

### Basic Usage

To initailize `Area` component, `area-list` property is required.

```html
<van-area title="Title" :area-list="areaList" />
```

### areaList Data Structure

An object contains three properties: `province_list`, `city_list` and `county_list`. Each property is a simple key-value object, key is a 6-bit code of the area of which first two bits stand for the province or state, middle two bits are used as city code and the last two are district code, value is the name of the area. If the code stands for an area that has sub-areas, lower bits of it will be filled with 0.

Sample data:

```js
export default {
  province_list: {
    110000: 'Beijing',
    330000: 'Zhejiang Province',
  },
  city_list: {
    110100: 'Beijing City',
    330100: 'Hangzhou',
  },
  county_list: {
    110101: 'Dongcheng District',
    110102: 'Xicheng District',
    // ....
  },
};
```

### @vant/area-data

Vant officially provides a default area data, which can be imported through [@vant/area-data](https://github.com/youzan/vant/tree/dev/packages/vant-area-data):

```bash
yarn add @vant/area-data
```

```ts
import { areaList } from '@vant/area-data';

export default {
  setup() {
    return { areaList };
  },
};
```

### Initial Value

To have a selected value，simply pass the `code` of target area to `value` property.

```html
<van-area title="Title" :area-list="areaList" value="110101" />
```

### Columns Number

`columns-num` property is used to config number of columns to be displayed. This component has 3 columns corresponding to a 3 level picker by default. Set `columns-num` with 2, you'll have a 2 level picker.

```html
<van-area title="Title" :area-list="areaList" :columns-num="2" />
```

### Columns Placeholder

`columns-placeholder` property is used to config placeholder of columns.

```html
<van-area
  title="Title"
  :area-list="areaList"
  :columns-placeholder="['Choose', 'Choose', 'Choose']"
/>
```

## API

### Props

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| value | the `code` of selected area | _string_ | - |
| title | Toolbar title | _string_ | - |
| confirm-button-text | Text of confirm button | _string_ | `Confirm` |
| cancel-button-text | Text of cancel button | _string_ | `Cancel` |
| area-list | Area list data | _object_ | - |
| columns-placeholder | Placeholder of columns | _string[]_ | `[]` |
| loading | Whether to show loading prompt | _boolean_ | `false` |
| readonly `v2.10.5` | Whether to be readonly | _boolean_ | `false` |
| item-height `v2.8.6` | Option height, supports `px` `vw` `vh` `rem` unit, default `px` | _number \| string_ | `44` |
| columns-num | Level of picker | _number \| string_ | `3` |
| visible-item-count | Count of visible columns | _number \| string_ | `6` |
| swipe-duration | Duration of the momentum animation，unit `ms` | _number \| string_ | `1000` |
| is-oversea-code | The method to validate oversea code | _() => boolean_ | - |

### Events

| Event | Description | Arguments |
| --- | --- | --- |
| confirm | Emitted when the confirm button is clicked | selected areas |
| cancel | Emitted when the cancel button is clicked | - |
| change | Emitted when current option changed | Picker instance, current values，column index |

### Slots

| Name                    | Description                  |
| ----------------------- | ---------------------------- |
| title `v2.5.3`          | Custom title                 |
| columns-top `v2.5.3`    | Custom content above columns |
| columns-bottom `v2.5.3` | Custom content below columns |

### Methods

Use [ref](https://vuejs.org/v2/api/#ref) to get Area instance and call instance methods.

| Name  | Description               | Attribute     | Return value |
| ----- | ------------------------- | ------------- | ------------ |
| reset | Reset all options by code | code?: string | -            |

### argument of callback function confirm

An array contains selected area objects.

`code` - code of selected area, `name` - name of selected area

```js
[
  {
    code: '330000',
    name: 'Zhejiang Province',
  },
  {
    code: '330100',
    name: 'Hangzhou',
  },
  {
    code: '330105',
    name: 'Xihu District',
  },
];
```
