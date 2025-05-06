// FooterNavigation.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const FooterNavigation = () => {
  const navigation = useNavigation();
  const { currentTheme } = useTheme();

  return (
    <View style={[styles.footerNavigation, { backgroundColor: currentTheme.footerBackground }]}>
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('HomeWithFooter')}>
        <Image
          source={{ uri: 'https://raw.githubusercontent.com/renanmartinssantos/caramellon/main/2.png' }}
          style={styles.logo}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Trade')}>
        <MaterialIcons name="trending-up" size={30} color={currentTheme.footerIconColor} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Chat')}>
        <FontAwesome name="comment" size={30} color={currentTheme.footerIconColor} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Profile')}>
        <FontAwesome name="user" size={30} color={currentTheme.footerIconColor} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footerNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10
  },
  navButton: { alignItems: 'center', paddingHorizontal: 15 },
  logo: { width: 30, height: 30, resizeMode: 'contain' },
});

export default FooterNavigation;