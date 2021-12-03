import TimePicker from '../TimePicker';
import { mount, later, triggerDrag } from '../../../test';

function filter(type, options) {
  const mod = type === 'minute' ? 10 : 5;
  return options.filter((option) => option % mod === 0);
}

function formatter(type, value) {
  return `${value} ${type}`;
}

test('format initial value', () => {
  const wrapper = mount(TimePicker, {
    propsData: {
      minHour: 22,
      minMinute: 58,
    },
  });

  expect(wrapper).toMatchSnapshot();
});

test('max-hour & max-minute', () => {
  const wrapper = mount(TimePicker, {
    propsData: {
      value: '23:59',
      maxHour: 2,
      maxMinute: 2,
    },
  });

  expect(wrapper).toMatchSnapshot();
});

test('filter prop', () => {
  const wrapper = mount(TimePicker, {
    propsData: {
      filter,
      value: '12:00',
    },
  });

  expect(wrapper).toMatchSnapshot();
});

test('formatter prop', async () => {
  const wrapper = mount(TimePicker, {
    propsData: {
      filter,
      formatter,
      value: '12:00',
    },
  });

  expect(wrapper).toMatchSnapshot();

  triggerDrag(wrapper.find('.van-picker-column'), 0, -100);
  wrapper.find('.van-picker-column ul').trigger('transitionend');
  await later();

  expect(wrapper.emitted('change')[0][0].getValues()).toEqual([
    '20 hour',
    '00 minute',
  ]);
});

test('confirm event', () => {
  const wrapper = mount(TimePicker, {
    propsData: {
      value: '12:00',
    },
  });

  triggerDrag(wrapper.find('.van-picker-column'), 0, -100);
  wrapper.find('.van-picker__confirm').trigger('click');
  expect(wrapper.emitted('confirm')[0][0]).toEqual('23:00');
});

test('cancel event', () => {
  const wrapper = mount(TimePicker);

  wrapper.find('.van-picker__cancel').trigger('click');
  expect(wrapper.emitted('cancel')).toBeTruthy();
});

test('dynamic set value', () => {
  const wrapper = mount(TimePicker);

  wrapper.setProps({ value: '00:00' });
  wrapper.find('.van-picker__confirm').trigger('click');
  wrapper.setProps({ value: '22:30' });
  wrapper.find('.van-picker__confirm').trigger('click');

  expect(wrapper.emitted('confirm')[0][0]).toEqual('00:00');
  expect(wrapper.emitted('confirm')[1][0]).toEqual('22:30');
});

test('change min-minute and emit correct value', async () => {
  const wrapper = mount(TimePicker, {
    propsData: {
      value: '12:00',
      minMinute: 0,
    },
  });

  await later();

  wrapper.setProps({ minMinute: 30 });
  wrapper.find('.van-picker__confirm').trigger('click');
  expect(wrapper.emitted('confirm')[0][0]).toEqual('12:30');
});

test('set min-minute dynamically', async () => {
  const wrapper = mount({
    template: `
      <van-datetime-picker
        v-model="currentTime"
        type="time"
        :min-minute="currentTime.split(':')[0] > 12 ? 0 : 30"
        min-hour="12"
        max-hour="13"
        @confirm="$emit('confirm', $event)"
      />
    `,
    data() {
      return {
        currentTime: '12:30',
      };
    },
  });

  triggerDrag(wrapper.find('.van-picker-column'), 0, -100);
  wrapper.find('.van-picker__confirm').trigger('click');
  expect(wrapper.emitted('confirm')[0][0]).toEqual('13:00');
});

test('dynamic set min-hour & min-minute then emit correct value', async () => {
  const wrapper = mount({
    template: `
    <van-datetime-picker
      v-model="time"
      type="time"
      :min-hour="minHour"
      :min-minute="minMinute"
      @confirm="value => this.$emit('confirm', value)"
    />
    `,
    data() {
      return {
        time: '10:30',
        minHour: 1,
        minMinute: 20,
      }
    },
    mounted() {
      this.minHour = 11;
      this.minMinute = 40;
    },
  })

  await later();
  wrapper.find('.van-picker__confirm').trigger('click');
  expect(wrapper.emitted('confirm')[0][0]).toEqual('11:40');
});

test('dynamic set max-hour & max-minute then emit correct value', async () => {
  const wrapper = mount({
    template: `
      <van-datetime-picker
        v-model="time"
        type="time"
        :max-hour="maxHour"
        :max-minute="maxMinute"
        @confirm="value => this.$emit('confirm', value)"
      />
    `,

    data() {
      return {
        time: '12:30',
        minHour: 1,
        minMinute: 1,
        maxHour: 20,
        maxMinute: 59,
      }
    },
  })

  const confirm = wrapper.find('.van-picker__confirm');

  await later();
  confirm.trigger('click');
  expect(wrapper.emitted('confirm')[0][0]).toEqual('12:30');

  await later();
  wrapper.setData({ maxHour: 20, maxMinute: 50 });
  confirm.trigger('click');
  expect(wrapper.emitted('confirm')[1][0]).toEqual('12:30');

  await later();
  wrapper.setData({ maxHour: 12, maxMinute: 30 });
  confirm.trigger('click');
  expect(wrapper.emitted('confirm')[2][0]).toEqual('12:30');

  await later();
  wrapper.setData({ maxHour: 11, maxMinute: 20 });
  confirm.trigger('click');
  expect(wrapper.emitted('confirm')[3][0]).toEqual('11:20');

  await later();
  wrapper.setData({ maxHour: 14 });
  await later();
  wrapper.setData({ maxMinute: 25 });
  wrapper.find('.van-picker__confirm').trigger('click');
  expect(wrapper.emitted('confirm')[4][0]).toEqual('11:20');
});
