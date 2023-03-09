
import React, { useState, useEffect } from "react";
import { TouchableOpacity, View, Image, TextInput, Text, Alert } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeBaseProvider } from "native-base";

import auth from "@react-native-firebase/auth"

import { styles } from "./styles";
import { Background } from "../../componentes/Backgound";
import { Button } from "../../componentes/botao/Button";

export function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [admin, setAdmin] = useState(-1)

  const navigation = useNavigation();

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

            <TouchableOpacity>
              <Text>Redefinir senha</Text>
            </TouchableOpacity>

          </View>
        </SafeAreaView>
      </Background>
    </NativeBaseProvider>
  );
}
