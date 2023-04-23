
import { TouchableOpacity, TouchableOpacityProps, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './styles';
import { TEMA } from '../../tema/tema';
import { View } from 'native-base';
import * as Linking from 'expo-linking';
import firestore from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import { Dadosgeolocal, location } from '../buscaLocal/geolocal';
//import * as SQLite from 'expo-sqlite';
//import caixa from '../DatabaseSQLite/StatusSQl/Status';
//import db from '../DatabaseSQLite/Database';

export interface CaixaProps {
  id: string;
  nome: string;
  id_status: number;
  id_local: number;
  Latitude: number | null;
  Longitude: number | null;
  livre: boolean;
}

export interface EnderecoProps {
  id: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
  logradouro: string;
}

export interface StatusProps {
  id: string;
  nome: string;
}

export interface FornecedorProps {
  id: string;
  id_fornecedor: number,
  cnpj: string;
  email: string | null;
  id_endereco: number;
  nome: string;
  cidade: string;
}

export interface LocalCaixaProps {
  id: string;
  nome: string;
}

export interface SemanaProps {
  data: Date;
  id_caixa: null | number;
  status: string;
  id_fornecedor: number;
  id_semana: number;
  inserido_em: Date;
  id: string;
  ativo: string;
  QtdCaixa: number;
  //confirmado: boolean;
  cor: string;
}

export interface Historico {
  id: string;
  data: string;
  hora: string;
  id_HistóricoSemana: string;
  id_caixa: number;
  local: string;
  status: string;
  
}

interface Props extends TouchableOpacityProps {
  SemanaDados: SemanaProps;
  margem: number;
}

export function SemanalCard({ SemanaDados, margem, ...rest }: Props) {

  const dadosCaixa: CaixaProps[] = [];
  const [selecLocalCarga, setSelecLocalCarga] = useState('');
  const [selectCaixaStatus, setSelectCaixaStatus] = useState('');

  const [dadosFornec, setDadosFornec] = useState('');
  const [cidade, setCidade] = useState('');

  async function abreMapa() {

    await Dadosgeolocal(SemanaDados.id_caixa)
      .then(async item => {

        if (item?.Latitude && item?.Longitude) {

          try {

            const url = `https://maps.google.com/?q=${item?.Latitude},${item?.Longitude}`;
            const supported = await Linking.canOpenURL(url);
            if (supported) {
              return Linking.openURL(url);
            } else {
              throw new Error('Não é possível abrir o mapa: ' + url);
            }
          }
          catch (error) {
            console.log(error);
          }
        }
      })
      .catch(erro => {
        console.log(erro);

      })
  }

  async function pegaDadosUmaCaixa() {

    const caixa = firestore().collection('caixa').doc(`${SemanaDados.id_caixa}`);
    const doc = await caixa.get();
    if (!doc.exists) {
      console.log('Documento não encontrado!');
    } else {

      const { id_local, id_status } = doc.data() as CaixaProps;

      console.log(id_local);

      const status = id_status === 1 ? 'VAZIA' : ( id_status === 2 ? 'CHEIA' : 'DESCARREGADO');
      const local = id_local === 1 ? 'FABRICA' : (id_local === 2 ? 'CAMINHÃO' : 'FORNECEDOR')

      setSelecLocalCarga(local);
      setSelectCaixaStatus(status);

    }
  }

  async function pegaDadosFornecedor() {

    const fornec = firestore().collection('fornecedor').doc(`${SemanaDados.id_fornecedor}`);
    const doc = await fornec.get();
    if (!doc.exists) {
      console.log('Documento não encontrado!');
    } else {

      const { cidade, nome } = doc.data() as FornecedorProps;
      setDadosFornec(nome);
      setCidade(cidade);

    }
  }

  useEffect(() => {
    pegaDadosUmaCaixa();
    pegaDadosFornecedor();

  }, [SemanaDados])

  const cor = SemanaDados.status === '' ? '' : (SemanaDados.status === 'VAZIA' ? 'blue' :(SemanaDados.status === 'CHEIA' ? 'green': 'yellow'));

  return (
    <View style={styles.Principal}>
      <TouchableOpacity style={[styles.container, { marginTop: margem }]} {...rest}>
        <LinearGradient
          colors={SemanaDados.cor === 'gray' ? ['#aeb5b5', '#e6ebeb'] : (SemanaDados.ativo != 'Finalizado' ? TEMA.COLORS.FOOTER : ['green', 'green']) }
          style={[styles.footer]}>

          <View style={[styles.linha, { backgroundColor: cor }, { opacity: cor === '' ? 0 : 0.6 }]} />

          <View style={[{ width: '90%' }, { marginLeft: 10 }, { marginTop: 10 }]}>

            <View style={[{ flexDirection: 'row' }, { justifyContent: 'space-between' }]}>
              <Text style={[styles.Produtor, SemanaDados.ativo === 'Finalizado' ? {color: 'white'} : null]}>
                {`${SemanaDados.data}`}
              </Text>
              <Text style={[styles.idSemana, SemanaDados.ativo === 'Finalizado' ? {color: 'white'} : null]} >
                {SemanaDados.id_semana}
              </Text>
            </View>

            <Text style={[styles.Produtor, SemanaDados.ativo === 'Finalizado' ? {color: 'white'} : null]}>
              {`${SemanaDados.id_fornecedor}`.padStart(2,'0')} : {dadosFornec}
            </Text>

            <Text style={[styles.Detalhes, { opacity: SemanaDados.status === '' ? 0 : 1 }, SemanaDados.ativo === 'Finalizado' ? {color: 'white'} : null]}>
              Caixa {`${SemanaDados.id_caixa}`.padStart(2, '0')} : {selectCaixaStatus}
            </Text>

            <Text style={[styles.Endereco, SemanaDados.ativo === 'Finalizado' ? {color: 'white'} : null]}>
              {cidade}
            </Text>

            <View
              style={
                [{ height: 30 },
                { alignItems: 'flex-end' },
                { width: '100%' }]} >

              <TouchableOpacity onPress={abreMapa} style={[{ width: '35%' }, { height: 30 }, { justifyContent: 'center' }]} >
                <Text style={styles.Textmapa}>
                  Ver no mapa &gt;
                </Text>
              </TouchableOpacity>

            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}
