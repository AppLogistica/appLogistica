
import React, { useState, useEffect } from "react";
import { TouchableOpacity, View, Image, TextInput, Text, Alert } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeBaseProvider } from "native-base";

import auth from "@react-native-firebase/auth"

import { styles } from "./styles";
import { Background } from "../../componentes/Backgound";
import { Button } from "../../componentes/botao/Button";
import { Semanal } from "../Semanal";

export function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [admin, setAdmin] = useState(-1)

  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  // Handle user state changes
  // @ts-ignore
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  const navigation = useNavigation();


  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, [])

  if (initializing) return null;

  if (!user) {
    return (
      <NativeBaseProvider>
        <Background>
          <SafeAreaView style={styles.container}>

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              style={styles.input}
              placeholder="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
            />

            <Button
              title="Entrar"
              style={styles.button}
              onPress={handleLogin}
              isLoading={isLoading}>
            </Button >

            <View style={styles.bottomContainer}>

              <TouchableOpacity onPress={handleResetPass}>
                <Text>Redefinir senha</Text>
              </TouchableOpacity>

            </View>
          </SafeAreaView>
        </Background>
      </NativeBaseProvider>
    );
  }


 
  function handleLogin() {
    if (!email || !password) {

      if (!email && password) {
        Alert.alert('Atenção', 'Informe e-mail!')
        return;
      }

      if (!password && email) {
        Alert.alert('Atenção', 'Informe a senha!')
      }

      return;
    }
    setIsLoading(true);
    auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => navigation.navigate("semanal", { email, password, admin }))
      .catch((error => {
        console.log(error);
        setIsLoading(false);

        if (error.code === 'auth/invalid-email' || error.code === 'auth/wrong-password') {
          return Alert.alert('Atenção', 'E-mail ou senha inválida');
        }

        if (error.code === 'auth/user-not-found') {
          return Alert.alert('Atenção', 'E-mail não cadastrado');
        }

        return Alert.alert('Falha', 'Não foi possível acessar')
      }));

    setIsLoading(false);
  };

  function handleResetPass() {

    if (email !== '') {


      try {

        auth().sendPasswordResetEmail(email)
          .then(() => {
            return Alert.alert('Um link foi enviado para seu email!')
          })
          .catch(() => {
            return Alert.alert('Verifique se o email está coreto!')
          })
      } catch (error) {
        console.log(error);

      }
    }
  }

  return (
    <Semanal/>
  );
}
