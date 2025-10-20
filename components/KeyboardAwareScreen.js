import React from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const KeyboardAwareScreen = ({ children, contentContainerStyle, ...rest }) => {
  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1, ...(contentContainerStyle || {}) }}
      keyboardShouldPersistTaps="handled"
      {...rest}
    >
      {children}
    </KeyboardAwareScrollView>
  );
};

export default KeyboardAwareScreen;
