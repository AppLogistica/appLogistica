import { Asset } from 'expo-asset';
import * as Print from 'expo-print';
//import { manipulateAsync } from 'expo-image-manipulator';
import { FornecedorProps, SemanaProps } from '../SemanalCard';
import { shareAsync } from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
//import firestore from '@react-native-firebase/firestore';
import { supabase } from '../Supabase/database';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';


async function generateHTML(NomeFornecedor: string, recibo: SemanaProps, hora: string) {

  return `<html lang="en">

  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recibo</title>
  </head>
  
  <body>
    <div style="display: flex; justify-content: center; align-items: center; flex-direction: column;">
  
      <div"
        style="display: flex; justify-content: center; align-items: center; border: 1.5px solid black; height: 35px; width: 100%; margin-top: 20px;">
        <h2>Recibo Nº ${recibo.id_semana}</h2>
      </div>
  
      <div class="div2" style=" border: 1.5px solid black; width: 100%; margin-top: 1px; display: flex;">
  
        <div style=" margin: 10px; width: 100%;">
          <h3>Fornecedor: ${recibo.id_fornecedor} : ${NomeFornecedor}</h3>
          <h3>Caixa Nº ${ JSON.stringify(recibo.id_caixa).padStart(2,'0')} </h3>
          <div style="display: flex; justify-content: space-between"> 
            <h4 style=" margin: 0; padding: 5px;">Recibo gerado no dia ${dayjs().format('DD/MM/YYYY')} as ${hora}</h4>
            <h4 style="text-align: right; margin: 0; padding: 5px;"> Assinatura:    _____________________________ </h4>
          </div>
         
        </div>
      </div>
    </div>
  </body>
  </html>
`;
}

export async function print(recibo: SemanaProps) {

  const data = new Date()
  const hora = data.getHours();
  const minutos = data.getMinutes();
  const horaMinuto = `${hora}`.padStart(2, '0') + ':' + `${minutos}`.padStart(2, '0')

  let NomeFornecedor: FornecedorProps[];

  let { data: fornec, error } = await supabase.from('fornecedor').select('*').eq('id_fornecedor', recibo.id_fornecedor);

  if(error){
    console.log(error);
    return
  }

  NomeFornecedor = fornec as FornecedorProps[];
  let nomeFornec = NomeFornecedor[0].nome

  const html = await generateHTML('nomeFornec !== undefined' ? nomeFornec : '', recibo, horaMinuto);

  const { uri } = await Print.printToFileAsync({
    html,
    width: 612,
    height: 350,
  });

  await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
}


