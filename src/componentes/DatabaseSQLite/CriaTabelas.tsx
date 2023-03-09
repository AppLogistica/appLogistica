
import db from './database';

export function carregaSQLite() {

  db.transaction(tx => {
    tx.executeSql(
      'create table if not exists endereco' +
      '(id_endereco integer primary key not null,' +
      'CEP text not null,' +
      'estado text not null,' +
      'cidade text not null,' +
      'bairro text not null,' +
      'logradouro text not null);'
    );
  });

  db.transaction(tx => {
    tx.executeSql(
      'create table if not exists status' +
      '(id_status integer primary key not null,' +
      'nome text not null);'
    );
  });

  db.transaction(tx => {
    tx.executeSql(
      'create table if not exists local' +
      '(id_local integer primary key not null,' +
      'nome text not null);'
    );
  });

  db.transaction(tx => {
    tx.executeSql(
      'create table if not exists caixa' +
      '(id_caixa integer primary key,' +
      'nome text(3),' +
      'id_status integer,' +
      'id_local integer not null,' +
      'Latitude integer null,' +
      'Longitude integer null,' +
      'FOREIGN KEY (id_status) REFERENCES status (id_status),' +
      'FOREIGN KEY (id_local) REFERENCES local (id_local));'
    );
  });

  db.transaction(tx => {
    tx.executeSql(
      'create table if not exists fornecedor' +
      '(id_fornecedor integer primary key,' +
      'nome text not null,' +
      'CNPJ text not null,' +
      'email text,' +
      'id_endereco integer not null,' +
      'FOREIGN KEY (id_endereco) REFERENCES endereco (id_endereco));'
    );
  });

  db.transaction(tx => {

    tx.executeSql(
      'create table if not exists semana' +
      '(id_semana integer primary key,' +
      ' id_fornecedor integer not null,' +
      'id_caixa integer null,' +
      'data date not null,' +
      'inserido_em date not null,' +
      'alterado_em date,' +
      'FOREIGN KEY (id_fornecedor) REFERENCES fornecedor (id_fornecedor),' +
      'FOREIGN KEY (id_caixa) REFERENCES caixa (id_caixa));')

  });

}