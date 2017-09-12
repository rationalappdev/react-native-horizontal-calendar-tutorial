// @flow

import React from 'react';
import {
  StyleSheet,
  StatusBar,
  View,
} from 'react-native';
import Calendar from './src/calendar/Calendar';
import type Moment from 'moment';

export default class App extends React.Component {

  onSelectDate = (date: Moment) => {
    alert(date.calendar());
  };

  render() {
    return (
      <View style={styles.container}>
        <StatusBar hidden={true} />
        <Calendar showDaysAfterCurrent={30} onSelectDate={this.onSelectDate} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3F53B1',
    paddingTop: 20,
  },
});
