//import { useState } from "react";
//import { supabase } from "../Supabase/database";
//import * as SQLite from 'expo-sqlite';
import firestore from '@react-native-firebase/firestore';
import db from "./database";
import { CaixaProps, EnderecoProps, FornecedorProps, LocalCaixaProps, SemanaProps, StatusProps } from "../SemanalCard";
//import { LocalProps } from "react-native-svg";

async function fn_status() {

  firestore()
    .collection('status')
    .onSnapshot(querySnapshot => {
      const data = querySnapshot.docs.map(doc => {

        return {
          id: doc.id,
          ...doc.data()
        }
      }) as StatusProps[]

      data.map(item => {
        db.transaction(tx => {
          tx.executeSql('insert into status (id_status, nome) values (?, ?);', [item.id, item.nome]);
        });
      })

    });

  db.transaction(tx => {
    tx.executeSql('select * from Status', [], (_, { rows }) =>
      console.log(JSON.stringify(rows))
    );
  });

};

async function fn_local() {

  firestore()
    .collection('local')
    .onSnapshot(querySnapshot => {
      const data = querySnapshot.docs.map(doc => {

        return {
          id: doc.id,
          ...doc.data()
        }
      }) as LocalCaixaProps[]

      data.map(item => {
        db.transaction(tx => {
          tx.executeSql('insert into local (id_local, nome) values (?, ?);', [item.id, item.nome]);
        });
      })
    });

  db.transaction(tx => {
    tx.executeSql('select * from local', [], (_, { rows }) =>
      console.log(JSON.stringify(rows))
    );
  });
};

async function fn_caixa() {

  firestore()
    .collection('caixa')
    .onSnapshot(querySnapshot => {
      const data = querySnapshot.docs.map(doc => {

        return {
          id: doc.id,
          ...doc.data()
        }
      }) as CaixaProps[]

      data.map(item => {
        db.transaction(tx => {
          tx.executeSql('insert into caixa (id_caixa, nome, id_status, id_local, Latitude, Longitude) values (?, ?, ?, ?, ?, ?);',
            [item.id, item.nome, item.id_status, item.id_local, item.Latitude, item.Longitude]);
        });
      })
    });

  db.transaction(tx => {
    tx.executeSql('select * from caixa', [], (_, { rows }) =>
      console.log(JSON.stringify(rows))
    );
  });
};

async function fn_fornecedor() {

  firestore()
    .collection('fornecedor')
    .onSnapshot(querySnapshot => {
      const data = querySnapshot.docs.map(doc => {

        return {
          id: doc.id,
          ...doc.data()
        }
      }) as FornecedorProps[]

      data.map(item => {
        db.transaction(tx => {
          tx.executeSql('insert into fornecedor (id_fornecedor, nome, cnpj, email, id_endereco) values (?, ?, ?, ?, ?);',
            [item.id_fornecedor, item.nome, item.cnpj, item.email, item.id_endereco]);
        });
      })
    });

  db.transaction(tx => {
    tx.executeSql('select * from fornecedor', [], (_, { rows }) =>
      console.log(JSON.stringify(rows))
    );
  });
};

async function fn_semana() {

  firestore()
    .collection('semana')
    .onSnapshot(querySnapshot => {
      const data = querySnapshot.docs.map(doc => {

        return {
          id: doc.id,
          ...doc.data()
        }
      }) as SemanaProps[]

      data.map(item => {
        db.transaction(tx => {
          tx.executeSql('insert into semana (id_semana, id_fornecedor, id_caixa, data, inserido_em, alterado_em) values (?, ?, ?, ?, ?);',
            [item.id_semana, item.id_fornecedor, item.id_caixa, `${item.data}`, `${item.inserido_em}`]);
        });
      })
    });

  db.transaction(tx => {
    tx.executeSql('select * from semana', [], (_, { rows }) =>
      console.log(JSON.stringify(rows))
    );
  });
};

async function fn_endereco() {

  firestore()
    .collection('endereco')
    .onSnapshot(querySnapshot => {
      const data = querySnapshot.docs.map(doc => {

        return {
          id: doc.id,
          ...doc.data()
        }
      }) as EnderecoProps[]

      data.map(item => {
        db.transaction(tx => {
          tx.executeSql('insert into endereco (id_endereco, CEP, estado, cidade, bairro, logradouro) values (?, ?, ?, ?, ?, ?);',
            [item.id, item.cep, item.estado, item.cidade, item.bairro, item.logradouro]);
        });
      })
    });

  db.transaction(tx => {
    tx.executeSql('select * from endereco', [], (_, { rows }) =>
      console.log(JSON.stringify(rows))
    );
  });
};

export async function Sincroniza() {

  //fn_status();
  //fn_local();
  //fn_caixa();
  fn_fornecedor();
 //fn_endereco();
  //fn_semana();

  // dropaTabelas();
}

async function dropaTabelas() {

  db.transaction(tx => {
    tx.executeSql('drop table semana;', [], error => {
      console.error("Erro ao excluir tabela semana: " + error);
    });
  });

  db.transaction(tx => {
    tx.executeSql('drop table caixa;', [], error => {
      console.error("Erro ao excluir tabela caixa: " + error);
    });
  });

  db.transaction(tx => {
    tx.executeSql('drop table fornecedor;', [], error => {
      console.error("Erro ao excluir tabela fornecedor: " + error);
    });
  });

  db.transaction(tx => {
    tx.executeSql('drop table endereco;', [], error => {
      console.error("Erro ao excluir tabela endereco: " + error);
    });
  });

  db.transaction(tx => {
    tx.executeSql('drop table local;', [], error => {
      console.error("Erro ao excluir tabela local: " + error);
    });
  });

  db.transaction(tx => {
    tx.executeSql('drop table status;', [], error => {
      console.error("Erro ao excluir tabela status: " + error);
    });
  });
}