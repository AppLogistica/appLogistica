import firestore from '@react-native-firebase/firestore';
import { CaixaProps } from '../SemanalCard';

export interface location {
  Longitude: number | null,
  Latitude: number | null
}

export async function Dadosgeolocal(idCaixa: number | null): Promise<location | undefined> {
  return new Promise(async (resolve) => {

    const caixa = firestore().collection('caixa').doc(`${idCaixa}`);
    const doc = await caixa.get();
    if (!doc.exists) {
      console.log('Documento não encontrado!');
    } else {

      const { Latitude, Longitude } = doc.data() as CaixaProps;


      resolve({Latitude,Longitude})
    }

  })
}