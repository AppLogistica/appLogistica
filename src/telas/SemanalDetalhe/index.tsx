
import { useNavigation, useRoute } from "@react-navigation/native";
import { Input, NativeBaseProvider } from "native-base";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from 'expo-location';

import { View, Text, Alert, ScrollView, Vibration } from 'react-native';
import { Background } from "../../componentes/Backgound";
import { Button } from "../../componentes/botao/Button";
import { CaixaProps, LocalCaixaProps, ProcessoProps, SemanalCard, SemanaProps } from "../../componentes/SemanalCard";
import { styles } from "./styles";
import firestore, { firebase } from '@react-native-firebase/firestore'
import { SelectList } from 'react-native-dropdown-select-list'
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { print } from "../../componentes/geraPDF";
import { AntDesign, Feather, FontAwesome } from '@expo/vector-icons';

import { LocationObject } from "expo-location";
import { EnviaNotify } from "../../componentes/fireNotify/envia";


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
  const quantidadeCaixa = dadosSemanal.QtdCaixa === undefined ? 1 : dadosSemanal.QtdCaixa;
  const [processo, setProcesso] = useState<ProcessoProps[]>([])
  const [Useetapa, setUseEtapa] = useState(-1)
  const [stapasSalvas, setEtapasSalvas] = useState([])

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
    { key: '2', value: 'CHEIA' },
    { key: '3', value: 'DESCARREGADO' }]

  const [selectNumeCaixa, setSelectNumeCaixa] = useState('');
  const [numCaixa, setNumCaixa] = useState<selectProps[]>([]);

  const [atualLocalCarga, setAtualLocalCarga] = useState(-1);
  const [atualCaixaStatus, setAtualCaixaStatus] = useState(-1);

  const desativarFinal = selecLocalCarga === 'FABRICA' && selectCaixaStatus === 'DESCARREGADO' && dadosSemanal.id_caixa ? false : true;

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

      firestore().collection('caixa').doc(`${dadosSemanal.id_caixa}`).update({
        Latitude: location.coords.latitude,
        Longitude: location.coords.longitude,
      })
    }
    else {
      Alert.alert('Primeiro vincule uma caixa!')
    }

    setIsLoading(false);
  }

  async function pegaDadosCaixas() {
    const tamanho = numCaixa.length

    for (let i = 0; i < tamanho; i++) {

      numCaixa.pop();
    }

    const caixas = firestore().collection('caixa');
    const snapshot = await caixas.where('livre', '==', true).get();
    if (snapshot.empty) {
      console.log('Documento não encontrado!');
      return;
    }

    snapshot.forEach(doc => {
      numCaixa.push({ key: doc.id, value: doc.id.padStart(2, '0') });
    });
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
        "Confirmação de finalização!", "Deseja realmente finalizar essa tarefa?",
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

  function Proxima(proxAnt: string): Promise<boolean> {

    return new Promise((resolve) => {
      Alert.alert(
        `${proxAnt} etapa`, "Confirmar?",
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

    liberaCaixa();

    firestore().collection('semana').doc(dadosSemanal.id).update({
      status: '',
      ativo: 'Finalizado'
    })

    handleGoBack();
  }

  async function salavaDados(soma: number) {

    //Verifica se alguma caixa foi selecionada. Isso é para garantir que o idCaixa nunca seja nulo
    let idCaixa = dadosSemanal.id_caixa === null ? -1 : dadosSemanal.id_caixa;
    if (selectNumeCaixa) {
      idCaixa = parseInt(selectNumeCaixa);
    }

    //Caso não haja id_caixa, seja ja salvo na collection semana, seja nas opções ele irá abortar o salvamento 
    if (idCaixa === -1) {
      Alert.alert('', 'selecione uma caixa!')
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

    let etapaPro;
    let proxAnt = 'Proxima';

    if (soma === -1) {
      proxAnt = "Voltar";
    }

    if (!selecLocalCarga && !selectCaixaStatus) {
      etapaPro = processo.find(item => item.id === '1')
      setUseEtapa(soma);
    } else {
    
      if (Useetapa < 0) {
        const pross = processo.find(item => item.nomeLocal === selecLocalCarga && item.nomeStatus === selectCaixaStatus)

        if (pross) {
          let prox = parseInt(pross.id) + soma;
          prox = prox < 1 ? 1 : prox;

         
          etapaPro = processo.find(item => item.id === `${prox}`);
          if (!await Proxima(proxAnt)) {
            return
          }
          setUseEtapa(prox);
        }

      } else {
        
        let proxEtapa = parseInt(`${Useetapa}`) + soma;
        proxEtapa = proxEtapa < 1 ? 1 : proxEtapa;
        
        etapaPro = processo.find(item => item.id === `${proxEtapa}`);

        if (!await Proxima(proxAnt)) {
          return
        }
        setUseEtapa(proxEtapa);
      }
    }

    const id_status = etapaPro?.id_status as number;
    const id_local = etapaPro?.id_local as number;

 
    if (id_status === 3) {
      if (!await confirmaFinal()) {
        setUseEtapa(-1);
        return
      }
    }

    setSelecLocalCarga(etapaPro?.nomeLocal as string);
    setSelectCaixaStatus(etapaPro?.nomeStatus as string);

    const statusEtapa = etapaPro?.nomeStatus as string;
    const localEtapa = etapaPro?.nomeLocal as string;

    const data = new Date()
    const hora = data.getHours();
    const minutos = data.getMinutes();
    const sec = data.getSeconds();
    const horaMinuto = `${hora}`.padStart(2, '0') + ':' + `${minutos}`.padStart(2, '0') + ':' + `${sec}`.padStart(2, '0')
    const id_historico = `${dadosSemanal.id}.` + `${idCaixa}`.padStart(2, '0')

    if (dadosSemanal.id_caixa != null) {
      //Isso garante que, caso o numero da caixa seja alterado, a caixa que estava vinculada seja "liberada"
      firestore().collection('caixa').doc(`${dadosSemanal.id_caixa}`).update({
        livre: true,
      })
    }

    //Faz o update da collection caixa, 
    firestore().collection('caixa').doc(`${idCaixa}`).update({
      id_status: id_status,
      id_local: id_local,
      livre: false,
      etapa: etapaPro?.id
    })

    //faz o update da collection semana
    firestore().collection('semana').doc(`${dadosSemanal.id}`).update({
      status: statusEtapa,
      id_caixa: idCaixa,
      id_semana: id_historico,
      ativo: 'Iniciado'
    })

    if (atualLocalCarga != id_local || atualCaixaStatus != id_status) {

      //adiciona ao histórico
      firestore().collection('historicoStatus').add({
        id_HistóricoSemana: id_historico,
        id_caixa: idCaixa,
        status: statusEtapa,
        local: localEtapa,
        data: dayjs().locale('pt-br').format('DD/MM/YYYY'),
        hora: horaMinuto
      })
    }

    if (id_local === 3 && id_status === 2) {
      // EnviaNotify(dadosSemanal)
    }

    if (id_status === 3) {
      Finalizar();
    }

    if (etapaPro?.id === '1') {
      handleGoBack();
    }
  }

  async function pegaDadosUmaCaixa() {

    const caixa = firestore().collection('caixa').doc(`${dadosSemanal.id_caixa}`);
    const doc = await caixa.get();
    if (!doc.exists) {
      console.log('Documento não encontrado!');
    } else {

      const { id_local, id_status, Latitude, Longitude, etapa } = doc.data() as CaixaProps;

      const staatus = id_status === 1 ? 'VAZIA' : (id_status === 2 ? 'CHEIA' : 'DESCARREGADO');
      const local = id_local === 1 ? 'FABRICA' : (id_local === 2 ? 'CAMINHÃO' : 'FORNECEDOR')

      if (Latitude) {
        setLatitude(Latitude);
      }

      if (Longitude) {
        setLongitude(Longitude);
      }

      if (etapa === undefined) {
        setUseEtapa(-1);
      } else {
        setUseEtapa(etapa);
      }

      setSelecLocalCarga(local);
      setAtualLocalCarga(id_local);
      setSelectCaixaStatus(staatus);
      setAtualCaixaStatus(id_status);

    }
  }

  function handleHistorico({ id_semana, ativo, data, id, id_caixa, id_fornecedor, inserido_em, status, QtdCaixa, cor }: SemanaProps) {
    navigation.navigate('historicoStatus', { id_semana, ativo, data, id, id_caixa, id_fornecedor, inserido_em, status, QtdCaixa, cor });
  }

  function addMaisCaixas() {
    //faz o update da collection semana
    dadosSemanal.QtdCaixa
    firestore().collection('semana').doc(`${dadosSemanal.id}`).update({
      QtdCaixa: quantidadeCaixa + 1
    })
  }

  function confirmaReinicio(): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        "Confirmação de Reinicio!", "Deseja realmente reiniciar essa tarefa?",
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

  async function reiniciaProcesso() {
    if (!await confirmaReinicio()) {

      return
    } else {

      const his = firestore().collection('historicoStatus');
      const snapshot = await his.where('id_HistóricoSemana', '==', dadosSemanal.id_semana).get();
      if (snapshot.empty) {
        console.log('Documento não encontrado!');
        return;
      }
      // return
      snapshot.forEach(doc => {
        firestore().collection('historicoStatus').doc(`${doc.id}`).delete()
      });

      liberaCaixa();
      firestore().collection('semana').doc(dadosSemanal.id).update({
        status: '',
        ativo: 'Inativos',
        id_caixa: null,
        id_semana: dadosSemanal.id
      })

      navigation.goBack();
    }
  }

  async function etapasProcesso() {

    const subscribe = await firestore()
      .collection('ordemProceso')
      .onSnapshot(querySnapshot => {
        const data = querySnapshot.docs.map(doc => {

          return {
            id: doc.id,
            ...doc.data()
          }
        }) as ProcessoProps[];

        setProcesso(data);

      });
    return () => subscribe();
  }

  useEffect(() => {
    pegaDadosCaixas();
    pegaDadosUmaCaixa();
    etapasProcesso();

  }, []);

  async function liberaCaixa() {
    firestore().collection('caixa').doc(`${dadosSemanal.id_caixa}`).update({
      Latitude: null,
      Longitude: null,
      livre: true,
      id_local: 1,
      id_status: 1,
      etapa: -1
    })
  }

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
                <View style={[{ marginVertical: 10 }]}>
                  <Text > LOCAL </Text>

                  <Input
                    style={[{ borderWidth: 1.8 }, { fontSize: 16 }, { borderColor: '#7fdec7' }]}
                    value={selecLocalCarga}
                    isDisabled={true} >
                  </Input>
                </View> : null}

              {dadosSemanal.ativo !== 'Finalizado' ?
                <View style={[styles.containerViewView]}>
                  <Text> STATUS DA CAIXA </Text>

                  <Input
                    style={[{ borderWidth: 1.8 }, { fontSize: 16 }, { borderColor: '#7fdec7' }]}
                    value={selectCaixaStatus}
                    isDisabled={true} >
                  </Input>
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
                      style={[{ borderWidth: 1.8 }, { fontSize: 12 }, { borderColor: '#7fdec7' }]}
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
                    title="Etapa anterior"
                    style={styles.buttonCancela}
                    onPress={() => salavaDados(-1)}
                  />

                  <Button
                    title="Proximo etapa"
                    style={styles.buttonConfirma}
                    onPress={() => salavaDados(+1)}
                  />

                </View> : null}

              <View style={[{ flexDirection: 'column' }, { justifyContent: 'space-between' }]} >

                <Button
                  title="Voltar"
                  style={[{ marginBottom: 20 }, styles.buttonPdf, dadosSemanal.ativo === 'Finalizado' ? { marginTop: 20 } : null]}
                  onPress={() => handleGoBack()}
                />

                <Button
                  title="Gerar Recibo"
                  style={[{ marginBottom: 20 }, styles.buttonPdf]}
                  onPress={() => print(dadosSemanal)}
                  leftIcon={<AntDesign name="pdffile1" size={30} color="black" />}
                />

                <View style={[{}]}>

                  <Button
                    title="Reiniciar"
                    style={[{ marginBottom: 20 }, styles.buttonPdf]}
                    leftIcon={<Feather name="alert-triangle" size={24} color="red" />}
                    onPress={reiniciaProcesso}
                  />

                </View>
              </View>
            </View>

          </ScrollView>
        </SafeAreaView>
      </Background>
    </NativeBaseProvider>
  );
}

/*                  <SelectList
                    search={false}
                    placeholder={selecLocalCarga === '' ? 'Selecione o local' : selecLocalCarga}
                    // @ts-ignore
                    setSelected={(val) => setSelecLocalCarga(val)}
                    boxStyles={{ borderColor: '#7fdec7', borderWidth: 1.8 }}
                    data={localCarga}
                    save="value"
                  />*/

/*                  <SelectList
                    
                    search={false}
                    boxStyles={{ borderColor: '#7fdec7', borderWidth: 1.8 }}
                    placeholder={selectCaixaStatus === '' ? 'Selecione o status' : selectCaixaStatus}
                    // @ts-ignore
                    setSelected={(val) => setSelectCaixaStatus(val)}
                    data={CaixaStatus}
                    save="value"
                  />*/

/*                  <Button
                    title="Cancelar"
                    style={[{ marginBottom: 20 }, styles.buttonPdf]}
                    
                    leftIcon={<FontAwesome name="hand-stop-o" size={24} color="red" />}
                  />*/