import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import {SignIn} from './features/auth/screens/signIn';
import { SignUp } from './features/auth/screens/signUp';
import { SafeAreaView } from 'react-native-safe-area-context';
import {Home} from './features/Customer/screens/Home';
import { BottomBar } from './components/bottomBar';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Home />
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
