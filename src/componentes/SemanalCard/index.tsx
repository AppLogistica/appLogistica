
import { TouchableOpacity, TouchableOpacityProps, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './styles';
import { TEMA } from '../../tema/tema';
import { View } from 'native-base';
import * as Linking from 'expo-linking';
//import firestore from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import { Dadosgeolocal, location } from '../buscaLocal/geolocal';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { supabase } from '../Supabase/database';
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
  // id: string;
  id_fornecedor: number,
  cnpj: string;
  email: string | null;
  id_endereco: number;
  nome: string;
}

export interface LocalCaixaProps {
  id: string;
  nome: string;
}

export interface SemanaProps {
  data_: Date;
  id_caixa: number;
  status: string;
  id_fornecedor: number;
  id_semana: number;
  inserido_em: Date;
  id: string;
  ativo: string;
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
  const [status, setStatus] = useState('')

  const [dadosFornec, setDadosFornec] = useState('');
  const [daodosEndereco, setDadosEndereco] = useState('');

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

    if (SemanaDados.id_caixa) {
      const { data: Dadoscaixa, error }
        = await supabase.from('caixa')
          .select(`id_status, id_local `)
          .eq('id_caixa', SemanaDados.id_caixa);

      if (error) {
        console.log('caixa', error);
      }

      if (Dadoscaixa && Dadoscaixa.length > 0) {
        const status = Dadoscaixa[0].id_status === 1 ? 'VAZIA' : 'CHEIA';
        const local = Dadoscaixa[0].id_local === 1 ? 'FABRICA' : (Dadoscaixa[0].id_local === 2 ? 'CAMINHÃO' : 'FORNECEDOR')
        setSelectCaixaStatus(status);
        setSelecLocalCarga(local);
      }
    }
  }

  async function pegaDadosFornecedor() {

    let { data: fornec, error } = await supabase.from('fornecedor').select('nome, id_endereco').eq('id_fornecedor', SemanaDados.id_fornecedor);

    if (error) {
      console.log('fornec',error);
    }

    if (fornec && fornec.length > 0) {
      setDadosFornec(fornec[0].nome);
      pegaDadosEndereco(fornec[0].id_endereco)
    }
  }

  async function pegaDadosEndereco(id_endereco: number) {

    let { data: endereco, error } = await supabase.from('endereco').select('cep').eq('id_endereco', 1)


    if (error) {
      console.log('endereco',error);
    }

    if (endereco && endereco.length > 0) {
      setDadosEndereco(endereco[0].cep)
    }
  }

  useEffect(() => {
    pegaDadosUmaCaixa();
    pegaDadosFornecedor();
    /*caixa.encontrar(`${SemanaDados.id_caixa}`)
      .then(caixa => setDadosStatus(caixa))
      .catch(err => console.log(err))*/


  }, [SemanaDados])
  
  const cor = SemanaDados.status === null ? '' : (SemanaDados.status === 'VAZIA' ? 'blue' : 'green');

  return (
    <View style={styles.Principal}>
      <TouchableOpacity style={[styles.container, { marginTop: margem }]} {...rest}>
        <LinearGradient
          colors={SemanaDados.ativo != 'Finalizado' ? TEMA.COLORS.FOOTER : ['green', 'green']}
          style={[styles.footer]}>

          <View style={[styles.linha, { backgroundColor: cor }, { opacity: cor === '' ? 0 : 0.6 }]} />

          <View style={[{ width: '90%' }, { marginLeft: 10 }, { marginTop: 10 }]}>

            <View style={[{ flexDirection: 'row' }, { justifyContent: 'space-between' }]}>
              <Text style={[styles.Produtor, SemanaDados.ativo === 'Finalizado' ? { color: 'white' } : null]}>
                {dayjs(`${SemanaDados.data_}`).format('DD/MM/YYYY')}
              </Text>
              <Text style={[styles.idSemana, SemanaDados.ativo === 'Finalizado' ? { color: 'white' } : null]} >
                {SemanaDados.id_semana}
              </Text>
            </View>

            <Text style={[styles.Produtor, SemanaDados.ativo === 'Finalizado' ? { color: 'white' } : null]}>
              Fornecedor: {dadosFornec}
            </Text>

            <Text style={[styles.Detalhes, { opacity: SemanaDados.status === null ? 0 : 1 }, SemanaDados.ativo === 'Finalizado' ? { color: 'white' } : null]}>
              Caixa {`${SemanaDados.id_caixa}`.padStart(2, '0')} : {selectCaixaStatus}
            </Text>

            <Text style={[styles.Endereco, SemanaDados.ativo === 'Finalizado' ? { color: 'white' } : null]}>
              CEP: {daodosEndereco}
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
