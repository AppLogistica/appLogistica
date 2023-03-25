import { SemanaProps } from "../../SemanalCard";
import db from "../database";


db.transaction((tx) => {
  tx.executeSql(
    'create table if not exists semana' +
    '(id_semana text primary key,' +
    'id text not null,' +
    'status text,' +
    'id_fornecedor integer not null,' +
    'id_caixa integer null,' +
    'data_ date not null,' +
    'inserido_em date not null,' +
    'ativo text not null,' +
    'FOREIGN KEY (id_fornecedor) REFERENCES Fornecedor (id_fornecedor));'
  );
});

const inserir = (obj: SemanaProps) => {
  return new Promise((resolve, reject) => {
 
    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        'insert into semana (id_semana, id, status, id_fornecedor, id_caixa, data_, inserido_em, ativo) values (?, ?, ?, ?, ?, ?, ?, ?);',
        [obj.id_semana, obj.id, obj.status, obj.id_fornecedor, obj.id_caixa, `${obj.data_}`, `${obj.inserido_em}`, obj.ativo],
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
/*
      status: selectCaixaStatus,
      id_caixa: idCaixa,
      id: id_historico,
      ativo: 'Iniciado'
*/
const update = (id: number, status: string, id_caixa: number, id_historico: string, ativo: string) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        "UPDATE semana SET id=?, status=?, id_caixa=?, ativo=? WHERE id_semana=?;",
        [id_historico, status, id_caixa, ativo, id],
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
        "SELECT * FROM semana WHERE id_semana=?;",
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

const findByCaixa = (id_caixa: number): Promise<SemanaProps[]> => {
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

const todos = (): Promise<SemanaProps[]> => {

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

const pegaByData = (data: string): Promise<SemanaProps[]> => {

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        `SELECT * FROM semana WHERE data_ = ?;`,
        [`${data}`],
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
        "DELETE FROM semana WHERE id_semana=?;",
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

const dropa = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        "DROP TABLE semana;",
        [],
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
  remove,
  pegaByData,
  dropa
}
