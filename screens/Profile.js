import React ,{ useLayoutEffect }from 'react';
import { View, ScrollView, Switch, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useTheme } from './context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import UserCard from './profile/UserCard'; // Adjust the import path as necessary
import { signOut } from 'firebase/auth';
import { auth, database } from '../config/firebase';
import { StatusBar } from 'expo-status-bar';
// Static styles that don't change with the theme
const staticStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 16,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
});

export default function Profile() {
  const { isDarkMode, toggleTheme, currentTheme, userName, profilePicture } = useTheme();
  const navigation = useNavigation();
  const onSignOut = () => {
    signOut(auth).catch(error => console.log('Error logging out: ', error));
  };

  // Dynamic Styles based on currentTheme
  const getStyles = (currentTheme) => ({
    containerBackground: {
      backgroundColor: currentTheme.background,
    },
    itemBackground: {
      backgroundColor: currentTheme.cardBackground,
    },
    textColor: {
      color: currentTheme.text,
    },
    userCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderColor: currentTheme.border,
      backgroundColor: currentTheme.cardBackground,
      elevation: 2,
      borderRadius: currentTheme.borderRadius || 8,
      marginBottom: 16,
    },
    profilePicture: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 10,
      borderWidth: 1,
      borderColor: currentTheme.border,
    },
    textContainer: {
      flex: 1,
    },
    userName: {
      color: currentTheme.text,
      fontSize: 18,
      fontWeight: 'bold',
    },
    rippleColor: currentTheme.rippleColor || '#cccccc',
    switchTrack: {
      trackColor: { false: currentTheme.switchTrackOff, true: currentTheme.switchTrackOn },
    },
    switchThumb: {
      thumbColor: currentTheme.switchThumb,
    },
  });

  const styles = getStyles(currentTheme);

  return (
    <View style={[staticStyles.container, styles.containerBackground]}>
      <ScrollView contentContainerStyle={[staticStyles.scrollViewContent, styles.containerBackground]}>
        {/* User Card */}
        <UserCard
          name={'John Doe'}
          profilePicture={'https://via.placeholder.com/150'}
          userCardStyles={styles}
          onPress={() => navigation.navigate('UserProfile')}
        />
        {/* Menu Items */}
        <TouchableOpacity
          style={[staticStyles.item, styles.itemBackground, { marginBottom: 10 }]}
          onPress={() => navigation.navigate('Account')}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.textColor, { alignSelf: 'flex-start' }]}>Account</Text>
          </View>
          <AntDesign name="user" size={24} color={styles.textColor.color} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[staticStyles.item, styles.itemBackground, { marginBottom: 10 }]}
          onPress={() => navigation.navigate('StockFavorites')}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.textColor, { alignSelf: 'flex-start' }]}>Stock Favorites</Text>
          </View>
          <AntDesign name="heart" size={24} color={styles.textColor.color} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[staticStyles.item, styles.itemBackground]}
          onPress={() => navigation.navigate('Notification')}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.textColor, { alignSelf: 'flex-start' }]}>Notification</Text>
          </View>
          <AntDesign name="notification" size={24} color={styles.textColor.color} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[staticStyles.item, styles.itemBackground, { marginBottom: 10 }]}
          onPress={() => navigation.navigate('FriendList')}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.textColor, { alignSelf: 'flex-start' }]}>Lista de Amigos</Text>
          </View>
          <AntDesign name="addusergroup" size={24} color={styles.textColor.color} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[staticStyles.item, styles.itemBackground, { marginBottom: 10 }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.textColor, { alignSelf: 'flex-start' }]}>Settings</Text>
          </View>
          <AntDesign name="setting" size={24} color={styles.textColor.color} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[staticStyles.item, styles.itemBackground, { marginBottom: 10 }]}
          onPress={onSignOut}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.textColor, { alignSelf: 'flex-start' }]}>Logout</Text>
          </View>
          <AntDesign name="logout" size={24} color={styles.textColor.color} />
        </TouchableOpacity>
      </ScrollView>
      {/* Dark Mode Toggle */}
      <View style={[staticStyles.switchContainer, styles.containerBackground]}>
        <Text style={styles.textColor}>Dark Mode</Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          trackColor={styles.switchTrack.trackColor}
          thumbColor={styles.switchThumb.thumbColor}
        />
      </View>
    </View>
  );
}