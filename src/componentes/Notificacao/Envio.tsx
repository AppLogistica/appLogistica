import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

export async function sendFCMMessage(message: {title: string, body: string}) {
    
    const remoteMessage: FirebaseMessagingTypes.RemoteMessage = {
      notification: {
        title: 'message.title',
        body: 'message.body',
      },
      fcmOptions: {
        // Configurações avançadas de opções do FCM podem ser definidas aqui
      },
    };
  
    await messaging().sendMessage(remoteMessage);
    
  }

  async function mostra( id: string, title: string, body: string) {
    await notifee.requestPermission();

    const channelId = await notifee.createChannel({
      id: 'VerificaStatus',
      name: 'Status',
      vibration: true,
      importance: AndroidImportance.HIGH
    });

    await notifee.displayNotification({
      id: id,
      title: title,
      body: body,
      android: {
        channelId
      }
    })
  }