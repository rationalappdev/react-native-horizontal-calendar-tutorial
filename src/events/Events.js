// @flow

import React, { Component } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Event from './Event';
import type { EventType } from '../../App';

export default class Events extends Component {

  props: {
    events: ?Array<EventType>,
  };

  render() {
    const { events } = this.props;
    return (
      <View style={styles.container}>
        <ScrollView>
          {events && events.map((event, index) =>
            <Event event={event} key={index} />)}
        </ScrollView>
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#243177',
  },
});