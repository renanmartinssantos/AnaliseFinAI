import React from 'react';
import { View, ScrollView, Switch, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
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
  const { isDarkMode, toggleTheme, currentTheme } = useTheme();
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
        <TouchableOpacity
          style={[staticStyles.item, styles.itemBackground, { marginBottom: 10 }]}
          onPress={() => navigation.navigate('CoinFavorites')}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.textColor, { alignSelf: 'flex-start' }]}>Moedas</Text>
          </View>
          <AntDesign name="staro" size={24} color={styles.textColor.color} />
        </TouchableOpacity>

        {/* Paper Button */}
        <TouchableOpacity
          style={[staticStyles.item, styles.itemBackground, { marginBottom: 10 }]}
          onPress={() => navigation.navigate('PaperFavorites')}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.textColor, { alignSelf: 'flex-start' }]}>Paper</Text>
          </View>
          <AntDesign name="filetext1" size={24} color={styles.textColor.color} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}