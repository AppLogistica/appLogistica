import { SemanaProps } from "../../SemanalCard";
import db from "../database";


db.transaction((tx) => {

  tx.executeSql(
    'create table if not exists Semana' +
    '(id_semana integer primary key,' +
    'id_fornecedor integer not null,' +
    'id_caixa integer null,' +
    'data date not null,' +
    'inserido_em date not null,' +
    'alterado_em date,' +
    'FOREIGN KEY (id_fornecedor) REFERENCES Fornecedor (id_fornecedor),' +
    'FOREIGN KEY (id_caixa) REFERENCES Caixa (id_caixa));'
  );
});

const inserir = (obj: SemanaProps) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        'insert into semana (id_semana, id_fornecedor, id_caixa, data, inserido_em) values (?, ?, ?, ?, ?);',
        [obj.id_semana, obj.id_fornecedor, obj.id_caixa, `${obj.data}`, `${obj.inserido_em}`],
        //-----------------------
        (_, { rowsAffected, insertId }) => {
          if (rowsAffected > 0) resolve(insertId);
          else reject("Error inserting obj: " + JSON.stringify(obj)); // insert falhou
        },
        (_, error) => {
          reject(error) // erro interno em tx.executeSql
          return false;
        }
      );
    });
  });
};


const update = (id: number, obj: SemanaProps) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        "UPDATE semana SET id_status, model=?, hp=? WHERE id=?;",
        [obj.id_semana, obj.id_caixa, obj.id_fornecedor, `${obj.data}`, `${obj.inserido_em}`, id],
        //-----------------------
        (_, { rowsAffected }) => {
          if (rowsAffected > 0) resolve(rowsAffected);
          else reject("Error updating obj: id=" + id); // nenhum registro alterado
        },
        (_, error) => {
          reject(error) // erro interno em tx.executeSql
          return false;
        }
      );
    });
  });
};

const encontrar = (id: number): Promise<SemanaProps> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        "SELECT * FROM semana WHERE id=?;",
        [id],
        //-----------------------
        (_, { rows }) => {
          if (rows.length > 0) resolve(rows._array[0]);
          else reject("Obj not found: id=" + id); // nenhum registro encontrado
        },
        (_, error) => {
          reject(error) // erro interno em tx.executeSql
          return false;
        }
      );
    });
  });
};

const findByCaixa = (id_caixa: number):Promise<SemanaProps[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        "SELECT * FROM semana WHERE id_caixa = ?;",
        [id_caixa],
        //-----------------------
        (_, { rows }) => {
          if (rows.length > 0) resolve(rows._array);
          else reject("Obj not found: brand=" + id_caixa); // nenhum registro encontrado
        },
        (_, error) => {
          reject(error) // erro interno em tx.executeSql
          return false;
        }
      );
    });
  });
};

const todos = ():Promise<SemanaProps[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        "SELECT * FROM semana;",
        [],
        //-----------------------
        (_, { rows }) => resolve(rows._array),
        (_, error) => {
          reject(error) // erro interno em tx.executeSql
          return false;
        }
      );
    });
  });
};

const remove = (id: number) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        "DELETE FROM semana WHERE id=?;",
        [id],
        //-----------------------
        (_, { rowsAffected }) => {
          resolve(rowsAffected);
        },
        (_, error) => {
          reject(error) // erro interno em tx.executeSql
          return false;
        }
      );
    });
  });
};

export default {
  inserir,
  update,
  encontrar,
  findByCaixa,
  todos,
  remove
}
