import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback
} from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
  where,
  limit,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, database } from '../config/firebase';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import colors from '../colors';
import {
  renderMessageText,
  renderMessageImage
} from './MessageContainer';
import { StatusBar } from 'expo-status-bar';
import FooterNavigation from './components/FooterNavigation'; // Importe o Footer

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const navigation = useNavigation();

  // const onSignOut = () => {
  //   signOut(auth).catch(error => console.log('Error logging out: ', error));
  // };

  // useLayoutEffect(() => {
  //   navigation.setOptions({
  //     headerRight: () => (
  //       <TouchableOpacity
  //         style={{
  //           marginRight: 10
  //         }}
  //         onPress={onSignOut}
  //       >
  //         <AntDesign name="logout" size={24} color={colors.gray} style={{ marginRight: 10 }} />
  //         <StatusBar backgroundColor="#003049" barStyle="light-content" />
  //       </TouchableOpacity>
  //     )
  //   });
  // }, [navigation]);

  useLayoutEffect(() => {
    const collectionRef = collection(database, 'chats');
    const q = query(collectionRef, where('user._id', '==', 0), orderBy('createdAt', 'desc'), limit(20));

    const unsubscribe = onSnapshot(q, querySnapshot => {
      const messages = querySnapshot.docs.map(doc => ({
        _id: doc.data()._id,
        createdAt: doc.data().createdAt.toDate(),
        text: doc.data().text,
        user: doc.data().user,
        image: doc.data().image,
        title: doc.data().title,
        description: doc.data().description,
        score: doc.data().score,
        tier: doc.data().tier,
      }));

      messages.push({
        _id: 0,
        text: 'This is a system message',
        system: true,
      });

      setMessages(messages);
    });

    return unsubscribe;
  }, []);

  const onSend = useCallback((messages = []) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, messages)
    );
    const { _id, createdAt, text, user } = messages[0];
    addDoc(collection(database, 'chats'), {
      _id,
      createdAt,
      text,
      user
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* GiftedChat */}
      <View style={styles.chatContainer}>
        <GiftedChat
          messages={messages}
          showAvatarForEveryMessage={false}
          showUserAvatar={true}
          onSend={messages => onSend(messages)}
          messagesContainerStyle={{
            backgroundColor: '#fff',
          }}
          textInputStyle={{
            backgroundColor: '#fff',
            borderRadius: 20,
          }}
          user={{
            _id: auth?.currentUser?.email,
            avatar: 'https://i.pravatar.cc/300'
          }}
          parsePatterns={linkStyle => [
            {
              pattern: /#(\w+)/,
              style: linkStyle,
              onPress: tag => console.log(`Pressed on hashtag: ${tag}`),
            },
          ]}
          renderMessageText={renderMessageText}
          renderMessageImage={renderMessageImage}
        />
      </View>

      {/* Footer */}
      {/* <FooterNavigation /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Cor de fundo do chat
  },
  chatContainer: {
    flex: 1,
    paddingBottom: 0, // Ajuste o valor conforme a altura do Footer
  },
});