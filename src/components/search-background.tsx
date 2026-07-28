import { Dimensions, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");

import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";

const GOLD = "#E8A020";

export default function SearchBackground() {
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
      <Defs>
        {/* ellipse geometry eyeballed from search-bg.png (402x874) */}
        <RadialGradient id="gold" gradientUnits="userSpaceOnUse"
          cx={width * 0.08} cy={height * 0.04} rx={width * 0.3} ry={height * 0.16}>
          <Stop offset="0" stopColor={GOLD} stopOpacity={0.95} />
          <Stop offset="0.5" stopColor={GOLD} stopOpacity={0.4} />
          <Stop offset="1" stopColor={GOLD} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="purpleTR" gradientUnits="userSpaceOnUse"
          cx={width * 0.86} cy={height * 0.08} rx={width * 0.38} ry={height * 0.21}>
          <Stop offset="0" stopColor="#B026E0" stopOpacity={0.95} />
          <Stop offset="0.5" stopColor="#B026E0" stopOpacity={0.4} />
          <Stop offset="1" stopColor="#B026E0" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="purpleB" gradientUnits="userSpaceOnUse"
          cx={width * 0.48} cy={height * 1.03} rx={width * 0.52} ry={height * 0.24}>
          <Stop offset="0" stopColor="#CF5AF5" stopOpacity={0.95} />
          <Stop offset="0.45" stopColor="#B026E0" stopOpacity={0.5} />
          <Stop offset="1" stopColor="#B026E0" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width={width} height={height} fill="#0A0A0A" />
      <Rect width={width} height={height} fill="url(#gold)" />
      <Rect width={width} height={height} fill="url(#purpleTR)" />
      <Rect width={width} height={height} fill="url(#purpleB)" />
    </Svg>
  );
}