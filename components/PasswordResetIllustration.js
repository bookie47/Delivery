import React from 'react';
import { View } from 'react-native';
import { Svg, Rect, Path, G } from 'react-native-svg';

export default function PasswordResetIllustration() {
  return (
    <View>
      <Svg width="294" height="294" viewBox="0 0 294 294" fill="none">
        <Rect x="82" y="144" width="130" height="10" rx="5" fill="#FA4A0C" />
        <Path
          d="M147 294C65.9507 294 0 228.049 0 147C0 65.9507 65.9507 0 147 0C228.049 0 294 65.9507 294 147C294 228.049 228.049 294 147 294ZM147 20C77.0294 20 20 77.0294 20 147C20 216.971 77.0294 274 147 274C216.971 274 274 216.971 274 147C274 77.0294 216.971 20 147 20Z"
          fill="#FA4A0C"
        />
        <Path
          d="M147 101C135.954 101 127 109.954 127 121C127 132.046 135.954 141 147 141C158.046 141 167 132.046 167 121C167 109.954 158.046 101 147 101ZM147 121C147 121.552 146.552 122 146 122H148C147.448 122 147 121.552 147 121Z"
          fill="#FA4A0C"
        />
        <G>
          <Rect x="100" y="174" width="94" height="10" rx="5" fill="#FA4A0C" />
          <Rect x="100" y="194" width="94" height="10" rx="5" fill="#FA4A0C" />
          <Rect x="100" y="214" width="54" height="10" rx="5" fill="#FA4A0C" />
        </G>
      </Svg>
    </View>
  );
}