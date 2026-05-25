import Svg, { Path } from "react-native-svg";

interface IconProps {
  width?: number;
  height?: number;
  color?: string;
}

export default function Watch({ width = 24, height = 24, color = "#a1a1aa" }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 4H18C19.66 4 21 5.34 21 7V17C21 18.66 19.66 20 18 20H6C4.34 20 3 18.66 3 17V7C3 5.34 4.34 4 6 4Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M10 8.5L10 15.5L16.5 12L10 8.5Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        fill={color}
      />
    </Svg>
  );
}
