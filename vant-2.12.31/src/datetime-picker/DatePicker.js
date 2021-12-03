import { createNamespace } from '../utils';
import { isDate } from '../utils/validate/date';
import { padZero } from '../utils/format/string';
import { getTrueValue, getMonthEndDay } from './utils';
import { sharedProps, TimePickerMixin } from './shared';

const currentYear = new Date().getFullYear();
const [createComponent] = createNamespace('date-picker');

export default createComponent({
  mixins: [TimePickerMixin],

  props: {
    ...sharedProps,
    type: {
      type: String,
      default: 'datetime',
    },
    minDate: {
      type: Date,
      default: () => new Date(currentYear - 10, 0, 1),
      validator: isDate,
    },
    maxDate: {
      type: Date,
      default: () => new Date(currentYear + 10, 11, 31),
      validator: isDate,
    },
  },

  watch: {
    filter: 'updateInnerValue',
    minDate() {
      this.$nextTick(() => {
        this.updateInnerValue();
      });
    },
    maxDate(value) {
      if (this.innerValue.valueOf() >= value.valueOf()) {
        this.innerValue = value;
      } else {
        this.updateInnerValue();
      }
    },
    value(val) {
      val = this.formatValue(val);

      if (val && val.valueOf() !== this.innerValue.valueOf()) {
        this.innerValue = val;
      }
    },
  },

  computed: {
    ranges() {
      const {
        maxYear,
        maxDate,
        maxMonth,
        maxHour,
        maxMinute,
      } = this.getBoundary(
        'max',
        this.innerValue ? this.innerValue : this.minDate
      );

      const {
        minYear,
        minDate,
        minMonth,
        minHour,
        minMinute,
      } = this.getBoundary(
        'min',
        this.innerValue ? this.innerValue : this.minDate
      );

      let result = [
        {
          type: 'year',
          range: [minYear, maxYear],
        },
        {
          type: 'month',
          range: [minMonth, maxMonth],
        },
        {
          type: 'day',
          range: [minDate, maxDate],
        },
        {
          type: 'hour',
          range: [minHour, maxHour],
        },
        {
          type: 'minute',
          range: [minMinute, maxMinute],
        },
      ];

      switch (this.type) {
        case 'date':
          result = result.slice(0, 3);
          break;
        case 'year-month':
          result = result.slice(0, 2);
          break;
        case 'month-day':
          result = result.slice(1, 3);
          break;
        case 'datehour':
          result = result.slice(0, 4);
          break;
      }

      if (this.columnsOrder) {
        const columnsOrder = this.columnsOrder.concat(
          result.map((column) => column.type)
        );
        result.sort(
          (a, b) => columnsOrder.indexOf(a.type) - columnsOrder.indexOf(b.type)
        );
      }

      return result;
    },
  },

  methods: {
    formatValue(value) {
      if (!isDate(value)) {
        return null;
      }

      let minDate = new Date(this.minDate);
      let maxDate = new Date(this.maxDate);
      const dateMethods = {
        year: 'getFullYear',
        month: 'getMonth',
        day: 'getDate',
        hour: 'getHours',
        minute: 'getMinutes',
      };
      if (this.originColumns) {
        const dateColumns = this.originColumns.map(({ type, values }, index) => {
          const { range } = this.ranges[index];
          const minDateVal = minDate[dateMethods[type]]();
          const maxDateVal = maxDate[dateMethods[type]]();
          const min = type === 'month' ? +values[0] - 1 : +values[0];
          const max =
            type === 'month'
              ? +values[values.length - 1] - 1
              : +values[values.length - 1];

          return {
            type,
            values: [
              minDateVal < range[0] ? Math.max(minDateVal, min) : min || minDateVal,
              maxDateVal > range[1] ? Math.min(maxDateVal, max) : max || maxDateVal,
            ]
          };
        });

        if (this.type === 'month-day') {
          const year = (this.innerValue || this.minDate).getFullYear();
          dateColumns.unshift({ type: 'year', values: [year, year] });
        }

        const dates = Object.keys(dateMethods).map((type) =>
          dateColumns.filter(item => item.type === type)[0]?.values
        ).filter((item) => item);
        minDate = new Date(...dates.map((val) => getTrueValue(val[0])));
        maxDate = new Date(...dates.map((val) => getTrueValue(val[1])));
      }

      value = Math.max(value, minDate.getTime());
      value = Math.min(value, maxDate.getTime());

      return new Date(value);
    },

    getBoundary(type, value) {
      const boundary = this[`${type}Date`];
      const year = boundary.getFullYear();
      let month = 1;
      let date = 1;
      let hour = 0;
      let minute = 0;

      if (type === 'max') {
        month = 12;
        date = getMonthEndDay(value.getFullYear(), value.getMonth() + 1);
        hour = 23;
        minute = 59;
      }

      if (value.getFullYear() === year) {
        month = boundary.getMonth() + 1;
        if (value.getMonth() + 1 === month) {
          date = boundary.getDate();
          if (value.getDate() === date) {
            hour = boundary.getHours();
            if (value.getHours() === hour) {
              minute = boundary.getMinutes();
            }
          }
        }
      }

      return {
        [`${type}Year`]: year,
        [`${type}Month`]: month,
        [`${type}Date`]: date,
        [`${type}Hour`]: hour,
        [`${type}Minute`]: minute,
      };
    },

    updateInnerValue() {
      const { type } = this;
      const indexes = this.getPicker().getIndexes();
      const getValue = (type) => {
        let index = 0;
        this.originColumns.forEach((column, columnIndex) => {
          if (type === column.type) {
            index = columnIndex;
          }
        });
        const { values } = this.originColumns[index];
        return getTrueValue(values[indexes[index]]);
      };

      let year;
      let month;
      let day;
      if (type === 'month-day') {
        year = (this.innerValue || this.minDate).getFullYear();
        month = getValue('month');
        day = getValue('day');
      } else {
        year = getValue('year');
        month = getValue('month');
        day = type === 'year-month' ? 1 : getValue('day');
      }

      const maxDay = getMonthEndDay(year, month);
      day = day > maxDay ? maxDay : day;

      let hour = 0;
      let minute = 0;

      if (type === 'datehour') {
        hour = getValue('hour');
      }

      if (type === 'datetime') {
        hour = getValue('hour');
        minute = getValue('minute');
      }

      const value = new Date(year, month - 1, day, hour, minute);

      this.innerValue = this.formatValue(value);
    },

    onChange(picker) {
      this.updateInnerValue();

      this.$nextTick(() => {
        this.$nextTick(() => {
          this.$emit('change', picker);
        });
      });
    },

    updateColumnValue() {
      const value = this.innerValue ? this.innerValue : this.minDate;
      const { formatter } = this;

      const values = this.originColumns.map((column) => {
        switch (column.type) {
          case 'year':
            return formatter('year', `${value.getFullYear()}`);
          case 'month':
            return formatter('month', padZero(value.getMonth() + 1));
          case 'day':
            return formatter('day', padZero(value.getDate()));
          case 'hour':
            return formatter('hour', padZero(value.getHours()));
          case 'minute':
            return formatter('minute', padZero(value.getMinutes()));
          default:
            // no default
            return null;
        }
      });

      this.$nextTick(() => {
        this.getPicker().setValues(values);
      });
    },
  },
});
