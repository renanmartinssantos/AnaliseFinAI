import React from 'react';
import { Pressable, View, Image, Text, StyleSheet } from 'react-native';

const UserCard = ({ name, profilePicture, userCardStyles, onPress }) => {
  return (
    <Pressable
      style={userCardStyles.userCard}
      onPress={onPress}
      android_ripple={{ color: userCardStyles.rippleColor }}
      accessibilityLabel={`User card for ${name}`}
    >
      <Image
        source={{ uri: profilePicture }}
        style={userCardStyles.profilePicture}
        resizeMode="cover"
        onLoadEnd={() => console.log('Image loaded')}
        onError={() => console.log('Image error')}
        accessibilityLabel={`Profile picture of ${name}`}
      />
      <View style={userCardStyles.textContainer}>
        <Text
          style={userCardStyles.userName}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {name}
        </Text>
      </View>
    </Pressable>
  );
};

export default UserCard;