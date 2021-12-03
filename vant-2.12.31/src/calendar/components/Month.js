import { createNamespace, addUnit } from '../../utils';
import { setScrollTop } from '../../utils/dom/scroll';
import {
  t,
  bem,
  compareDay,
  getPrevDay,
  getNextDay,
  formatMonthTitle,
} from '../utils';
import { getMonthEndDay } from '../../datetime-picker/utils';

const [createComponent] = createNamespace('calendar-month');

export default createComponent({
  props: {
    date: Date,
    type: String,
    color: String,
    minDate: Date,
    maxDate: Date,
    showMark: Boolean,
    rowHeight: [Number, String],
    formatter: Function,
    lazyRender: Boolean,
    currentDate: [Date, Array],
    allowSameDay: Boolean,
    showSubtitle: Boolean,
    showMonthTitle: Boolean,
    firstDayOfWeek: Number,
  },

  data() {
    return {
      visible: false,
    };
  },

  computed: {
    title() {
      return formatMonthTitle(this.date);
    },

    rowHeightWithUnit() {
      return addUnit(this.rowHeight);
    },

    offset() {
      const { firstDayOfWeek } = this;

      const realDay = this.date.getDay();

      if (!firstDayOfWeek) {
        return realDay;
      }

      return (realDay + 7 - this.firstDayOfWeek) % 7;
    },

    totalDay() {
      return getMonthEndDay(this.date.getFullYear(), this.date.getMonth() + 1);
    },

    shouldRender() {
      return this.visible || !this.lazyRender;
    },

    placeholders() {
      const rows = [];
      const count = Math.ceil((this.totalDay + this.offset) / 7);
      for (let day = 1; day <= count; day++) {
        rows.push({ type: 'placeholder' });
      }
      return rows;
    },

    days() {
      const days = [];
      const year = this.date.getFullYear();
      const month = this.date.getMonth();

      for (let day = 1; day <= this.totalDay; day++) {
        const date = new Date(year, month, day);
        const type = this.getDayType(date);

        let config = {
          date,
          type,
          text: day,
          bottomInfo: this.getBottomInfo(type),
        };

        if (this.formatter) {
          config = this.formatter(config);
        }

        days.push(config);
      }

      return days;
    },
  },

  methods: {
    getHeight() {
      if (!this.height) {
        this.height = this.$el.getBoundingClientRect().height;
      }
      return this.height;
    },

    scrollIntoView(body) {
      const { days, month } = this.$refs;
      const el = this.showSubtitle ? days : month;

      const scrollTop =
        el.getBoundingClientRect().top -
        body.getBoundingClientRect().top +
        body.scrollTop;

      setScrollTop(body, scrollTop);
    },

    getMultipleDayType(day) {
      const isSelected = (date) =>
        this.currentDate.some((item) => compareDay(item, date) === 0);

      if (isSelected(day)) {
        const prevDay = getPrevDay(day);
        const nextDay = getNextDay(day);
        const prevSelected = isSelected(prevDay);
        const nextSelected = isSelected(nextDay);

        if (prevSelected && nextSelected) {
          return 'multiple-middle';
        }

        if (prevSelected) {
          return 'end';
        }

        return nextSelected ? 'start' : 'multiple-selected';
      }

      return '';
    },

    getRangeDayType(day) {
      const [startDay, endDay] = this.currentDate;

      if (!startDay) {
        return '';
      }

      const compareToStart = compareDay(day, startDay);

      if (!endDay) {
        return compareToStart === 0 ? 'start' : '';
      }

      const compareToEnd = compareDay(day, endDay);

      if (compareToStart === 0 && compareToEnd === 0 && this.allowSameDay) {
        return 'start-end';
      }

      if (compareToStart === 0) {
        return 'start';
      }

      if (compareToEnd === 0) {
        return 'end';
      }

      if (compareToStart > 0 && compareToEnd < 0) {
        return 'middle';
      }
    },

    getDayType(day) {
      const { type, minDate, maxDate, currentDate } = this;

      if (compareDay(day, minDate) < 0 || compareDay(day, maxDate) > 0) {
        return 'disabled';
      }

      if (currentDate === null) {
        return;
      }

      if (type === 'single') {
        return compareDay(day, currentDate) === 0 ? 'selected' : '';
      }

      if (type === 'multiple') {
        return this.getMultipleDayType(day);
      }

      /* istanbul ignore else */
      if (type === 'range') {
        return this.getRangeDayType(day);
      }
    },

    getBottomInfo(type) {
      if (this.type === 'range') {
        if (type === 'start' || type === 'end') {
          return t(type);
        }
        if (type === 'start-end') {
          return t('startEnd');
        }
      }
    },

    getDayStyle(type, index) {
      const style = {
        height: this.rowHeightWithUnit,
      };

      if (type === 'placeholder') {
        style.width = '100%';
        return style;
      }

      if (index === 0) {
        style.marginLeft = `${(100 * this.offset) / 7}%`;
      }

      if (this.color) {
        if (
          type === 'start' ||
          type === 'end' ||
          type === 'start-end' ||
          type === 'multiple-selected' ||
          type === 'multiple-middle'
        ) {
          style.background = this.color;
        } else if (type === 'middle') {
          style.color = this.color;
        }
      }

      return style;
    },

    genTitle() {
      if (this.showMonthTitle) {
        return <div class={bem('month-title')}>{this.title}</div>;
      }
    },

    genMark() {
      if (this.showMark && this.shouldRender) {
        return <div class={bem('month-mark')}>{this.date.getMonth() + 1}</div>;
      }
    },

    genDays() {
      const days = this.shouldRender ? this.days : this.placeholders;
      return (
        <div ref="days" role="grid" class={bem('days')}>
          {this.genMark()}
          {days.map(this.genDay)}
        </div>
      );
    },

    genTopInfo(item) {
      const slot = this.$scopedSlots['top-info'];
      if (item.topInfo || slot) {
        return (
          <div class={bem('top-info')}>{slot ? slot(item) : item.topInfo}</div>
        );
      }
    },

    genBottomInfo(item) {
      const slot = this.$scopedSlots['bottom-info'];
      if (item.bottomInfo || slot) {
        return (
          <div class={bem('bottom-info')}>
            {slot ? slot(item) : item.bottomInfo}
          </div>
        );
      }
    },

    genDay(item, index) {
      const { type } = item;
      const style = this.getDayStyle(type, index);
      const disabled = type === 'disabled';

      const onClick = () => {
        if (!disabled) {
          this.$emit('click', item);
        }
      };

      if (type === 'selected') {
        return (
          <div
            role="gridcell"
            style={style}
            class={[bem('day'), item.className]}
            tabindex={-1}
            onClick={onClick}
          >
            <div
              class={bem('selected-day')}
              style={{
                width: this.rowHeightWithUnit,
                height: this.rowHeightWithUnit,
                background: this.color,
              }}
            >
              {this.genTopInfo(item)}
              {item.text}
              {this.genBottomInfo(item)}
            </div>
          </div>
        );
      }

      return (
        <div
          role="gridcell"
          style={style}
          class={[bem('day', type), item.className]}
          tabindex={disabled ? null : -1}
          onClick={onClick}
        >
          {this.genTopInfo(item)}
          {item.text}
          {this.genBottomInfo(item)}
        </div>
      );
    },
  },

  render() {
    return (
      <div class={bem('month')} ref="month">
        {this.genTitle()}
        {this.genDays()}
      </div>
    );
  },
});
