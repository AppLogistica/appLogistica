
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
import { CaixaProps, SemanalCard, SemanaProps } from "../../componentes/SemanalCard";
import { NotificacaoListener, PermissaoUsuario } from "../../componentes/Notificacao/notifica";
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

//import { supabase } from "../../componentes/Supabase/database";
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
database().setPersistenceCacheSizeBytes(100000000); // 100MB

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

export function Semanal() {

  const [date, setDate] = useState(dayjs().locale('pt-br'));
  const [dadosSemana, setDadosSemana] = useState<SemanaProps[]>([]);
  const [dadosCaixa, setDadosCaixa] = useState<CaixaProps>();
  const [filtro, setFiltro] = useState('Todos');
  const [meuToken, setMeuToken] = useState('');
  const navigation = useNavigation();


  function handleDetalhes({ id_semana, data, id_fornecedor, id_caixa, inserido_em, id, status, ativo }: SemanaProps) {

    navigation.navigate('semanalDetalhes', { id_semana, data, id_fornecedor, id_caixa, inserido_em, id, status, ativo });

  }

  const proximo = () => {
    setDate(date.add(1, 'day'));
  };

  const anterior = () => {
    setDate(date.subtract(1, 'day'));
  };

  const dadosFiltrados = dadosSemana.filter(item => {
    return item.ativo === filtro
  })

  async function pegaDadosSemana() {

    const subscribe = await firestore()
      .collection('semana')
      .where('data', '==', date.format('DD/MM/YYYY'))
      // .where('ativo', '==', filtro)
      .onSnapshot(querySnapshot => {
        const data = querySnapshot.docs.map(doc => {

          return {
            id: doc.id,
            ...doc.data()
          }
        }) as SemanaProps[];

        setDadosSemana(data);

      });
    return () => subscribe();

    console.log(dadosSemana);
    
  }

  const handleMessagingToken = async token => {
    console.log('handleMessagingToken', token);
    setMeuToken(token);
    await firestore().collection('tokens').doc(token).set({
      asToken: token
    })
  }

  const handleMessageReceived = messsage => {
    createAndroidNotificationChannels(messsage);
    console.log('handleMessageReceived', messsage);

  }

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

  async function aaaa() {
    const message = {


      message: {
        topic: "subscriber-updates",
        notification: {
          body: "This week's edition is now available.",
          title: "NewsMagazine.com",
        },
        data: {
          volume: "3.21.15",
          contents: "http://www.news-magazine.com/world-week/21659772"
        },
        android: {
          priority: "normal"
        },
        webpush: {
          headers: {
            Urgency: "high"
          }
        }
      }


    };

    console.log(message);

  }

  useEffect(() => {

    handleInitialNotification();
    pegaDadosSemana();
    messaging().registerDeviceForRemoteMessages
    console.log('registrado?', messaging().isDeviceRegisteredForRemoteMessages);

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
        </SafeAreaView>
      </Background>
    </NativeBaseProvider>
  );
}