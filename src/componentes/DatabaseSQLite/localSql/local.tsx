
import { LocalCaixaProps } from "../../SemanalCard";
import db from "../Database";

/**
 * INICIALIZAÇÃO DA TABELA
 * - Executa sempre, mas só cria a tabela caso não exista (primeira execução)
 */
db.transaction((tx) => {
    //<<<<<<<<<<<<<<<<<<<<<<<< USE ISSO APENAS DURANTE OS TESTES!!! >>>>>>>>>>>>>>>>>>>>>>>
    //tx.executeSql("DROP TABLE cars;");
    //<<<<<<<<<<<<<<<<<<<<<<<< USE ISSO APENAS DURANTE OS TESTES!!! >>>>>>>>>>>>>>>>>>>>>>>
  
    tx.executeSql(
        'create table if not exists Local' +
        '(id_local integer primary key not null,' +
        'nome text not null);'
    );
  });

  const inserir = (obj: LocalCaixaProps) => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        //comando SQL modificável
        tx.executeSql(
            'insert into local (id_local, nome) values (?, ?);',
          [obj.id, obj.nome],
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

  const update = (id: number, obj: LocalCaixaProps) => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        //comando SQL modificável
        tx.executeSql(
          "UPDATE local SET name=? WHERE id_local=?;",
          [obj.nome, id],
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
  
  const encontrar = (id: number):Promise<LocalCaixaProps> => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        //comando SQL modificável
        tx.executeSql(
          "SELECT * FROM local WHERE id_local=?;",
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

  const todos = ():Promise<LocalCaixaProps[]> => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        //comando SQL modificável
        tx.executeSql(
          "SELECT * FROM local;",
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
          "DELETE FROM local WHERE id_local=?;",
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
    todos,
    remove
  }