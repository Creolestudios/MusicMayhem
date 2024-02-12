import React from 'react';
import {StyleSheet, StatusBar, ImageBackground} from 'react-native';
import PlayerScreen from './src/pages/PlayerScreen';

export default function App() {
  return (
    <ImageBackground
      source={require('./assets/album-arts/img_back.png')}
      style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#030303" />
      <PlayerScreen />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030303',
    justifyContent: 'center',
  },
});
