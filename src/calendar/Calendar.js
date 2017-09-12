// @flow

import React, { PureComponent } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import moment from 'moment';
import Dates from './Dates';
import type Moment from 'moment';

type Props = {
  // Optional prop to pass a custom date to use instead of today
  currentDate?: string | Moment,
  // Callback executed when user taps on a date
  onSelectDate: (date: Moment) => any,
  // Number of days to show before today or custom current date
  showDaysAfterCurrent?: number,
  // Number of days to show after
  showDaysBeforeCurrent?: number,
};

type State = {
  // True when all dates have rendered
  allDatesHaveRendered: boolean,
  // Currently chosen date index
  currentDateIndex: ?number,
  // Store months and years of the dates visible on the screen
  // for rendering month(s) and year(s) above the dates
  visibleMonths: ?Array<string>,
  visibleYears: ?Array<string>,
  // Array of dates to show
  dates: Array<Moment>,
  // Store each day with to help with scrolling to specific days
  // and calculating which days are visible on the screen
  dayWidths: ?{| [index: number]: number |},
  // Store current scroll position
  scrollPositionX: number,
};

const { width: screenWidth } = Dimensions.get('window');

const formatMonth = (date: Moment): string => date.format('MMMM');

const formatYear = (date: Moment): string => date.format('YYYY');

export default class Calendar extends PureComponent {

  props: Props;

  state: State;

  static defaultProps = {
    // Show 5 days before the current day
    showDaysBeforeCurrent: 5,
    // And after
    showDaysAfterCurrent: 5,
  };

  _scrollView;

  // Initialize the state with default values
  constructor(props: Props) {
    super(props);
    this.state = {
      allDatesHaveRendered: false,
      currentDateIndex: props.showDaysBeforeCurrent,
      dates: this.getDates(),
      dayWidths: undefined,
      scrollPositionX: 0,
      visibleMonths: undefined,
      visibleYears: undefined,
    };
  }

  // Get an array of dates for showing in a horizontal scroll view
  getDates = (): Array<Moment> => {
    const {
      currentDate,
      showDaysBeforeCurrent,
      showDaysAfterCurrent,
    } = this.props;

    // Go `showDaysBeforeCurrent` ago before today or custom `currentDate`
    const startDay = moment(currentDate || undefined)
      .subtract(showDaysBeforeCurrent + 1, 'days');
    // Number of days in total
    const totalDaysCount = showDaysBeforeCurrent + showDaysAfterCurrent + 1;

    // And return an array of `totalDaysCount` dates
    return [...Array(totalDaysCount)]
      .map(_ => startDay.add(1, 'day').clone());
  };

  // Returns a subset of dates currently visible on the screen
  getVisibleDates = (): ?Array<Moment> => {

    const {
      dates,
      dayWidths,
      scrollPositionX,
    } = this.state;

    if (!dayWidths) {
      return;
    }

    let datePositionX = 0;
    let firstVisibleDateIndex = undefined;
    let lastVisibleDateIndex = undefined;

    // Iterate through `dayWidths` to  $FlowFixMe
    Object.values(dayWidths).some((width: number, index: number) => {

      if (firstVisibleDateIndex === undefined       // not set yet
        && datePositionX >= scrollPositionX  // first date visible
      ) {
        firstVisibleDateIndex = index > 0 ? index - 1 : index;
      }

      if (lastVisibleDateIndex === undefined                      // not set yet
        && datePositionX >= scrollPositionX + screenWidth  // first date not visible behind the right edge
      ) {
        lastVisibleDateIndex = index;
      }

      // Increment date position by its width for the next iteration
      datePositionX += width;

      // return true when both first and last visible days found to break out of loop
      return !!(firstVisibleDateIndex && lastVisibleDateIndex);
    });

    // Return a subset of visible dates only
    return dates.slice(firstVisibleDateIndex, lastVisibleDateIndex);
  };

  // Format as a string the month(s) and the year(s) of the dates currently visible
  getVisibleMonthAndYear = (): ?string => {
    const {
      dates,
      visibleMonths,
      visibleYears,
    } = this.state;

    // No `visibleMonths` or `visibleYears` yet
    if (!visibleMonths || !visibleYears) {
      // Return the month and the year of the very first date
      if (dates) {
        const firstDate = dates[0];
        return `${formatMonth(firstDate)}, ${formatYear(firstDate)}`;
      }
      return undefined;
    }

    // One or two months withing the same year
    if (visibleYears.length === 1) {
      return `${visibleMonths.join(' – ')},  ${visibleYears[0]}`;
    }

    // Two months within different years
    return visibleMonths
      .map((month, index) => `${month}, ${visibleYears[index]}`)
      .join(' – ');
  };

  // Update visible month(s) and year(s) of the dates currently visible on the screen
  updateVisibleMonthAndYear = () => {

    const { allDatesHaveRendered } = this.state;

    if (!allDatesHaveRendered) {
      return;
    }

    const visibleDates = this.getVisibleDates();

    if (!visibleDates) {
      return;
    }

    let visibleMonths = [];
    let visibleYears = [];

    visibleDates.forEach((date: Moment) => {
      const month = formatMonth(date);
      const year = formatYear(date);
      if (!visibleMonths.includes(month)) {
        visibleMonths.push(month);
      }
      if (!visibleYears.includes(year)) {
        visibleYears.push(year);
      }
    });

    this.setState({
      visibleMonths,
      visibleYears,
    });
  };

  scrollToCurrentDay = () => {
    const {
      allDatesHaveRendered,
      currentDateIndex,
      dayWidths,
    } = this.state;

    // Make sure we have all required values
    if (!allDatesHaveRendered || currentDateIndex === undefined || currentDateIndex === null) {
      return;
    }

    // Put all day width values into a simple array $FlowFixMe
    const dayWidthsArray: Array<number> = Object.values(dayWidths);
    // Total width all days take
    const allDaysWidth = dayWidthsArray.reduce((total, width) => width + total, 0);
    // Current day button width
    const currentDayWidth = dayWidthsArray[currentDateIndex];
    // Minimal possible X position value to prevent scrolling before the first day
    const minX = 0;
    // Maximum possible X position value to prevent scrolling after the last day
    const maxX = allDaysWidth > screenWidth
      ? allDaysWidth - screenWidth
      : 0; // no scrolling if there's nowhere to scroll

    let scrollToX;

    scrollToX = dayWidthsArray
      // get all days before the target one
      .slice(0, currentDateIndex + 1)
      // and calculate the total width
      .reduce((total, width) => width + total, 0)
      // Subtract half of the screen width so the target day is centered
      - screenWidth / 2 - currentDayWidth / 2;

    // Do not scroll over the left edge
    if (scrollToX < minX) {
      scrollToX = 0;
    }
    // Do not scroll over the right edge
    else if (scrollToX > maxX) {
      scrollToX = maxX;
    }

    this._scrollView.scrollTo({ x: scrollToX });
  };

  onSelectDay = (index: number) => {
    const { dates } = this.state;
    const { onSelectDate } = this.props;
    this.setState({ currentDateIndex: index }, this.scrollToCurrentDay);
    onSelectDate(dates[index]);
  };

  onRenderDay = (index: number, width: number) => {
    const { dayWidths } = this.state;
    const {
      showDaysBeforeCurrent,
      showDaysAfterCurrent,
    } = this.props;

    // Check whether all date have been rendered already
    const allDatesHaveRendered = dayWidths
      && Object.keys(dayWidths).length >= showDaysBeforeCurrent + showDaysAfterCurrent;

    this.setState(prevState => ({
      allDatesHaveRendered,
      dayWidths: {
        // keep all existing widths added previously
        ...prevState.dayWidths,
        // keep the index for calculating scrolling position for each day
        [index]: width,
      },
    }), () => {
      if (allDatesHaveRendered) {
        this.scrollToCurrentDay();
        this.updateVisibleMonthAndYear();
      }
    });
  };

  onScroll = (event: { nativeEvent: { contentOffset: { x: number, y: number } } }) => {
    const { nativeEvent: { contentOffset: { x } } } = event;
    this.setState({ scrollPositionX: x }, this.updateVisibleMonthAndYear);
  };

  render() {
    const {
      dates,
      currentDateIndex,
    } = this.state;
    const visibleMonthAndYear = this.getVisibleMonthAndYear();

    return (
      <View>
        <Text style={styles.visibleMonthAndYear}>
          {visibleMonthAndYear}
        </Text>
        <ScrollView
          ref={scrollView => { this._scrollView = scrollView; }}
          horizontal={true}                         // Enable horizontal scrolling
          showsHorizontalScrollIndicator={false}    // Hide horizontal scroll indicators
          automaticallyAdjustContentInsets={false}  // Do not adjust content automatically
          scrollEventThrottle={100}
          onScroll={this.onScroll}
        >
          <Dates
            dates={dates}
            currentDateIndex={currentDateIndex}
            onSelectDay={this.onSelectDay}
            onRenderDay={this.onRenderDay}
          />
        </ScrollView>
      </View>
    );
  }

}

const styles = StyleSheet.create({
  visibleMonthAndYear: {
    color: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: 15,
    textAlign: 'left',
  },
});
