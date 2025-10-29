import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';

const CustomAlert = ({ isVisible, title, message, onClose, type = 'success' }) => {
  const scaleValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isVisible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 15,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const getIcon = () => {
    if (type === 'success') {
      return <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />;
    } else if (type === 'error') {
      return <AntDesign name="closecircle" size={60} color="#F44336" />;
    }
    return null;
  };

  const getTitleColor = () => {
    if (type === 'success') {
      return '#4CAF50';
    } else if (type === 'error') {
      return '#F44336';
    }
    return '#333';
  };

  return (
    <Modal transparent visible={isVisible} animationType="fade">
      <View style={styles.modalBackground}>
        <Animated.View style={[styles.alertContainer, { transform: [{ scale: scaleValue }] }]}>
          <View style={styles.alertHeader}>
            {getIcon()}
          </View>
          <Text style={[styles.alertTitle, { color: getTitleColor() }]}>{title}</Text>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>OK</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  alertHeader: {
    marginBottom: 15,
  },
  alertTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#FA4A0C',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CustomAlert;
