// @flow

import React, { PureComponent } from 'react';
import {
  Text,
  TouchableOpacity,
} from 'react-native';
import type Moment from 'moment';

export default class Date extends PureComponent {

  props: {
    // Date to render
    date: Moment,
    // Index for `onPress` and `onRender` callbacks
    index: number,
    // Whether it's the currently selected date or no
    isActive: boolean,
    // Called when user taps a date
    onPress: (index: number) => void,
    // Called after date is rendered to pass its width up to the parent component
    onRender: (index: number, width: number) => void,
  };

  // Style helper functions that merge active date styles with the default ones
  // when rendering a date that was selected by user or was set active by default

  getContainerStyle = () => ({
    ...styles.container,
    ...(this.props.isActive ? styles.containerActive : {})
  });

  getDayStyle = () => ({
    ...styles.text,
    ...styles.day,
    ...(this.props.isActive ? styles.textActive : {})
  });

  getDateStyle = () => ({
    ...styles.text,
    ...styles.date,
    ...(this.props.isActive ? styles.textActive : {})
  });

  // Call `onRender` and pass component's with when rendered
  onLayout = (event: { nativeEvent: { layout: { x: number, y: number, width: number, height: number } } }) => {
    const {
      index,
      onRender,
    } = this.props;
    const { nativeEvent: { layout: { width } } } = event;
    onRender(index, width);
  };

  // Call `onPress` passed from the parent component when date is pressed
  onPress = () => {
    const { index, onPress } = this.props;
    onPress(index);
  };

  render() {
    const { date } = this.props;
    return (
      <TouchableOpacity
        style={this.getContainerStyle()}
        onLayout={this.onLayout}
        onPress={this.onPress}
      >
        <Text style={this.getDayStyle()}>{date.format('ddd').toUpperCase()}</Text>
        <Text style={this.getDateStyle()}>{date.format('DD')}</Text>
      </TouchableOpacity>
    );
  }

}

const styles = {
  container: {
    borderBottomColor: 'transparent',
    borderBottomWidth: 2,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  containerActive: {
    borderBottomColor: '#FFFFFF',
  },
  day: {
    fontSize: 12,
  },
  date: {
    fontSize: 22,
  },
  text: {
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  textActive: {
    color: '#FFFFFF',
  },
};