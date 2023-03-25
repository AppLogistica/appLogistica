
import { useNavigation, useRoute } from "@react-navigation/native";
import { Input, NativeBaseProvider } from "native-base";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from 'expo-location';

import { View, Text, Alert, ScrollView, Vibration } from 'react-native';
import { Background } from "../../componentes/Backgound";
import { Button } from "../../componentes/botao/Button";
import { CaixaProps, LocalCaixaProps, SemanalCard, SemanaProps } from "../../componentes/SemanalCard";
import { styles } from "./styles";
import firestore, { firebase } from '@react-native-firebase/firestore'
import { SelectList } from 'react-native-dropdown-select-list'
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { print } from "../../componentes/geraPDF";
//import notifee, { AndroidImportance } from '@notifee/react-native';
//import { sendFCMMessage } from "../../componentes/Notificacao/Envio";
import { AntDesign } from '@expo/vector-icons';

//import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
//import { Rotas } from "../../rotas";
import { LocationObject } from "expo-location";
//import { EnviaNotify } from "../../componentes/fireNotify/envia";
import { supabase } from "../../componentes/Supabase/database";
import { EnviaNotify } from "../../componentes/fireNotify/envia";
import caixa from "../../componentes/DatabaseSQLite/caixaSql/caixa";
import semana from "../../componentes/DatabaseSQLite/semanaSql/semana";


type selectProps = {
  key: any;
  value: any;
};

export function SemanalDetalhe() {

  const route = useRoute();
  const navigation = useNavigation();
  const dadosSemanal = route.params as SemanaProps;

  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<LocationObject | null>();
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const dadosLocal: LocalCaixaProps[] = [];
  const [errorMsg, setErrorMsg] = useState({});

  const [selecLocalCarga, setSelecLocalCarga] = useState('');
  const localCarga: selectProps[] =
    [{ key: '1', value: 'CAMINHÃO' },
    { key: '2', value: 'FORNECEDOR' },
    { key: '3', value: 'FABRICA' }]

  const [selectCaixaStatus, setSelectCaixaStatus] = useState('');
  const CaixaStatus: selectProps[] =
    [{ key: '1', value: 'VAZIA' },
    { key: '2', value: 'CHEIA' }]

  const [selectNumeCaixa, setSelectNumeCaixa] = useState('');
  const [numCaixa, setNumCaixa] = useState<selectProps[]>([]);

  const [atualLocalCarga, setAtualLocalCarga] = useState(-1);
  const [atualCaixaStatus, setAtualCaixaStatus] = useState(-1);

  const desativarFinal = selecLocalCarga === 'FABRICA' && selectCaixaStatus === 'VAZIA' && dadosSemanal.id_caixa ? false : true;

  const handleGoBack = () => {
    navigation.goBack();
  };

  async function SalvaLocal() {

    setIsLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permisão para acesso a localização foi negada!');
      setIsLoading(false);
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);

    let text = 'Espera..';
    if (errorMsg) {
      text = JSON.stringify(errorMsg);
    } else if (location) {
      text = JSON.stringify(location);
    }

    if (dadosSemanal.id_caixa) {

      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);

      const { data: upLocalCaixa, error: localCaixaErr } = await supabase.from('caixa').update({
        Latitude: location.coords.latitude,
        Longitude: location.coords.longitude,
      }).eq('id_caixa', dadosSemanal.id_caixa)

      if (localCaixaErr) {

        const { message } = localCaixaErr;

        if (message === "FetchError: Network request failed") {
          caixa.updateLocalizacao(dadosSemanal.id_caixa, location);
          console.log(caixa.encontrar(dadosSemanal.id_caixa));

        } else {
          console.log('localCaixaErr', localCaixaErr);
          return
        }
      }
    }
    else {
      Alert.alert('Primeiro vincule uma caixa!')
    }

    setIsLoading(false);
  }

  async function pegaDadosCaixas() {

    let { data: Dadoscaixa, error }
      = await supabase.from('caixa')
        .select('*')
        .eq('livre', true)
        .order('id_caixa');

    const tamanho = numCaixa.length

    for (let i = 0; i < tamanho; i++) {
      numCaixa.pop();
    }

    if (error) {

      const { message } = error;

      if (message === "FetchError: Network request failed") {
        caixa.livre(true).then(item => {
          console.log('item', item);

          item?.forEach(doc => {
            numCaixa.push({ key: doc.id_caixa, value: doc.nome });
          })

        }).catch(err => console.log(err))
      } else {
        console.log('data: Dadoscaixa', error);
        return
      }
    }

    if (Dadoscaixa && Dadoscaixa.length > 0) {
      Dadoscaixa?.forEach(doc => {
        numCaixa.push({ key: doc.id_caixa, value: doc.nome });
      })
    }
  }

  function confirmaAlteraçãoCaixa(idCaixa: number): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        "Confirmação de alteração!", "Deseja realmente alterar a caixa? \n \n \n Atual: " + `${dadosSemanal.id_caixa}`.padStart(2, '0') + "                                       Nova: " + `${idCaixa}`.padStart(2, '0'),
        [{
          text: 'Cancelar',
          onPress: () => resolve(false),
          style: 'cancel',
        },
        { text: 'OK', onPress: () => resolve(true) },],
        { cancelable: false }
      );
    });
  }

  function confirmaFinal(): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        "Confirmação de finalização!", "Deseja realmente finalizar essa tarefa? \n \n \n"
      + "Local: FABRICA \n \nStatus: VAZIA ",
        [{
          text: 'Cancelar',
          onPress: () => resolve(false),
          style: 'cancel',
        },
        { text: 'OK', onPress: () => resolve(true) },],
        { cancelable: false }
      );
    });
  }

  async function Finalizar() {

    const { data: finalCaixa, error: finalCaixaErr } = await supabase.from('caixa').update({
      Latitude: null,
      Longitude: null,
      livre: true
    }).eq('id_caixa', dadosSemanal.id_caixa);

    if (finalCaixaErr) {
      console.log('finalCaixaErr', finalCaixaErr);
    }

    const { data: finalSemana, error: finalSemanaErr } = await supabase.from('semana').update({
      status: null,
      ativo: 'Finalizado'
    }).eq('id_semana', dadosSemanal.id_semana)

    if (finalSemanaErr) {
      console.log('finalSemanaErr', finalSemanaErr);
    }
  }

  async function salavaDados() {

    if (!desativarFinal) {
      if (!await confirmaFinal()) {

        return
      }
    }

    //Verifica se alguma caixa foi selecionada. Isso é para garantir que o idCaixa nunca seja nulo
    let idCaixa = dadosSemanal.id_caixa === null ? -1 : dadosSemanal.id_caixa;
    if (selectNumeCaixa) {
      idCaixa = parseInt(selectNumeCaixa);
    }

    //Caso não haja id_caixa, seja ja salvo na collection semana, seja nas opções ele irá abortar o salvamento 
    if (idCaixa === -1) {

      return
    }

    //Caso seja alterado o numero da caixa correspondente, seja por erro ou qualquer outro motivo, uma menssagem será mostrada ao usuário confirmando a alteração
    if (dadosSemanal.id_caixa != idCaixa && dadosSemanal.id_caixa != null) {

      const confirmado = await confirmaAlteraçãoCaixa(idCaixa);
      //Caso seja negada a alteração, o salvamento dos dados será abortado
      if (!confirmado) {
        return
      }
    }

    if (!selecLocalCarga) {
      return Alert.alert('Escolha o local!');
    }

    if (!selectCaixaStatus) {
      return Alert.alert('Escolha o status!');
    }

    const id_status = selectCaixaStatus === 'VAZIA' ? 1 : 2;
    const id_local = selecLocalCarga === 'FABRICA' ? 1 : (selecLocalCarga === 'CAMINHÃO' ? 2 : 3);

    const data = new Date()
    const hora = data.getHours();
    const minutos = data.getMinutes();
    const segundos = data.getSeconds();
    const horaMinuto = `${hora}`.padStart(2, '0') + ':' + `${minutos}`.padStart(2, '0') + ':' + `${segundos}`.padStart(2, '0')
    const id_historico = `${dadosSemanal.id_semana}.` + `${idCaixa}`.padStart(2, '0')

    if (dadosSemanal.id_caixa != null) {
      //Isso garante que, caso o numero da caixa seja alterado, a caixa que estava vinculada seja "liberada"
      const { data: updateCaixa, error: livreErr } = await supabase.from('caixa').update({ livre: true }).eq('id_caixa', dadosSemanal.id_caixa)

      if (livreErr) {

        const { message } = livreErr;

        if (message === "FetchError: Network request failed") {
          caixa.updateLivre(dadosSemanal.id_caixa).catch(err => console.log(err))
        } else {
          console.log('caixaLivre', livreErr);
          return
        }
      }
    }

    //Faz o update da collection caixa, 
    const { data: updateCaixa, error: upCaixaErr } = await supabase.from('caixa').update({
      id_status: id_status,
      id_local: id_local,
      livre: false
    }).eq('id_caixa', idCaixa);

    if (upCaixaErr) {

      const { message } = upCaixaErr;

      if (message === "FetchError: Network request failed") {
        caixa.update(idCaixa, id_status, id_local, false)
      } else {
        console.log('upCaixaErr', upCaixaErr);
        return
      }
    }

    const { data: UpSemana, error: semanaErr } = await supabase.from('semana').update({
      status: selectCaixaStatus,
      id_caixa: idCaixa,
      id: id_historico,
      ativo: 'Iniciado'
    }).eq('id_semana', dadosSemanal.id_semana);

    if (semanaErr) {

      const { message } = semanaErr;

      if (message === "FetchError: Network request failed") {
        semana.update(dadosSemanal.id_semana, selectCaixaStatus, idCaixa, id_historico, 'Iniciado').catch(err => console.log(err))
      } else {
        console.log('semanaErr', semanaErr);
        return
      }
    }

    if (atualLocalCarga != id_local || atualCaixaStatus != id_status) {

      //adiciona ao histórico
      const { data: inHistorico, error: historicoErr } = await supabase.from('historicoStatus').insert({
        id_HistóricoSemana: id_historico,
        id_caixa: idCaixa,
        status: selectCaixaStatus,
        local: selecLocalCarga,
        data: dayjs().locale('pt-br').format('DD/MM/YYYY'),
        hora: horaMinuto
      })

      if (historicoErr) {

        const { message } = historicoErr;
        console.log('historicoErr', historicoErr);
      }
    }

    if (id_status === 2 && id_local === 3) {

      //const { data: TemCaixa, error: TemCaixaErr} = await supabase.from('caixa').select('*').

      // const caixa = firestore().collection('caixa').doc(`${id_status}`)

      // const doc = await caixa.get();

      //if (doc.exists) {
      EnviaNotify(dadosSemanal);
      // }
    }

    if (!desativarFinal) {
      Finalizar();
    }

    handleGoBack();
  }

  async function pegaDadosUmaCaixa() {

    let { data: caixaSup, error } = await supabase.from('caixa').select('id_local, id_status, Latitude, Longitude').eq('id_caixa', dadosSemanal.id_caixa)

    if (error) {
      const { message } = error;

      if (message === "FetchError: Network request failed") {
        caixa.encontrar(dadosSemanal.id_caixa)
          .then(item => {
            const staatus = item.id_status === 1 ? 'VAZIA' : 'CHEIA';
            const local = item.id_local === 1 ? 'FABRICA' : (item.id_local === 2 ? 'CAMINHÃO' : 'FORNECEDOR')

            if (item.Latitude) {
              setLatitude(item.Latitude);
            }

            if (item.Longitude) {
              setLongitude(item.Longitude);
            }

            setSelecLocalCarga(local);
            setAtualLocalCarga(item.id_local);
            setSelectCaixaStatus(staatus);
            setAtualCaixaStatus(item.id_status);
          })
      }
    }

    if (caixaSup && caixaSup.length > 0) {

      const staatus = caixaSup[0].id_status === 1 ? 'VAZIA' : 'CHEIA';
      const local = caixaSup[0].id_local === 1 ? 'FABRICA' : (caixaSup[0].id_local === 2 ? 'CAMINHÃO' : 'FORNECEDOR')

      if (caixaSup[0].Latitude) {
        setLatitude(caixaSup[0].Latitude);
      }

      if (caixaSup[0].Longitude) {
        setLongitude(caixaSup[0].Longitude);
      }

      setSelecLocalCarga(local);
      setAtualLocalCarga(caixaSup[0].id_local);
      setSelectCaixaStatus(staatus);
      setAtualCaixaStatus(caixaSup[0].id_status);
    }
  }

  function handleHistorico({ id_semana, ativo, data_, id, id_caixa, id_fornecedor, inserido_em, status }: SemanaProps) {
    navigation.navigate('historicoStatus', { id_semana, ativo, data_, id, id_caixa, id_fornecedor, inserido_em, status });
  }

  useEffect(() => {
    pegaDadosCaixas();
    pegaDadosUmaCaixa();

  }, []);

  return (
    <NativeBaseProvider>
      <Background>
        <SafeAreaView >
          <ScrollView>
            <SemanalCard
              SemanaDados={dadosSemanal}
              margem={50}
              onPress={() => handleHistorico(dadosSemanal)}
            />

            <View style={[{ width: '80%' }, { marginHorizontal: '10%' }]}>

              {dadosSemanal.ativo !== 'Finalizado' ?
                <View style={[styles.containerViewView]}>
                  <Text > LOCAL </Text>

                  <SelectList
                    search={false}
                    placeholder={selecLocalCarga === '' ? 'Selecione o local' : selecLocalCarga}
                    // @ts-ignore
                    setSelected={(val) => setSelecLocalCarga(val)}
                    boxStyles={{ borderColor: '#7fdec7', borderWidth: 1.8 }}
                    data={localCarga}
                    save="value"
                  />
                </View> : null}

              {dadosSemanal.ativo !== 'Finalizado' ?
                <View style={[styles.containerViewView]}>
                  <Text> STATUS DA CAIXA </Text>
                  <SelectList
                    search={false}
                    boxStyles={{ borderColor: '#7fdec7', borderWidth: 1.8 }}
                    placeholder={selectCaixaStatus === '' ? 'Selecione o status' : selectCaixaStatus}
                    // @ts-ignore
                    setSelected={(val) => setSelectCaixaStatus(val)}
                    data={CaixaStatus}
                    save="value"
                  />
                </View> : null}

              {dadosSemanal.ativo !== 'Finalizado' ?
                <View style={[styles.containerViewView]}>
                  <Text> Nº CAIXA</Text>
                  <SelectList
                    search={false}
                    boxStyles={{ borderColor: '#7fdec7', borderWidth: 1.8 }}
                    notFoundText={'Nenhuma caixa disponível'}
                    placeholder={dadosSemanal.id_caixa === null ? 'Selecione a caixa' : `${dadosSemanal.id_caixa}`.padStart(2, '0')}
                    // @ts-ignore
                    setSelected={(val) => setSelectNumeCaixa(val)}
                    data={numCaixa}
                    save="value"
                  />
                </View> : null}

              {dadosSemanal.ativo !== 'Finalizado' ?
                <View style={[{ flexDirection: 'row' }, { justifyContent: 'space-between' }, { marginTop: 10 }]} >

                  <View style={[{ width: '50%' }]} >
                    <Input
                      style={[{ borderRadius: 8 }, { borderWidth: 1.8 }, { fontSize: 12 }, { borderColor: '#7fdec7' }]}
                      value={latitude != null ? `${latitude} , ${longitude}` : ''}
                      isDisabled={true} >
                    </Input>
                  </View>

                  <Button
                    title="Add localização"
                    style={styles.buttonLocal}
                    onPress={SalvaLocal}
                    isLoading={isLoading}

                  ></Button>
                </View> : null}

              {dadosSemanal.ativo !== 'Finalizado' ?
                <View style={styles.container}>
                  <Button
                    title="Confirma"
                    style={styles.buttonConfirma}
                    onPress={salavaDados}
                  />
                  <Button
                    title="Cancelar"
                    style={styles.buttonCancela}
                    onPress={handleGoBack}
                  />
                </View> : null}


              <View style={[{ flexDirection: 'row' }, { justifyContent: 'space-between' }]} >

                <Button
                  title="Gerar Recibo"
                  style={[{ marginBottom: 20 }, styles.buttonPdf, dadosSemanal.ativo === 'Finalizado' ? { marginTop: 20 } : null]}
                  onPress={() => print(dadosSemanal)}
                  leftIcon={<AntDesign name="pdffile1" size={30} color="black" />}
                />

              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Background>
    </NativeBaseProvider>
  );
}

