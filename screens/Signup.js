import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Image, SafeAreaView, TouchableOpacity, StatusBar, Alert } from "react-native";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, database } from '../config/firebase'; // Import Firestore
import { doc, setDoc } from 'firebase/firestore'; // Firestore functions
import { AntDesign } from "@expo/vector-icons"; // Para o ícone do Google

const backImage = require("../assets/backdarkcolor.jpg"); // Use a mesma imagem de fundo da tela de login

export default function Signup({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onHandleSignup = () => {
    if (email !== '' && password !== '') {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;

          // Save user data to Firestore
          const userData = {
            userid: user.uid,
            email: user.email,
            name: user.email,
            avatar: '', // You can set a default avatar or leave it empty
            friendlist: [], // Initialize an empty friend list
          };

          // Add a new document in the "users" collection with the user's UID as the document ID
          setDoc(doc(database, 'users', user.uid), userData)
            .then(() => {
              console.log('User data saved to Firestore');
            })
            .catch((error) => {
              console.error('Error saving user data: ', error);
              Alert.alert("Error", "Failed to save user data.");
            });
        })
        .catch((err) => console.error("Signup error", err.message));
    }
  };

  const onGoogleButtonPress = () => {
    console.log("Signup with Google");
    // Adicione a lógica de autenticação com o Google posteriormente
  };

  return (
    <View style={styles.container}>
      <Image source={backImage} style={styles.backImage} />
      <View style={styles.whiteSheet} />
      <SafeAreaView style={styles.form}>
        <Text style={styles.title}></Text>
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          placeholderTextColor="#aaa"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          autoFocus={true}
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          placeholderTextColor="#aaa"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={true}
          textContentType="password"
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
        <TouchableOpacity style={styles.button} onPress={onHandleSignup}>
          <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 18 }}>Cadastrar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.googleButton} onPress={onGoogleButtonPress}>
            <Text style={styles.googleButtonText}>Entrar com Google</Text>
        </TouchableOpacity>
        <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
          <Text style={{ color: 'gray', fontWeight: '600', fontSize: 14 }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={{ color: '#003049', fontWeight: '600', fontSize: 14 }}>Log In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <StatusBar backgroundColor="#003049" barStyle="light-content" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: "#fff",
    alignSelf: "center",
    paddingBottom: 20,
    textShadowColor: "rgba(0, 0, 0, 0.5)", // Sombra do texto
    textShadowOffset: { width: 2, height: 2 }, // Deslocamento da sombra
    textShadowRadius: 4, // Raio da sombra
  },
  input: {
    backgroundColor: "#F6F7FB",
    height: 58,
    marginBottom: 20,
    fontSize: 16,
    borderRadius: 10,
    padding: 12,
    color: "#000",
  },
  backImage: {
    width: "100%",
    height: 340,
    position: "absolute",
    top: 0,
    resizeMode: 'cover',
  },
  whiteSheet: {
    width: '100%',
    height: '75%',
    position: "absolute",
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 60,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 30,
  },
  button: {
    backgroundColor: '#003049',
    height: 58,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  googleButton: {
    backgroundColor: '#DB4437', // Cor do Google
    height: 58,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonContent: {
    flexDirection: 'row', // Alinha ícone e texto horizontalmente
    alignItems: 'center', // Centraliza verticalmente
  },
  googleButtonText: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 18,
    marginLeft: 10, // Espaçamento entre o ícone e o texto
  },
});