
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
import { supabase } from "../../componentes/Supabase/database";

export function HistoricoStatus() {

  const navigation = useNavigation();
  const route = useRoute();
  const hist = route.params as SemanaProps;
  const [historico, setHistorico] = useState<Historico[]>([]);
  const [fornecedor, setFornecedor] = useState<FornecedorProps[]>([]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  async function buscaFornecedor() {

    let { data: fornecHis, error: fornecHisErr } = await supabase.from('fornecedor').select('*').eq('id_fornecedor', hist.id_fornecedor)

    if (fornecHisErr) {
      console.log(fornecHisErr);
    } else{
      setFornecedor(fornecHis as FornecedorProps[])
    }

  }

  async function buscaHistorico() {

    let { data: histo, error: histoErr } = await supabase.from('historicoStatus').select('*').eq('id_HistóricoSemana', hist.id).order('hora', { ascending: false });

    if (histoErr) {
      console.log('histoErr',histoErr);
      return
    }

    setHistorico(histo as Historico[]);
  }

  useEffect(() => {
    buscaHistorico();
    buscaFornecedor();
  }, [])

  return (
    <NativeBaseProvider>
      <Background>
        <SafeAreaView style={[{ marginTop: '10%' }]}>

          <View style={[{ backgroundColor: '#7fdec7' }, { alignItems: 'center' }]} >
            <Text style={[{ fontSize: 18 }]}>HISTÓRICO</Text>
          </View>

          <View style={[{ justifyContent: 'center' }, { alignItems: 'center' }, { marginBottom: 40 }]}>
            <Text style={[{ fontSize: 20 }, { marginTop: 15 }]} > Fornecedor {`${hist.id_fornecedor}`.padStart(2, '0')} : {fornecedor[0]?.nome}</Text>
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
