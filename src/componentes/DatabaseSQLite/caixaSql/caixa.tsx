import { LocationObject } from "expo-location";
import { CaixaProps } from "../../SemanalCard";
import db from "../database";

db.transaction((tx) => {

  tx.executeSql(
    'create table if not exists caixa' +
    '(id_caixa integer primary key,' +
    'nome text(3) not null,' +
    'id_status integer not null,' +
    'id_local integer not null,' +
    'Latitude integer,' +
    'Longitude integer,' +
    'livre boolean,'+
    'FOREIGN KEY (id_status) REFERENCES status (id_status),' +
    'FOREIGN KEY (id_local) REFERENCES local (id_local));'
  );
});

const inserir = (obj: CaixaProps) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        'insert into caixa (id_caixa, nome, id_status, id_local, Latitude, Longitude, livre) values (?, ?, ?, ?, ?, ?, ?);',
        [obj.id_caixa, obj.nome, obj.id_status, obj.id_local, obj.Latitude, obj.Longitude, `${obj.livre}`],
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

const update = (id: number, id_local: number, id_status: number, livre: boolean) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        'UPDATE caixa SET id_local=?, id_status=? WHERE id_caixa=?;',
        [id_local, id_status, id],
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

const updateLivre = (id: number) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        'UPDATE caixa SET livre=? WHERE id_caixa=?;',
        [`${true}`, id],
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

const updateLocalizacao = (id: number, geoLocal: LocationObject | null) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        'UPDATE caixa SET latitude=?, longitude=? WHERE id_caixa=?;',
        [`${geoLocal?.coords.latitude}`, `${geoLocal?.coords.longitude}`, id],
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
    console.log('id_caixa', id);
    
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
        "SELECT * FROM caixa WHERE id_status ?;",
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

const livre = (livre: boolean):Promise<CaixaProps[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        "SELECT * FROM caixa WHERE livre = ?;",
        [`${livre}`],
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

const dropa = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      //comando SQL modificável
      tx.executeSql(
        "DROP TABLE caixa;",
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
  encontrarByStatus,
  todos,
  remove,
  dropa,
  updateLocalizacao,
  livre,
  updateLivre
}