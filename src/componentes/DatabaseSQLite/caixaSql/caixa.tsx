import { CaixaProps } from "../../SemanalCard";
import db from "../database";

/**
 * INICIALIZAÇÃO DA TABELA
 * - Executa sempre, mas só cria a tabela caso não exista (primeira execução)
 */
db.transaction((tx) => {
  //<<<<<<<<<<<<<<<<<<<<<<<< USE ISSO APENAS DURANTE OS TESTES!!! >>>>>>>>>>>>>>>>>>>>>>>
  //tx.executeSql("DROP TABLE cars;");
  //<<<<<<<<<<<<<<<<<<<<<<<< USE ISSO APENAS DURANTE OS TESTES!!! >>>>>>>>>>>>>>>>>>>>>>>

  tx.executeSql(
    'create table if not exists Caixa' +
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


const inserir = (obj: CaixaProps) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        'insert into caixa (id_caixa, nome, id_status, id_local, Latitude, Longitude) values (?, ?, ?, ?, ?, ?);',
        [obj.id, obj.nome, obj.id_status, obj.id_local, obj.Latitude, obj.Longitude],
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

const update = (id: number, obj: CaixaProps | undefined) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        'UPDATE caixa SET nome=?, id_local=?, id_status=2, latitude=?, longitude=? WHERE id_caixa=?;',
        [`${obj?.nome}`, `${obj?.id_local}`, `${obj?.Latitude}`, `${obj?.Longitude}`, id],
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

const encontrar = (id: number): Promise<CaixaProps> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        "SELECT * FROM caixa WHERE id_caixa=?;",
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

const encontrarByStatus = (id_status: number): Promise<CaixaProps[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        "SELECT * FROM cars WHERE id_status ?;",
        [id_status],
        //-----------------------
        (_, { rows }) => {
          if (rows.length > 0) resolve(rows._array);
          else reject("Obj not found: brand=" + id_status); // nenhum registro encontrado
        },
        (_, error) => {
          reject(error) // erro interno em tx.executeSql
          return false;
        }
      );
    });
  });
};

const todos = ():Promise<CaixaProps[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        "SELECT * FROM caixa;",
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
        "DELETE FROM caixa WHERE id=?;",
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
  encontrarByStatus,
  todos,
  remove
}