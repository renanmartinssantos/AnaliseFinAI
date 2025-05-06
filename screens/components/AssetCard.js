import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const AssetCard = ({ asset, theme }) => {
  const isPositive = asset.change.startsWith('+');
  const changeColor = isPositive ? theme.positiveColor : theme.negativeColor;

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: theme.cardBackground }]} onPress={() => { /* Handle press */ }}>
      <View style={styles.iconContainer}>
        <FontAwesome name={asset.icon} size={24} color={theme.iconColor} />
      </View>
      <View style={styles.infoContainer}>
        <Text style={[styles.assetName, { color: theme.text }]}>{asset.asset}</Text>
        <Text style={[styles.assetValue, { color: theme.text }]}>{asset.value}</Text>
      </View>
      <Text style={[styles.change, { color: changeColor }]}>{asset.change}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginVertical: 8,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '500',
  },
  assetValue: {
    fontSize: 14,
    color: '#666',
  },
  change: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AssetCard;