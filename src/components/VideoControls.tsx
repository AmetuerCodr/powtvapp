import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { Slider } from "@miblanchard/react-native-slider";

// POWTV brand gold — matches the play button + progress track.
const GOLD = "#F5A100";
// Slightly see-through gold so the buttons sit over the video without
// blocking it — keeps the controls feeling light / less invasive.
const GOLD_TRANSLUCENT = "rgba(245, 161, 0, 0.85)";

interface VideoContrls {
  onTogglePlayPause: () => void;
  onTogglePlaybackSpeed: () => void;
  onSeek: (seconds: number) => void;
  onToggleFullscreen: () => void;
  duration: number; // seconds
  currentTime: number; // seconds
  rate: number;
  shouldPlay: boolean;
  fullScreenValue: boolean;
}

const VideoControls = ({
  onTogglePlayPause,
  onTogglePlaybackSpeed,
  onSeek,
  onToggleFullscreen,
  duration,
  currentTime: time,
  rate,
  shouldPlay,
  fullScreenValue,
}: VideoContrls) => {
  // While the user drags the thumb we freeze the slider on `seekValue` so the
  // player's twice-a-second timeUpdate doesn't yank the thumb out from under
  // their finger. We only commit the real seek on release.
  const [seeking, setSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  const formatTime = (seconds: number) => {
    if (!isNaN(seconds) && isFinite(seconds)) {
      const totalSeconds = Math.floor(seconds);
      const minutes = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;

      return `${minutes < 10 ? "0" : ""}${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    }

    return "00:00";
  };

  // @miblanchard/react-native-slider hands callbacks an Array<number>, not a
  // plain number — unwrap it before doing anything numeric with it.
  const unwrap = (value: number | number[]) =>
    Array.isArray(value) ? value[0] : value;

  const displayValue = seeking ? seekValue : time;
  const maxValue = duration > 0 ? duration : 1;

  return (
    // box-none lets taps fall through to the video's tap/seek gestures while
    // the actual buttons below still receive their presses.
    <View style={styles.overlay} pointerEvents="box-none">
      {/* Center play / pause */}
      <View style={styles.centerControls} pointerEvents="box-none">
        <TouchableOpacity
          onPress={onTogglePlayPause}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          style={styles.playButton}
        >
          <Ionicons
            name={shouldPlay ? "pause" : "play-sharp"}
            size={26}
            color="#000000"
          />
        </TouchableOpacity>
      </View>

      {/* Bottom bar: control row + progress */}
      <View style={styles.bottomBar} pointerEvents="box-none">
        <View style={styles.controlRow}>
          {/* Playback speed */}
          <TouchableOpacity
            onPress={onTogglePlaybackSpeed}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.smallButton}
          >
            <Text style={styles.speedText}>{`${rate}x`}</Text>
          </TouchableOpacity>

          {/* Fullscreen */}
          <TouchableOpacity
            onPress={onToggleFullscreen}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.smallButton}
          >
            <MaterialIcons
              name={fullScreenValue ? "fullscreen-exit" : "fullscreen"}
              size={22}
              color="#000000"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.timeText}>{formatTime(displayValue)}</Text>
          <Slider
            containerStyle={styles.slider}
            minimumValue={0}
            maximumValue={maxValue}
            value={displayValue}
            onSlidingStart={() => setSeeking(true)}
            onValueChange={(value) => setSeekValue(unwrap(value))}
            onSlidingComplete={(value) => {
              onSeek(unwrap(value));
              setSeeking(false);
            }}
            minimumTrackTintColor={GOLD}
            maximumTrackTintColor="#AAA"
            thumbTintColor="#FFF"
          />
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  centerControls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    backgroundColor: GOLD_TRANSLUCENT,
    padding: 12,
    borderRadius: 999,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: 12,
  },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  smallButton: {
    backgroundColor: GOLD_TRANSLUCENT,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  speedText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "700",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 12,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  timeText: {
    color: "#fafaf9",
    fontSize: 13,
    fontWeight: "700",
  },
});

export default VideoControls;
