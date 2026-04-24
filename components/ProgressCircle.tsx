import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface ProgressCircleProps {
  size: number;
  progress: number;
  strokeWidth: number;
  color: string;
  backgroundColor: string;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export const ProgressCircle: React.FC<ProgressCircleProps> = ({
  size,
  progress,
  strokeWidth,
  color,
  backgroundColor,
  children,
  style,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const strokeDashoffset = circumference - clampedProgress * circumference;

  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={backgroundColor} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={styles.absoluteCenter}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  absoluteCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});