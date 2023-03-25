import { FornecedorProps } from "../../SemanalCard";
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
      'create table if not exists fornecedor' +
      '(id_fornecedor integer primary key,' +
      'nome text not null,' +
      'CNPJ text not null,' +
      'email text,' +
      'id_endereco integer not null,' +
      'FOREIGN KEY (id_endereco) REFERENCES Endereco (id_endereco));',
    );
  });
  
  const inserir = (obj: FornecedorProps) => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        //comando SQL modificável
        tx.executeSql(
          'insert into fornecedor (id_fornecedor, nome, cnpj, email, id_endereco) values (?, ?, ?, ?, ?);',
          [obj.id_fornecedor, obj.nome, obj.cnpj, obj.email, obj.id_endereco],
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

  const update = (id:number, obj: FornecedorProps) => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        //comando SQL modificável
        tx.executeSql(
          "UPDATE fornecedor SET nome=?, cnpj=?, id_endereco=?, email=? WHERE id_fornecedor=?;",
          [ obj.nome, obj.cnpj, obj.id_endereco, obj.email, id],
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

  const encontrar = (id: number):Promise<FornecedorProps> => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        //comando SQL modificável
        tx.executeSql(
          "SELECT * FROM fornecedor WHERE id_fornecedor=?;",
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

  const findByFornecedor = (nome: string):Promise<FornecedorProps[]> => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        //comando SQL modificável
        tx.executeSql(
          "SELECT * FROM cars WHERE brand LIKE ?;",
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


  const todos = ():Promise<FornecedorProps[]> => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        //comando SQL modificável
        tx.executeSql(
          "SELECT * FROM fornecedor;",
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
          "DELETE FROM fornecedor WHERE id_fornecedor=?;",
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
          "DROP TABLE fornecedor;",
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
    findByFornecedor,
    todos,
    remove,
    dropa
  }