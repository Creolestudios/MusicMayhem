/*
The primary interface of the application encapsulates a comprehensive array of components, each meticulously designed to fulfill distinct functionalities.
*/

import React, {useRef, useEffect, useState, useCallback} from 'react';
import {
  View,
  SafeAreaView,
  Text,
  AppState,
  Dimensions,
  Animated,
} from 'react-native';

import TrackPlayer, {Event, Capability} from 'react-native-track-player';
import SliderComp from '../components/SliderComponent';
import Controller from '../components/Controller';
import songs from '../data/musicData';
import {styles} from './styles';

const {width} = Dimensions.get('window');

//This is the controllers for setting the track player state.
const TRACK_PLAYER_CONTROLS_OPTS = {
  waitforBuffer: true,
  stopWithApp: false,
  alwaysPauseOnInterruption: true,
  capabilities: [
    Capability.Play,
    Capability.Pause,
    Capability.SkipToNext,
    Capability.SkipToPrevious,
    Capability.SeekTo,
  ],
  compactCapabilities: [
    Capability.Play,
    Capability.Pause,
    Capability.SkipToNext,
    Capability.SkipToPrevious,
  ],
};

export default function PlayerScreen() {
  const scrollX = useRef(new Animated.Value(0)).current;

  const slider: any = useRef(null);
  const isPlayerReady = useRef(false);
  const index = useRef(0);
  const appState = useRef(AppState.currentState);

  const [playerReady, setPlayerReady] = useState(false);
  const [songIndex, setSongIndex] = useState(0);
  const [currentState, setCurrentState] = useState(AppState.currentState);
  const isItFromUser = useRef(true);

  // Getting the Ref. for changing the album art based on the music.
  const position = useRef(Animated.divide(scrollX, width)).current;

  useEffect(() => {
    scrollX.addListener(({value}) => {
      const val = Math.round(value / width);

      setSongIndex(val);
    });
    setUpPlayer();
    setCurrentState(AppState.currentState);
    const subscription = AppState.addEventListener(
      'change',
      _handleAppStateChange,
    );
    return () => {
      scrollX.removeAllListeners();
      TrackPlayer.reset();
      subscription.remove();
    };
  }, [scrollX]);

  // change the song when index changes
  useEffect(() => {
    if (isPlayerReady.current && isItFromUser.current) {
      if (songIndex - 1 < 0) {
        return;
      }
      TrackPlayer.skip(Number(songs[songIndex - 1].id))
        .then(_ => {})
        .catch(e => console.log('error in changing track ', e));
      index.current = songIndex;
    }
  }, [songIndex]);

  //For handling the state of the application.
  const _handleAppStateChange = async (nextAppState: any) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      const trackerId: any = await TrackPlayer.getActiveTrackIndex();
      if (songs.length - 1 == trackerId) {
        return;
      }

      slider.current.scrollToOffset({
        offset: trackerId * width,
      });
      index.current = trackerId;
    }
    appState.current = nextAppState;
  };

  const setUpPlayer = async () => {
    await TrackPlayer.setupPlayer();
    setPlayerReady(true);
    // The player is ready to be used

    // Add the array of songs in the playlist
    await TrackPlayer.updateOptions(TRACK_PLAYER_CONTROLS_OPTS);

    await TrackPlayer.reset();
    await TrackPlayer.add(songs);
    // TrackPlayer.play();
    isPlayerReady.current = true;

    // monitor intterupt when other apps start playing music
    TrackPlayer.addEventListener(Event.RemoteDuck, e => {
      if (e.paused) {
        // if pause true we need to pause the music
        TrackPlayer.pause();
      } else {
        TrackPlayer.play();
      }
    });
  };

  //This function is called when next button is pressed and change to the next song.
  const goNext = async () => {
    if (songs.length - 1 == index.current) {
      return;
    }

    slider.current.scrollToOffset({
      offset: (index.current + 1) * width,
    });
    index.current += 1;
    await TrackPlayer.skipToNext();
  };

  //This function is called when previous button is pressed and move it to the previos song in queue.
  const goPrv = async () => {
    if (index.current == 0) {
      return;
    }
    slider.current.scrollToOffset({
      offset: (index.current - 1) * width,
    });
    index.current -= 1;

    await TrackPlayer.skipToPrevious();
  };

  const renderItem = useCallback(
    ({index, item}: any) => {
      return (
        <Animated.View
          style={{
            alignItems: 'center',
            width: width,
            transform: [
              {
                translateX: Animated.multiply(
                  Animated.add(position, -index),
                  -100,
                ),
              },
            ],
          }}>
          <Animated.Image
            source={item.artwork}
            style={{width: 320, height: 320, borderRadius: 5}}
          />
        </Animated.View>
      );
    },
    [slider, index.current],
  );

  if (!playerReady) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <SafeAreaView style={{height: 320}}>
        <Animated.FlatList
          ref={slider}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          data={songs}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {x: scrollX}}}],
            {useNativeDriver: true},
          )}
        />
      </SafeAreaView>
      <View>
        <Text style={styles.title}>{songs[songIndex].title}</Text>
        <Text style={styles.artist}>{songs[songIndex].artist}</Text>
      </View>

      <SliderComp onFinishSong={goNext} />

      <Controller onNext={goNext} onPrv={goPrv} />
    </SafeAreaView>
  );
}
