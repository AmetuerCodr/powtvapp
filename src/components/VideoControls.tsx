import { View, Text, TouchableOpacity, StyleSheet} from "react-native";
import { AntDesign, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { Slider } from "@miblanchard/react-native-slider";

interface VideoContrls{
  onTogglePlayPause: () => void;
  onToggleMute: () => void;
  onTogglePlaybackSpeed: () => void;
  onSeek: (number: number) => void;
  onToggleFullscreen: () => void;
  duration: number;
  currentTime: number;
  rate: number;
  isMuted: boolean;
  shouldPlay: boolean;
  fullScreenValue: boolean;
}


const VideoControls = ({
  onTogglePlayPause,
  onToggleMute,
  onTogglePlaybackSpeed,
  onSeek,
  onToggleFullscreen,
  duration,
  currentTime: time,
  rate,
  isMuted,
  shouldPlay,
  fullScreenValue,
}: VideoContrls) => {
  const formatTime = (timeInMillis: number) => {
    if (!isNaN(timeInMillis)) {
      const totalSeconds = Math.floor(timeInMillis / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      return `${minutes < 10 ? "0" : ""}${minutes}:${
        seconds < 10 ? "0" : ""
      }${seconds}`;
    }

    return "00:00";
  };

  return (
    <>
      <View style={styles.controls}>
       
        <View style={styles.controlButtonContainer}>
          
      </View>
        <TouchableOpacity
          onPress={() => {
            onTogglePlayPause();
          }}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          style={styles.controlButton}
        >
          <Ionicons
            name={shouldPlay ? "pause" : "play-sharp"}
            size={32}
            color="#000000"
          />
        </TouchableOpacity>
        {/*<TouchableOpacity
          onPress={onPlayPreviousVideo}
          style={styles.controlButton}
        >
          <AntDesign name="step-backward" size={24} color="white" />
        </TouchableOpacity>*/}
        {/*<TouchableOpacity
          onPress={onPlayNextVideo}
          style={styles.controlButton}
        >
          <AntDesign name="step-forward" size={24} color="white" />
        </TouchableOpacity>*/}


        
        {/*<TouchableOpacity
          onPress={() => {
            onToggleMute();
          }}
          style={styles.controlButton}
        >
          <Ionicons
            name={isMuted ? "volume-mute" : "volume-high"}
            size={24}
            color="white"
          />
        </TouchableOpacity>*/}
        {/*<TouchableOpacity
          onPress={() => {
            onTogglePlaybackSpeed();
          }}
          style={styles.controlButton}
        >
          <Text style={styles.playbackSpeedText}>{`${rate}x`}</Text>
        </TouchableOpacity>*/}
        {/*<TouchableOpacity
          onPress={() => {
            onToggleFullscreen();
          }}
          style={styles.controlButton}
        >
          <MaterialIcons
            name={fullScreenValue ? "fullscreen-exit" : "fullscreen"}
            size={24}
            color="white"
          />
        </TouchableOpacity>*/}
      </View> 
      *
      
      <View style={styles.progressContainer}>
        <Text style={styles.timeText}>{formatTime(time)}</Text>
        <Slider
          containerStyle={styles.slider}
          minimumValue={0}
          maximumValue={duration * 1000}
          value={time}
          onValueChange={(value) => {
            onSeek(value);
          }}
          onSlidingComplete={(value) => {
            onSeek(value);
          }}
          minimumTrackTintColor="#F5A100"
          maximumTrackTintColor="#AAA"
          thumbTintColor="#FFF"
        />
        <Text style={styles.timeText}>{formatTime(duration * 1000)}</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  controls: {
    position: 'absolute',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  controlButtonContainer: {
    flex: 1,
    aspectRatio: 16 / 9,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    // marginHorizontal: 10,
    position: 'absolute',
    backgroundColor: '#F5A100',
    padding: 15,
    borderRadius: '50%',
  },
  playbackSpeedText: {
    color: "white",
    fontSize: 16,
  },
  progressContainer: {
    position: 'absolute',
    bottom: '5%',
    flex: 1,
    // aspectRatio: 16 / 9,
    display: 'flex',
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    alignSelf: "center",
    // backgroundColor: 'rgba(102, 102, 102, 0.2)',
    padding: 10,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  timeText: {
    color: "#fafaf9",
    fontSize: 13,
    fontWeight: '700'
    
  },
});

export default VideoControls;