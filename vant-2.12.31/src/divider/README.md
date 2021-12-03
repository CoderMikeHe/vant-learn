# Divider

### Install

```js
import Vue from 'vue';
import { Divider } from 'vant';

Vue.use(Divider);
```

## Usage

### Basic Usage

```html
<van-divider />
```

### With Text

```html
<van-divider>Text</van-divider>
```

### Content Position

```html
<van-divider content-position="left">Text</van-divider>
<van-divider content-position="right">Text</van-divider>
```

### Dashed

```html
<van-divider dashed>Text</van-divider>
```

### Custom Style

```html
<van-divider
  :style="{ color: '#1989fa', borderColor: '#1989fa', padding: '0 16px' }"
>
  Text
</van-divider>
```

## API

### Props

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| dashed | Whether to use dashed border | _boolean_ | `false` |
| hairline | Whether to use hairline | _boolean_ | `true` |
| content-position | Content position，can be set to `left` `right` | _string_ | `center` |

### Slots

| Name    | Description |
| ------- | ----------- |
| default | content     |

### Less Variables

How to use: [Custom Theme](#/en-US/theme).

| Name                         | Default Value   | Description |
| ---------------------------- | --------------- | ----------- |
| @divider-margin              | `@padding-md 0` | -           |
| @divider-text-color          | `@gray-6`       | -           |
| @divider-font-size           | `@font-size-md` | -           |
| @divider-line-height         | `24px`          | -           |
| @divider-border-color        | `@border-color` | -           |
| @divider-content-padding     | `@padding-md`   | -           |
| @divider-content-left-width  | `10%`           | -           |
| @divider-content-right-width | `10%`           | -           |
