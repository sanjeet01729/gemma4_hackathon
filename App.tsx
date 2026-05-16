import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from './src/screens/SplashScreen';
import LanguageSelectScreen from './src/screens/LanguageSelectScreen';
import HomeScreen from './src/screens/HomeScreen';
 import ChatScreen from './src/screens/ChatScreen';
 import PracticeScreen from './src/screens/PracticeScreen';

export type RootStackParamList = {
  Splash: undefined;
  LanguageSelect: undefined;
  Home: undefined;
  
  // Update Chat to include the optional initialQuery
  Chat: { 
    subjectId: string; 
    subjectName: string; 
    initialQuery?: string; // Add this as optional
  };

  Practice: { subjectId: string; subjectName: string };
};
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0f0e17" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{ headerShown: false }} // no header on any screen
        >
          <Stack.Screen name="Splash"          component={SplashScreen} />
          <Stack.Screen name="LanguageSelect"  component={LanguageSelectScreen} />
          <Stack.Screen name="Home"            component={HomeScreen} />
          <Stack.Screen name="Chat"            component={ChatScreen} />
          <Stack.Screen name="Practice"        component={PracticeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}