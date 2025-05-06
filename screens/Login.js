import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, Image, SafeAreaView, TouchableOpacity, StatusBar, Alert } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase"; // Ajuste o caminho conforme necessário
const backImage = require("../assets/backdarkcolor.jpg");

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Função de login com e-mail e senha
  const onHandleLogin = () => {
    if (email !== "" && password !== "") {
      signInWithEmailAndPassword(auth, email, password)
        .then(() => console.log("Login success"))
        .catch((err) => Alert.alert("Login error", err.message));
    }
  };

  // Função de login com Google (simulada)
  const onGoogleButtonPress = () => {
    console.log("Login with Google");
    // Aqui você pode adicionar a lógica de autenticação com o Google posteriormente
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
        <TouchableOpacity style={styles.button} onPress={onHandleLogin}>
          <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 18 }}>Entrar com Email</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.googleButton} onPress={onGoogleButtonPress}>
          <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 18 }}>Entrar com Google</Text>
        </TouchableOpacity>
        <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
          <Text style={{ color: 'gray', fontWeight: '600', fontSize: 14 }}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
            <Text style={{ color: '#003049', fontWeight: '600', fontSize: 14 }}>Sign Up</Text>
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
    textShadowColor: "rgba(0, 0, 0, 0.5)", // Cor da sombra (preto com 50% de opacidade)
    textShadowOffset: { width: 2, height: 2 }, // Deslocamento da sombra (2px para a direita e 2px para baixo)
    textShadowRadius: 4, // Raio da sombra (quanto maior, mais difusa)
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
});