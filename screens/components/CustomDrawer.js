import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { ThemeProvider, useTheme } from '../context/ThemeContext'; // Importar o ThemeProvider
const CustomDrawer = ({ navigation }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }]}>
      <View style={styles.content}>
        <TouchableOpacity
            style={styles.drawerItem}
            onPress={() => navigation.navigate('Account')}
          >
            <Text style={[styles.drawerItemText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Account</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={[styles.drawerItemText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => navigation.navigate('StockFavorites')}
        >
          <Text style={[styles.drawerItemText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Stock Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => navigation.navigate('Notification')}
        >
          <Text style={[styles.drawerItemText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Notification</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => navigation.navigate('FriendList')}
        >
          <Text style={[styles.drawerItemText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Notification</Text>
        </TouchableOpacity>
      
      </View>
      <View style={styles.footer}>
        <View style={styles.toggleContainer}>
          <Text style={[styles.toggleLabel, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Dark Mode</Text>
          <Switch
            style={styles.toggleSwitch}
            value={isDarkMode}
            onValueChange={toggleTheme}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    paddingHorizontal: 20,
  },
  drawerItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  drawerItemText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  footer: {
    marginTop: 'auto',
    paddingVertical: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    marginRight: 10,
    fontSize: 16,
  },
  toggleSwitch: {
    // Additional styling for the switch can be added here
  },
});

export default CustomDrawer;