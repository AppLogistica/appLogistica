
import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeBaseProvider } from "native-base";
import { LinearGradient } from 'expo-linear-gradient';

import { styles } from "./styles";
import { Background } from "../../componentes/Backgound";
import { FornecedorProps, Historico, SemanaProps } from "../../componentes/SemanalCard";
import { TEMA } from "../../tema/tema";
import firestore, { firebase } from '@react-native-firebase/firestore'

export function HistoricoStatus() {

  const navigation = useNavigation();
  const route = useRoute();
  const hist = route.params as SemanaProps;
  const [historico, setHistorico] = useState<Historico[]>([]);
  const [fornecedor, setFornecedor] = useState<FornecedorProps>();

  const handleGoBack = () => {
    navigation.goBack();
  };

  async function buscaFornecedor() {
    const forn = firestore().collection('fornecedor').doc(`${hist.id_fornecedor}`);
    const doc = await forn.get();
    if (!doc.exists) {
      console.log('Documento não encontrado!');
    } else {
      setFornecedor(doc.data() as FornecedorProps);
    }
  }

  async function buscaHistorico() {
    const subscribe = await firestore()
      .collection('historicoStatus')
      .where('id_HistóricoSemana', '==', hist.id_semana)
      .onSnapshot(querySnapshot => {
        const data = querySnapshot.docs.map(doc => {
          return {
            id: doc.id,
            ...doc.data()
          }
        }) as Historico[];

        data.sort((a, b) => {
          if (a.hora > b.hora) {
            return -1;
          }
          if (a.hora > b.hora) {
            return 1;
          }
          return 0;
        });

        setHistorico(data);
      });

    return () => subscribe();
  }



  useEffect(() => {
    buscaHistorico();
    buscaFornecedor();
  }, [])

  return (
    <NativeBaseProvider>
      <Background>
        <SafeAreaView style={[{ marginTop: '10%' }]}>

          <View style={[{ backgroundColor: '#7fdec7' }, {alignItems: 'center'}]} >
            <Text style={[{fontSize: 18}]}>HISTÓRICO</Text>
          </View>

          <View style={[{ justifyContent: 'center' }, { alignItems: 'center' }, { marginBottom: 40 }]}>
            <Text style={[{ fontSize: 20 }, {marginTop: 15}]} > Fornecedor {`${hist.id_fornecedor}`.padStart(2, '0')} : {fornecedor?.nome}</Text>
          </View>
          <FlatList
            data={historico}
            keyExtractor={item => item.id}

            renderItem={({ item }) => (
              <View style={[{ alignItems: 'center' }]}>
                <LinearGradient
                  colors={TEMA.COLORS.FOOTER}
                  style={styles.footer}>

                  <View style={[{ padding: 15 }]}>

                    <View style={[{ alignItems: 'flex-end' }, { marginBottom: 10 }]}>
                      <Text style={[{ fontSize: 16 }, styles.Detalhes]}>
                        {item.id_HistóricoSemana}
                      </Text>
                    </View>

                    <Text style={styles.Detalhes}>
                      Data: {item.data}
                    </Text>

                    <Text style={styles.Detalhes}>
                      Hora: {item.hora}
                    </Text>

                    <Text style={styles.Detalhes}>
                      Local: {item.local}
                    </Text>

                    <Text style={styles.Detalhes}>
                      Status caixa: {item.status}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentList}
          />
        </SafeAreaView>
      </Background>
    </NativeBaseProvider>
  );
}
