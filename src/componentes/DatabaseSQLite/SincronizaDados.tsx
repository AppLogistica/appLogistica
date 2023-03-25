
import db from "./database";
import { CaixaProps, EnderecoProps, FornecedorProps, LocalCaixaProps, SemanaProps, StatusProps } from "../SemanalCard";
//import { LocalProps } from "react-native-svg";

async function fn_status() {


  db.transaction(tx => {
    tx.executeSql('select * from Status', [], (_, { rows }) =>
      console.log(JSON.stringify(rows))
    );
  });

};

async function fn_local() {



  db.transaction(tx => {
    tx.executeSql('select * from local', [], (_, { rows }) =>
      console.log(JSON.stringify(rows))
    );
  });
};

async function fn_caixa() {



  db.transaction(tx => {
    tx.executeSql('select * from caixa', [], (_, { rows }) =>
      console.log(JSON.stringify(rows))
    );
  });
};

async function fn_fornecedor() {



  db.transaction(tx => {
    tx.executeSql('select * from fornecedor', [], (_, { rows }) =>
      console.log(JSON.stringify(rows))
    );
  });
};

async function fn_semana() {



  db.transaction(tx => {
    tx.executeSql('select * from semana', [], (_, { rows }) =>
      console.log(JSON.stringify(rows))
    );
  });
};

async function fn_endereco() {


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
  //fn_fornecedor();
 //fn_endereco();
  //fn_semana();

   dropaTabelas();
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