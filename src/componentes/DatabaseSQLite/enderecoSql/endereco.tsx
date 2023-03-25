import { EnderecoProps } from "../../SemanalCard";
import db from "../database";

db.transaction((tx) => {

  tx.executeSql(
    'create table if not exists endereco' +
    '(id_endereco integer primary key not null,' +
    'cep text not null,' +
    'estado text not null,' +
    'cidade text not null,' +
    'bairro text not null,' +
    'logradouro text not null);'
  );
});


const inserir = (obj: EnderecoProps) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        'insert into endereco (id_endereco, CEP, estado, cidade, bairro, logradouro) values (?, ?, ?, ?, ?, ?);',
        [obj.id_endereco, obj.cep, obj.estado, obj.cidade, obj.bairro, obj.logradouro],
        //-----------------------
        (_, { rowsAffected, insertId }) => {
          if (rowsAffected > 0) resolve(insertId);
          else reject("Error inserting obj: " + JSON.stringify(obj)); // insert falhou
        },
        (_, error) => {
          reject( error) // erro interno em tx.executeSql
          return false;
        }
      );
    });
  });
};

const update = (id: number, obj: EnderecoProps) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        "UPDATE endereco SET cep=?, estado=?, cidade=?, bairro=?, logradouro=?  WHERE id_endereco=?;",
        [obj.cep, obj.estado, obj.cidade, obj.bairro, obj.logradouro, id],
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

const encontrar = (id: number): Promise<EnderecoProps> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        "SELECT * FROM endereco WHERE id_endereco=?;",
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

const findByCEP = (cep: string): Promise<EnderecoProps> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        "SELECT * FROM endereco WHERE cep=?;",
        [cep],
        //-----------------------
        (_, { rows }) => {
          if (rows.length > 0) resolve(rows._array[0]);
          else reject("Obj not found: brand=" + cep); // nenhum registro encontrado
        },
        (_, error) => {
          reject(error) // erro interno em tx.executeSql
          return false;
        }
      );
    });
  });
};

const todos = (): Promise<EnderecoProps[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        "SELECT * FROM endereco;",
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
        "DELETE FROM endereco WHERE id_endereco=?;",
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
        "DROP TABLE endereco;",
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
  findByCEP,
  todos,
  remove,
  dropa
}