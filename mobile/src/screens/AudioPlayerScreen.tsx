import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get('window');

const AudioPlayerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { audioUri, title = 'Audio File', waveformType = 'option1' } = route.params as any;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // 3 minutes
  const [volume, setVolume] = useState(0.8);
  const [isLooping, setIsLooping] = useState(false);
  const [speed, setSpeed] = useState(1.0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            if (isLooping) {
              return 0;
            } else {
              setIsPlaying(false);
              return prev;
            }
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, duration, isLooping]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number) => {
    setCurrentTime(value);
  };

  const handleRewind = () => {
    setCurrentTime(Math.max(0, currentTime - 10));
  };

  const handleForward = () => {
    setCurrentTime(Math.min(duration, currentTime + 10));
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    // In a real app, this would change the playback speed
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderWaveform = () => {
    const bars = [];
    const barCount = 50;

    for (let i = 0; i < barCount; i++) {
      let height = 20;

      switch (waveformType) {
        case 'option1':
          // Classic waveform
          height = Math.sin((i / barCount) * Math.PI * 4) * 30 + 40;
          break;
        case 'option2':
          // Rounded peaks
          height = Math.abs(Math.sin((i / barCount) * Math.PI * 6)) * 50 + 20;
          break;
        case 'option3':
          // Sharp peaks
          height = Math.random() * 60 + 20;
          break;
        case 'option4':
          // Smooth waves
          height = Math.sin((i / barCount) * Math.PI * 2) * 25 + 35;
          break;
        default:
          height = 30;
      }

      // Highlight current position
      const isActive = i / barCount <= currentTime / duration;
      const barColor = isActive ? '#5546FF' : '#E5E7EB';

      bars.push(
        <View
          key={i}
          style={[
            styles.waveformBar,
            {
              height,
              backgroundColor: barColor,
              marginHorizontal: 1,
            },
          ]}
        />
      );
    }

    return bars;
  };

  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <TouchableOpacity style={styles.moreButton}>
          <MaterialIcons name="more-vert" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Audio Visualization */}
        <View style={styles.visualizationContainer}>
          <View style={styles.waveformContainer}>
            {renderWaveform()}
          </View>

          {/* Time Display */}
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Slider
            style={styles.progressBar}
            minimumValue={0}
            maximumValue={duration}
            value={currentTime}
            onValueChange={handleSeek}
            minimumTrackTintColor="#5546FF"
            maximumTrackTintColor="#E5E7EB"
            thumbStyle={styles.thumb}
          />
        </View>

        {/* Playback Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.controlButton} onPress={handleRewind}>
            <MaterialIcons name="replay-10" size={32} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
            <MaterialIcons
              name={isPlaying ? 'pause' : 'play-arrow'}
              size={48}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={handleForward}>
            <MaterialIcons name="forward-10" size={32} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Speed Control */}
        <View style={styles.speedContainer}>
          <Text style={styles.speedLabel}>Playback Speed</Text>
          <View style={styles.speedOptions}>
            {speedOptions.map((speedOption) => (
              <TouchableOpacity
                key={speedOption}
                style={[
                  styles.speedButton,
                  speed === speedOption && styles.speedButtonActive,
                ]}
                onPress={() => handleSpeedChange(speedOption)}
              >
                <Text
                  style={[
                    styles.speedText,
                    speed === speedOption && styles.speedTextActive,
                  ]}
                >
                  {speedOption}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Volume Control */}
        <View style={styles.volumeContainer}>
          <MaterialIcons name="volume-up" size={24} color="#6B7280" />
          <Slider
            style={styles.volumeSlider}
            minimumValue={0}
            maximumValue={1}
            value={volume}
            onValueChange={setVolume}
            minimumTrackTintColor="#5546FF"
            maximumTrackTintColor="#E5E7EB"
          />
          <Text style={styles.volumeText}>{Math.round(volume * 100)}%</Text>
        </View>

        {/* Additional Controls */}
        <View style={styles.additionalControls}>
          <TouchableOpacity
            style={[styles.additionalButton, isLooping && styles.additionalButtonActive]}
            onPress={() => setIsLooping(!isLooping)}
          >
            <MaterialIcons
              name="repeat"
              size={20}
              color={isLooping ? '#FFFFFF' : '#6B7280'}
            />
            <Text
              style={[
                styles.additionalText,
                isLooping && styles.additionalTextActive,
              ]}
            >
              Loop
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.additionalButton}>
            <MaterialIcons name="download" size={20} color="#6B7280" />
            <Text style={styles.additionalText}>Download</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.additionalButton}>
            <MaterialIcons name="share" size={20} color="#6B7280" />
            <Text style={styles.additionalText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.additionalButton}>
            <MaterialIcons name="favorite-border" size={20} color="#6B7280" />
            <Text style={styles.additionalText}>Favorite</Text>
          </TouchableOpacity>
        </View>

        {/* Waveform Options */}
        <View style={styles.waveformOptions}>
          <Text style={styles.optionsTitle}>Waveform Style</Text>
          <View style={styles.optionsGrid}>
            {[
              { id: 'option1', name: 'Classic' },
              { id: 'option2', name: 'Rounded' },
              { id: 'option3', name: 'Sharp' },
              { id: 'option4', name: 'Smooth' },
            ].map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  waveformType === option.id && styles.optionButtonActive,
                ]}
                onPress={() => {
                  // In a real app, this would change the waveform type
                  console.log('Change waveform to:', option.id);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    waveformType === option.id && styles.optionTextActive,
                  ]}
                >
                  {option.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    marginHorizontal: 16,
  },
  moreButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  visualizationContainer: {
    padding: 20,
    alignItems: 'center',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 100,
    width: width - 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  waveformBar: {
    borderRadius: 2,
    opacity: 0.8,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width - 40,
    marginTop: 16,
  },
  timeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    width: '100%',
    height: 40,
  },
  thumb: {
    width: 20,
    height: 20,
    backgroundColor: '#5546FF',
    borderRadius: 10,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#5546FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5546FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  speedContainer: {
    padding: 20,
  },
  speedLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  speedOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  speedButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  speedButtonActive: {
    backgroundColor: '#5546FF',
    borderColor: '#5546FF',
  },
  speedText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  speedTextActive: {
    color: '#FFFFFF',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  volumeSlider: {
    flex: 1,
    marginHorizontal: 16,
  },
  volumeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    minWidth: 40,
  },
  additionalControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  additionalButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  additionalButtonActive: {
    backgroundColor: '#5546FF',
    borderRadius: 8,
  },
  additionalText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  additionalTextActive: {
    color: '#FFFFFF',
  },
  waveformOptions: {
    padding: 20,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#5546FF',
    borderColor: '#5546FF',
  },
  optionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
});

export default AudioPlayerScreen;
