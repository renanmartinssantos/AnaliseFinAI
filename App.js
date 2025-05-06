// App.js
import React, { useState, createContext, useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, useAnimatedHeaderHeight } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet, Image, Animated } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import Login from './screens/Login';
import Signup from './screens/Signup';
import Chats from './screens/Chats';
import Chat from './screens/Chat';
import Home from './screens/Home';
import FooterNavigation from './screens/components/FooterNavigation';
import Profile from './screens/Profile';
import Account from './screens/profile/Account';
import Settings from './screens/profile/Settings';
import StockFavorites from './screens/profile/StockFavorites';
import Notification from './screens/profile/Notification';
import PaperFavorites from './screens/profile/PaperFavorites';
import CoinFavorites from './screens/profile/CoinFavorites';
import CreateGroup from './screens/conversations/CreateGroup';
import NewMessage from './screens/conversations/NewMessage';
import AddFriends from './screens/conversations/AddFriends';
import FriendList from './screens/conversations/FriendList';
import Conversation from './screens/conversations/Conversation';
import { ThemeProvider, useTheme } from './screens/context/ThemeContext';

const Stack = createStackNavigator();
const AuthenticatedUserContext = createContext({});

const AuthenticatedUserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  return (
    <AuthenticatedUserContext.Provider value={{ user, setUser }}>
      {children}
    </AuthenticatedUserContext.Provider>
  );
};

function HomeWithFooter({ navigation }) {
  const { currentTheme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <Home navigation={navigation} />
      <FooterNavigation />
    </View>
  );
}

function MainStack() {
  const { currentTheme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: currentTheme.headerBackground },
        headerTintColor: currentTheme.text,
        headerTitleStyle: { fontWeight: 'bold', color: '#FFFFFF' },
        headerTitleAlign: 'center',
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen
        name="HomeWithFooter"
        component={HomeWithFooter}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Chat" component={Chat} options={{ headerShown: true }} />
      <Stack.Screen name="Chats" component={Chats} options={{ headerShown: true }} />
      <Stack.Screen name="Conversation" component={Conversation} options={{ headerShown: true }} />
      <Stack.Screen name="NewMessage" component={NewMessage} options={{ headerShown: true }} />
      <Stack.Screen name="CreateGroup" component={CreateGroup} options={{ headerShown: true }} />
      <Stack.Screen name="AddFriends" component={AddFriends} options={{ headerShown: true }} />
      <Stack.Screen name="FriendList" component={FriendList} options={{ headerShown: true }} />
      <Stack.Screen name="Profile" component={Profile} options={{ headerShown: true }} />
      <Stack.Screen name="Account" component={Account} options={{ headerShown: true }} />
      <Stack.Screen name="Settings" component={Settings} options={{ headerShown: true }} />
      <Stack.Screen name="StockFavorites" component={StockFavorites} options={{ headerShown: true }} />
      <Stack.Screen name="CoinFavorites" component={CoinFavorites} options={{ headerShown: true }} />
      <Stack.Screen name="PaperFavorites" component={PaperFavorites} options={{ headerShown: true }} />
      <Stack.Screen name="Notification" component={Notification} options={{ headerShown: true }} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='Login' component={Login} />
      <Stack.Screen name='Signup' component={Signup} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { user, setUser } = useContext(AuthenticatedUserContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (authenticatedUser) => {
        authenticatedUser ? setUser(authenticatedUser) : setUser(null);
        setIsLoading(false);
      }
    );
    return unsubscribeAuth;
  }, [user]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative' },
});

export default function App() {
  return (
    <ThemeProvider>
      <AuthenticatedUserProvider>
        <RootNavigator />
      </AuthenticatedUserProvider>
    </ThemeProvider>
  );
}