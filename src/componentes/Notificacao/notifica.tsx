import messaging from '@react-native-firebase/messaging';
import AsyncStorege from '@react-native-async-storage/async-storage'
import { Alert } from 'react-native';

export async function PermissaoUsuario() {
  const authStatus = await messaging().requestPermission();
  const habilitado =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (habilitado) {
    console.log("autorizado? ", authStatus);
    getFCMToke();
  }

  async function getFCMToke() {

    let token = await AsyncStorege.getItem('Lyubov@1992!');
    console.log(token);

    try {
      const token = await messaging().getToken();

      if (token) {
        console.log(token);
        await AsyncStorege.setItem('Lyubov@1992!', token)

      }

    } catch (error) {
      console.log('erro:', error);

    }
  }
}

export const NotificacaoListener = () => {

  messaging()
    .getInitialNotification()
    .then(async remote => {
      if (remote) {
        console.log('Notification caused app to open from backgruand state:',
          remote.notification,)
      }
    })

  messaging()
    .onNotificationOpenedApp(async mensagem => {
      console.log('Notification caused app to open from backgruand state:',
        mensagem.notification,
      );
    });

  messaging()
    .setBackgroundMessageHandler(async remote => {
      console.log('Message handled in de backgruand', remote);

    })

    messaging().onMessage(async mensagem => {
      console.log('notification on froground state.....', mensagem);
      
    })

    const unsub = messaging().onMessage( async remote => {
      Alert.alert('a new FMC message arrived!', JSON.stringify(remote))
    } )

    return unsub;
  /*
    messaging()
    .getInitialNotification()
    .then(mensagem => {
      if (mensagem) {
        console.log('Notification caused app to open from quit state:',
        mensagem.notification,);
      };
    });
  
    messaging().onMessage(async mensagem => {
      console.log('notification on froground state.....', mensagem);
      
    })*/
}

