import { CaixaProps, StatusProps } from "../../SemanalCard";
import db from "../database";

db.transaction((tx) => {

  tx.executeSql(
    "CREATE TABLE IF NOT EXISTS status (id_status integer primary key not null, nome text not null);"
  );
});

const insert = (obj: StatusProps) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        'insert into Status (id_status, nome) values (?, ?);',
        [obj.id, obj.nome],
        //-----------------------
        (_, { rowsAffected, insertId }) => {
          if (rowsAffected > 0) resolve(insertId);
          else reject("Error inserting obj: " + JSON.stringify(obj)); // insert falhou
        },
        (_, error) => {
          reject(error);
          return false
        } // erro interno em tx.executeSql

      );
    });
  });
};

const update = (id: number, obj: StatusProps) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        "UPDATE status SET nome=? WHERE status.id_status = ?;",
        [id],
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

const encontrar = (id: string | null): Promise<StatusProps> => {

  return new Promise((resolve, reject) => {

    const query = `select status.* from semana INNER JOIN caixa ON semana.id_caixa = caixa.id_caixa INNER JOIN status ON status.id_status = caixa.id_status and semana.id_caixa = ${id}`;

    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        query,
        [],
        //-----------------------
        (_, { rows }) => {
          if (rows.length > 0) { resolve(rows._array[0]); }
          else reject("Objeto não encontrado: id=" + id); // nenhum registro encontrado
        },
        (_, error) => {
          reject(error);
          return false;
        } // erro interno em tx.executeSql
      );
    });
  });
};

const encontrabyNome = (nome: string) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        "SELECT * FROM status WHERE nome LIKE ?;",
        [nome],
        //-----------------------
        (_, { rows }) => {
          if (rows.length > 0) resolve(rows._array);
          else reject("Obj not found: brand=" + nome); // nenhum registro encontrado
        },
        (_, error) => {
          reject(error) // erro interno em tx.executeSql
          return false;
        }

      );
    });
  });
};


const todos = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        "SELECT * FROM status;",
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

    const query = `DELETE FROM status WHERE status.id_status = ?`;

    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        query,
        [id],
        //-----------------------
        (_, { rows }) => {
          if (rows.length > 0) { resolve(rows._array[0]); }
          else reject("Objeto não encontrado: id=" + id); // nenhum registro encontrado
        },
        (_, error) => {
          reject(error);
          return false;
        } // erro interno em tx.executeSql
      );
    });
  });
};

export default {
  encontrar,
  update,
  remove,
  insert,
  todos,
  encontrabyNome
};