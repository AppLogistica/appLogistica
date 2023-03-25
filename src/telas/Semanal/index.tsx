
import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, FlatList, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeBaseProvider } from "native-base";
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import database from '@react-native-firebase/database';
import firestore from '@react-native-firebase/firestore';

import { styles } from "./styles";
import { Background } from "../../componentes/Backgound";
import { CaixaProps, EnderecoProps, FornecedorProps, LocalCaixaProps, SemanalCard, SemanaProps, StatusProps } from "../../componentes/SemanalCard";
import { NotificacaoListener, PermissaoUsuario } from "../../componentes/Notificacao/notifica";
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

import { supabase } from "../../componentes/Supabase/database";
import { Sincroniza } from "../../componentes/DatabaseSQLite/SincronizaDados";
import endereco from "../../componentes/DatabaseSQLite/enderecoSql/endereco";
import fornecedor from "../../componentes/DatabaseSQLite/fornecedorSql/fornecedor";
import semana from "../../componentes/DatabaseSQLite/semanaSql/semana";
import NetInfo from "@react-native-community/netinfo";
import Status from "../../componentes/DatabaseSQLite/StatusSQl/Status";
import local from "../../componentes/DatabaseSQLite/localSql/local";
import caixa from "../../componentes/DatabaseSQLite/caixaSql/caixa";
//import { Sincroniza } from "../../componentes/DatabaseSQLite/SincronizaDados";
//import { carregaSQLite } from "../../componentes/DatabaseSQLite/CriaTabelas";

interface menssagem {
  collapseKey: string;
  data: {};
  from: string;
  messageId: string;
  notification: {
    android: {};
    body: string;
    title: string;
  },
  sentTime: string;
  ttl: number;
}

database().setPersistenceEnabled(true);

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

export function Semanal() {

  const [date, setDate] = useState(dayjs().locale('pt-br'));
  const [dadosSemana, setDadosSemana] = useState<SemanaProps[]>([]);
  // const [dadosCaixa, setDadosCaixa] = useState<CaixaProps>();
  const [filtro, setFiltro] = useState('Todos');
  const [meuToken, setMeuToken] = useState('');
  const [conectado, setConectado] = useState<boolean | null>(null);
  const navigation = useNavigation();

  function handleDetalhes({ id_semana, data_, id_fornecedor, id_caixa, inserido_em, id, status, ativo }: SemanaProps) {

    navigation.navigate('semanalDetalhes', { id_semana, data_, id_fornecedor, id_caixa, inserido_em, id, status, ativo });

  }

  const proximo = () => {
    setDate(date.add(1, 'day'));
  };

  const anterior = () => {
    setDate(date.subtract(1, 'day'));
  };

  const dadosFiltrados = dadosSemana ? dadosSemana.filter(item => {
    return item.ativo === filtro
  }) : null;

  // @ts-ignore
  const handleMessagingToken = async token => {
    // console.log('handleMessagingToken', token);
    setMeuToken(token);
    await firestore().collection('tokens').doc(token).set({
      asToken: token
    })
  }
  // @ts-ignore
  const handleMessageReceived = messsage => {
    createAndroidNotificationChannels(messsage);
    console.log('handleMessageReceived', messsage);

  }
  // @ts-ignore
  const handleNotificationOpenApp = message => {
    console.log('handleNotificationOpenApp', message);

  }

  const handleInitialNotification = async () => {
    const notification = await messaging().getInitialNotification();
    console.log(handleInitialNotification, notification);

  }

  async function createAndroidNotificationChannels(message: menssagem) {
    await notifee.requestPermission();

    const channelId = await notifee.createChannel({
      id: 'NoficicaStatus',
      name: 'Miscellaneous',
      vibration: true,
      importance: AndroidImportance.HIGH
    });

    try {
      await notifee.displayNotification({
        id: message.messageId,
        title: message.notification.title,
        body: message.notification.body,
        data: message.data,

        android: {
          channelId
        }
      })
    } catch (error) {
    }
  }

  async function attSemana() {

    let { data, error } = await supabase
      .from('semana')
      .select('*')
      .eq('data_', date.format('YYYY-MM-DD'));

    if (error) {
      console.log(error);
      return
    }

    // setDadosSemana([]);
    const resSemana = data as SemanaProps[];
    setDadosSemana(data as SemanaProps[]);

    if (resSemana && resSemana.length > 0) {
      SincronizaSemana(resSemana);
    }

  }

  supabase.channel('custom-all-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'semana' },
      (payload) => {
        console.log('Change received!', payload)

        attSemana();

        return (
          renderListSemana()
        )
      }
    )
    .subscribe();

  async function SincronizaEndereco() {

    let { data: Endereco, error: EnderecoErr } = await supabase.from('endereco').select('*');

    if (EnderecoErr) {
      console.log(EnderecoErr);
      return;
    }

    const resEndereco = Endereco as EnderecoProps[];

    resEndereco.map(async item => {
      if (await endereco.encontrar(item.id_endereco).catch(err => console.log('endereco', err))) {
        endereco.update(item.id_endereco, item).catch(err => console.log('endereco', err)) //mandar par auma tabela de erro?
      } else {
        endereco.inserir(item).catch(err => console.log('endereco', err)) //mandar par auma tabela de erro?
      }
    });
  }

  async function SincronizaFornecedor() {

    let { data: Fornecedor, error: FornecedorErr } = await supabase.from('fornecedor').select('*');

    if (FornecedorErr) {
      console.log(FornecedorErr);
      return;
    }

    const resFornecedor = Fornecedor as FornecedorProps[];

    resFornecedor.map(async item => {
      if (await fornecedor.encontrar(item.id_fornecedor).catch(err => console.log('fornecedor', err))) {
        fornecedor.update(item.id_fornecedor, item).catch(err => console.log('fornecedor', err)) //mandar par auma tabela de erro?
      } else {
        fornecedor.inserir(item).catch(err => console.log('fornecedor', err)) //mandar par auma tabela de erro?;
      }
    })
  }

  async function SincronizaSemana(resSemana: SemanaProps[]) {
    // let { data: Semana, error: SemanaErr } = await supabase.from('semana').select('*')

    resSemana.map(async item => {
      if (await semana.encontrar(item.id_semana).catch(err => console.log('semana', err))) {

        semana.update(item.id_semana, item).catch(err => console.log('semana', err)); //mandar par auma tabela de erro?
      } else {

        semana.inserir(item).catch(err => console.log('semana', err)); //mandar par auma tabela de erro?;
      }
    })
    console.log((await semana.todos()).length);
  }

  async function SincronizaStatus() {
    let { data: status, error: statusErr } = await supabase.from('status').select('*');

    if (statusErr) {
      console.log(statusErr);
      return;
    }

    const resStatus = status as StatusProps[];

    resStatus.map(async item => {

      if (await Status.encontrar(item.id_status).catch(err => console.log('status', err))) {
        Status.update(item.id_status, item).catch(err => console.log('status', err))
      } else {
        console.log('insert', item.id_status);
        Status.insert(item).catch(err => console.log('status', err));
      }
    })
  }

  async function SincronizaLocal() {
    let { data: localsup, error: localsupErr } = await supabase.from('local').select('*');

    if (localsupErr) {
      console.log(localsupErr);
      return;
    }

    const resLocal = localsup as LocalCaixaProps[];

    resLocal.map(async item => {
      if (await local.encontrar(item.id_local).catch(err => console.log('local', err))) {
        local.update(item.id_local, item).catch(err => console.log('local', err))
      } else {
        local.inserir(item).catch(err => console.log('local', err));
      }
    })
  }

  async function SincronizaCaixas() {
    let { data: caixas, error: caixasErr } = await supabase.from('caixa').select('*');

    if (caixasErr) {
      console.log(caixasErr);
      return;
    }

    const resCaixas = caixas as CaixaProps[];

    resCaixas.map(async item => {
      if (await caixa.encontrar(item.id_caixa).catch(err => console.log(err))) {
        caixa.update(item.id_caixa, item).catch(err => console.log(err))
      } else {
        caixa.inserir(item).catch(err => console.log(err))
      }
    })
  }

  async function SincrnizaInit() {
    const { isConnected } = await NetInfo.fetch();

    if (isConnected) {

      SincronizaEndereco();
      SincronizaFornecedor();
      SincronizaStatus();
      SincronizaLocal();
      SincronizaCaixas();

      attSemana();
    } else {

      semana.pegaByData(date.format('YYYY-MM-DD'))
        .then(item => {

          setDadosSemana(item);

        })
        .catch(err => {
          console.log('pegaByData', err);
        })
    }
  }

  useEffect(() => {

    handleInitialNotification();

    SincrnizaInit();
    //semana.dropa();
    // endereco.dropa();
    //fornecedor.dropa();
    //local.dropa();
    //Status.dropa();
    //caixa.dropa();

    messaging().registerDeviceForRemoteMessages

    messaging().getToken().then(handleMessagingToken);
    const removeTokenRefresh = messaging().onTokenRefresh(handleMessagingToken);
    const removeOnMessage = messaging().onMessage(handleMessageReceived)
    const removeOnNotificationOpenApp = messaging().onNotificationOpenedApp(handleNotificationOpenApp,)

    return () => {
      removeTokenRefresh();
      removeOnMessage();
      removeOnNotificationOpenApp();
    }

  }, [date]);


  const diaDaSemana = date.format('dddd');

  const renderListSemana = () => {
    return (
      <FlatList
        data={filtro != 'Todos' ? dadosFiltrados : dadosSemana}
        keyExtractor={item => JSON.stringify(item.id_semana)}
        style={[{ marginBottom: 80 }]}

        renderItem={({ item }) => (
          <SemanalCard
            SemanaDados={item}
            margem={50}
            onPress={() => handleDetalhes(item)}
          />)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentList}
      />
    );
  };

  return (
    <NativeBaseProvider>
      <Background>
        <SafeAreaView>
          <View style={styles.container}>
            <TouchableOpacity style={[{ width: 25 }, { alignItems: 'center' }]} onPress={anterior}>
              <Text style={styles.Seta}>&lt;</Text>
            </TouchableOpacity>
            <Text style={styles.Data}>{date.format('DD/MM/YYYY')}</Text>
            <TouchableOpacity style={[{ width: 25 }, { alignItems: 'center' }]} onPress={proximo}>
              <Text style={styles.Data}>&gt;</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.DiaSemana}>
            <Text style={styles.TextDiaSemana}>{diaDaSemana}</Text>
          </View>

          <View style={[{ flexDirection: 'row' }, { justifyContent: 'space-around' }, { width: '95%' }, { marginLeft: '2.5%' }, { marginBottom: 10 }]}>

            <TouchableOpacity
              onPressIn={() => setFiltro('Todos')}
              style={[
                { borderColor: filtro === 'Todos' ? '#E1F7FF' : '#7fdec7' },
                { backgroundColor: filtro === 'Todos' ? '#7fdec7' : '#E1F7FF' },
                { borderWidth: 1.5 },
                { marginTop: 10 },
                { width: '25%' },
                { alignItems: 'center' },
                { height: 30 },
                { justifyContent: 'center' }]}><Text>Todos</Text></TouchableOpacity>

            <TouchableOpacity
              onPressIn={() => setFiltro('Inativos')}
              style={[
                { borderColor: filtro === 'Inativos' ? '#E1F7FF' : '#7fdec7' },
                { backgroundColor: filtro === 'Inativos' ? '#7fdec7' : '#E1F7FF' },
                { borderWidth: 1.5 },
                { marginTop: 10 },
                { width: '25%' },
                { alignItems: 'center' },
                { height: 30 },
                { justifyContent: 'center' }]}><Text>Inativos</Text></TouchableOpacity>

            <TouchableOpacity
              onPressIn={() => setFiltro('Iniciado')}
              style={[
                { borderColor: filtro === 'Iniciado' ? '#E1F7FF' : '#7fdec7' },
                { backgroundColor: filtro === 'Iniciado' ? '#7fdec7' : '#E1F7FF' },
                { borderWidth: 1.5 },
                { marginTop: 10 },
                { width: '25%' },
                { alignItems: 'center' },
                { height: 30 },
                { justifyContent: 'center' }]}><Text>Iniciado</Text></TouchableOpacity>

            <TouchableOpacity
              onPressIn={() => setFiltro('Finalizado')}
              style={[
                { borderColor: filtro === 'Finalizado' ? '#E1F7FF' : '#7fdec7' },
                { backgroundColor: filtro === 'Finalizado' ? '#7fdec7' : '#E1F7FF' },
                { borderWidth: 1.5 },
                { marginTop: 10 },
                { alignItems: 'center' },
                { height: 30 },
                { justifyContent: 'center' },
                { width: '25%' },

              ]}><Text>Finalizado</Text></TouchableOpacity>
          </View>

          {renderListSemana()}

        </SafeAreaView>
      </Background>
    </NativeBaseProvider>
  );
}
