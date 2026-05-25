import Svg, { Path } from "react-native-svg";

interface IconProps {
  width?: number;
  height?: number;
  color?: string;
}

export default function Profile({ width = 24, height = 24 }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      {/* Orange rounded square background */}
      <Path
        d="M7 2H17C19.76 2 22 4.24 22 7V17C22 19.76 19.76 22 17 22H7C4.24 22 2 19.76 2 17V7C2 4.24 4.24 2 7 2Z"
        fill="#F5A623"
      />
      {/* Head */}
      <Path
        d="M12 7C10.34 7 9 8.34 9 10C9 11.66 10.34 13 12 13C13.66 13 15 11.66 15 10C15 8.34 13.66 7 12 7Z"
        fill="#1A1A1A"
      />
      {/* Body */}
      <Path
        d="M5.5 22C5.5 18.41 8.41 15.5 12 15.5C15.59 15.5 18.5 18.41 18.5 22H5.5Z"
        fill="#1A1A1A"
      />
    </Svg>
  );
}
