/* 
This component is designed to manage the functionalities of navigating to the next or previous track and controlling the play-pause functionality within the context of music playback.
*/

import React, {useEffect, useRef} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TrackPlayer, {usePlaybackState} from 'react-native-track-player';

export default function Controller({onNext, onPrv}: any) {
  const playbackState: any = usePlaybackState();
  const isPlaying = useRef('paused'); //Getting the reference of play-pause loading.

  //Setting the player state.
  useEffect(() => {
    if (playbackState.state === 'playing' || playbackState.state === 3) {
      isPlaying.current = 'playing';
    } else if (playbackState.state === 'paused' || playbackState.state === 2) {
      isPlaying.current = 'paused';
    } else {
      isPlaying.current = 'loading';
    }
  }, [playbackState]);

  //Handles play, pause, and loading functionality based on the button state.
  const returnPlayBtn = () => {
    switch (playbackState.state) {
      case 'playing':
        return <Icon color="#fff" name="pause" size={45} />;
      case 'paused':
      case 'ready':
        return <Icon color="#fff" name="play-arrow" size={45} />;
      default:
        return <ActivityIndicator size={45} color="#fff" />;
    }
  };

  //This function is responsible for managing onPress events triggered by the play and pause buttons.
  const onPlayPause = () => {
    if (playbackState.state === 'playing') {
      TrackPlayer.pause();
    } else if (
      playbackState.state === 'paused' ||
      playbackState.state === 'ready'
    ) {
      TrackPlayer.play();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPrv}>
        <Icon color="#fff" name="skip-previous" size={45} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onPlayPause}>
        {returnPlayBtn()}
      </TouchableOpacity>
      <TouchableOpacity onPress={onNext}>
        <Icon color="#fff" name="skip-next" size={45} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: 250,
  },
});
