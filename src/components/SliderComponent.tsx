/*
This SliderComponent is used for seeking the music. 
*/

import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Slider from '@react-native-community/slider';
import TrackPlayer, {Event} from 'react-native-track-player';

export default function SliderComp({onFinishSong}: any) {
  const [position, setPosition] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seek, setSeek] = useState(0);

  useEffect(() => {
    TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, () => {
      setIsSeeking(false);
      getPosition();
    });
  }, []);

  useEffect(() => {
    setInterval(() => {
      getPosition();
    }, 900);
  }, []);

  // This Function is basically used to get the current position of the music using `TrackPlayer.getProgress()` method.
  const getPosition = async () => {
    await TrackPlayer.getProgress()
      .then(progress => {
        setPosition(progress.position);
        setDuration(progress.duration);
        setBuffered(progress.position);
        if (
          progress.position > 0 &&
          progress.duration > 0 &&
          progress.position.toFixed(0) == progress.duration.toFixed(0)
        ) {
          onFinishSong();
        }
      })
      .catch(err => console.log(err, 'err in get position'));
  };

  //It will format the time in seconds.
  const formatTime = (secs: any) => {
    let minutes = Math.floor(secs / 60);
    let seconds: any = Math.ceil(secs - minutes * 60);

    if (seconds < 10) {
      seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
  };

  //This function is used to handle changes of the slider.
  const handleChange = (val: any) => {
    TrackPlayer.seekTo(val);
    TrackPlayer.play().then(() => {
      getPosition();
      setTimeout(() => {
        setIsSeeking(false);
      }, 1000);
    });
  };

  return (
    <View style={styles.container}>
      <Slider
        style={{width: 320, height: 40}}
        minimumValue={0}
        value={isSeeking ? seek : buffered}
        maximumValue={duration}
        minimumTrackTintColor="#ffffff"
        onSlidingComplete={handleChange}
        maximumTrackTintColor="rgba(255, 255, 255, .5)"
        thumbTintColor="#fff"
      />
      <View style={styles.timeContainer}>
        <Text style={styles.timers}>
          {formatTime(isSeeking ? seek : position)}
        </Text>
        <Text style={styles.timers}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 70,
  },
  timers: {
    color: '#fff',
    fontSize: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
