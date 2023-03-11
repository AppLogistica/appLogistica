
import axios from 'axios'
import { FornecedorProps, SemanaProps } from '../SemanalCard';
import firestore from '@react-native-firebase/firestore';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

export async function EnviaNotify(dados: SemanaProps) {

  let NomeFornecedor = '';

  const fornec = firestore().collection('fornecedor').doc(`${dados.id_fornecedor}`);
  const doc = await fornec.get();
  if (!doc.exists) {
    console.log('Documento não encontrado!');
  } else {

    const { nome } = doc.data() as FornecedorProps;
    NomeFornecedor = nome;
  }


  // @ts-ignore



  const tokens = [];
  const meuToken = await messaging().getToken();
  
  console.log(meuToken);

  const caixas = firestore().collection('tokens');
  const snapshote = await caixas.where('asToken', '!=', `${meuToken}`).get();
  if (snapshote.empty) {
    console.log('Documento não encontrado!');
    return;
  }

  snapshote.forEach(docc => {

    const token = 'AAAAw1s1S44:APA91bH-ZfsL9-GnXEQCvfqDVm8dZjjXj6lors07xDCzRy1hem35HwRN37syvYeOwCnC5gBYwo13Hg60wAfkGp6IgT1OZKXmV9x9HYeis5lBqRZev94yKWMEnlamJdWDmDk0DyoqUev5';

    axios.post('https://fcm.googleapis.com/fcm/send', {
      "notification": {
        "title": `Caixa cheia `,
        "body": `${NomeFornecedor}`,
        "android": {
          //"direct_boot_ok": true,
          "priority": "high",
        },
      },
      "data": {
        dados
      },
      "to": `${docc.id}`,
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => console.log(response.data))
      .catch(error => console.error(error.response.data));

  });
}