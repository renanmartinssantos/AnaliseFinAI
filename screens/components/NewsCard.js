import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

const NewsCard = ({ item, onPress, theme }) => {
  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: theme.cardBackground }]} onPress={onPress}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
        <Text style={[styles.source, { color: theme.secondaryText }]}>{item.source}</Text>
      </View>
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
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  source: {
    fontSize: 14,
  },
});

export default NewsCard;