define([
  'utils/underscore'
], function () {

  /**
   * Days of the week for nice clock formatting
   *
   * @var array
   */
  var _days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  /**
   * Wrapper for JavaScript's midly ridiculous date object
   */
  function NiceDate() {
    this.now = new Date();
  }

  /**
   * Takes an integer converts to a string and if length < 2 prepends a 0
   *
   * @param  number
   * @return string
   */
  function _expand(number) {
    number += '';
    return number.length > 1 ? number : '0' + number;
  }

  _.extend(NiceDate.prototype, {

    /**
     * Returns AM/PM
     *
     * @return string
     */
    ampm: function () {
      return this.now.getHours() > 11 ? 'PM' : 'AM';
    },

    /**
     * YYYY-MM-DD
     *
     * @return string
     */
    date: function () {
      return this.year() + '-' + this.month() + '-' + this.day();
    },

    /**
     * DD
     *
     * @return string
     */
    day: function () {
      return _expand(this.now.getDate());
    },

    /**
     * Sun, Mon, Tue, Wed, Thu, Fri, Sat
     *
     * @return string
     */
    dayString: function () {
      return _days[this.now.getDay()];
    },

    /**
     * YYYY-MM-DD hh:mm:ss
     *
     * @return string
     */
    full: function () {
      return this.date() + ' ' + this.time();
    },

    /**
     * hh
     *
     * @return string
     */
    hour: function () {
      return _expand(this.now.getHours());
    },

    /**
     * Default Locale string
     *
     * @return string
     */
    local: function () {
      return this.now.toLocaleString();
    },

    /**
     * Formats the date OSX style
     *  e.g. "Sun 10:28 AM"
     *
     * @return string
     */
    macos: function () {
      return this.dayString() + ' ' + this.normalTime();
    },

    /**
     * hh:mm AM/PM
     *  e.g. "10:28 AM"
     *
     * @return string
     */
    normalTime: function () {
      return this.hour() % 12 + ':' + this.minute() + ' ' + this.ampm();
    },

    /**
     * mm
     *
     * @return string
     */
    minute: function () {
      return _expand(this.now.getMinutes());
    },

    /**
     * MM
     *
     * @return string
     */
    month: function () {
      return _expand(this.now.getMonth());
    },

    /**
     * ss
     *
     * @return string
     */
    second: function () {
      return _expand(this.now.getSeconds());
    },

    /**
     * hh:mm:ss
     *
     * @return string
     */
    time: function () {
      return this.hour() + ':' + this.minute() + ':' + this.second();
    },

    /**
     * UTC Date/Time
     *
     * @return string
     */
    utc: function () {
      return this.now.toUTCString();
    },

    /**
     * YYYY
     *
     * @return string
     */
    year: function () {
      return this.now.getFullYear();
    }

  });

  return NiceDate;

});