// SharedLayout.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Header from './Header'; // Crie um componente Header separado, se necessário
import FooterNavigation from './layout/FooterNavigation'; // Extraia o Footer para um componente separado

const SharedLayout = ({ children }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <Header />

      {/* Conteúdo Central */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Footer */}
      <FooterNavigation />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    marginBottom: 80, // Espaço para o Footer
  },
});

export default SharedLayout;