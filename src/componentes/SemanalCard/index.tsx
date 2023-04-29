
import { TouchableOpacity, TouchableOpacityProps, Text, TouchableWithoutFeedback, Modal, Button as Botao } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './styles';
import { TEMA } from '../../tema/tema';
import { View } from 'native-base';
import * as Linking from 'expo-linking';
import firestore from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import { Dadosgeolocal, location } from '../buscaLocal/geolocal';
import { Button } from "../../componentes/botao/Button";
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
  etapa: number;
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

export interface ProcessoProps {
  id: string;
  id_local: number;
  nomeLocal: string;
  id_status: number;
  nomeStatus: string;
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

      const status = id_status === 1 ? 'VAZIA' : (id_status === 2 ? 'CHEIA' : 'DESCARREGADO');
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

  const [showMenu, setShowMenu] = useState(false);

  const handleLongPress = () => {
    setShowMenu(true);
  };

  const handleConfirm = () => {
    
    

    setShowMenu(false);
  };

  const handleCancel = () => {
    // Lógica para cancelar a ação
    setShowMenu(false);
  };

  const cor = SemanaDados.status === '' ? '' : (SemanaDados.status === 'VAZIA' ? 'blue' : 'green');
  // colors={SemanaDados.cor === 'gray' ? ['#aeb5b5', '#e6ebeb'] : (SemanaDados.ativo != 'Finalizado' ? TEMA.COLORS.FOOTER : ['green', 'green']) }
  return (
    <View style={styles.Principal}>
      <TouchableOpacity style={[styles.container, { marginTop: margem }]} {...rest} onLongPress={handleLongPress}>
        <LinearGradient
          colors={SemanaDados.ativo === 'Finalizado' ? ['green', 'green'] : (SemanaDados.cor === 'gray' ? ['#aeb5b5', '#e6ebeb'] : TEMA.COLORS.FOOTER)}

          style={[styles.footer]}>

          <View style={[styles.linha, { backgroundColor: cor }, { opacity: cor === '' ? 0 : 0.6 }]} />

          <View style={[{ width: '90%' }, { marginLeft: 10 }, { marginTop: 10 }]}>

            <View style={[{ flexDirection: 'row' }, { justifyContent: 'space-between' }]}>
              <Text style={[styles.Produtor, SemanaDados.ativo === 'Finalizado' ? { color: 'white' } : null]}>
                {`${SemanaDados.data}`}
              </Text>
              <Text style={[styles.idSemana, SemanaDados.ativo === 'Finalizado' ? { color: 'white' } : null]} >
                {SemanaDados.id_semana}
              </Text>
            </View>

            <Text style={[styles.Produtor, SemanaDados.ativo === 'Finalizado' ? { color: 'white' } : null]}>
              {`${SemanaDados.id_fornecedor}`.padStart(2, '0')} : {dadosFornec}
            </Text>

            <Text style={[styles.Detalhes, { opacity: SemanaDados.status === '' && SemanaDados.ativo === 'Inativos' ? 0 : 1 }, SemanaDados.ativo === 'Finalizado' ? { color: 'white' } : null]}>
              {SemanaDados.ativo === 'Finalizado' ? 'DESCARREGADO' : `Caixa ${`${SemanaDados.id_caixa}`.padStart(2, '0')} : ${selectCaixaStatus}`}
            </Text>


            <Text style={[styles.Endereco, SemanaDados.ativo === 'Finalizado' ? { color: 'white' } : null]}>
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
      <Modal visible={showMenu} animationType="slide" style={[{ backgroundColor: 'red' }, { width: '100%' }, { height: '100%' }]}>
        <View style={[{ width: '100%' }, { height: '60%' }, { display: 'flex' }, { justifyContent: 'center' }, { alignItems: 'center' },]}>

          <View style={[{borderColor: '#7fdec7'}, {borderWidth: 1}, { marginBottom: 50 }, {borderRadius: 20}, {width: '90%'}]}>
            <Text style={[{ fontSize: 16 }, { textAlign: 'center' }, {margin: 10}]}>
              Caso o fornecedor já estaja pronto para receber a caixa vazia, clique em confirmar {`\n`}
              Caso Não tenha essa confirmação, ou confirmou errado, clique em cancelar</Text>
          </View>

          <Button title="Confirmar" onPress={handleConfirm} style={[styles.buttonPdf, { marginBottom: 20 }]} />
          <Button title="Cancelar" onPress={handleCancel} style={styles.buttonPdf} />
        </View>
      </Modal>
    </View>
  );
}
