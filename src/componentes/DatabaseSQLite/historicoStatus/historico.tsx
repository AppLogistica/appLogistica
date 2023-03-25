import { FornecedorProps, Historico } from "../../SemanalCard";
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
        'create table if not exists historicoStatus' +
        '(id INTEGER PRIMARY KEY AUTOINCREMENT,' +
        'id_HistóricoSemana text not null,' +
        'id_caixa integer not null,' +
        'status text not null,' +
        'local text not null,' +
        'data text not null,' +
        'hora text not null);',
    );
});

const inserir = (obj: Historico) => {
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            //comando SQL modificável
            tx.executeSql(
                'insert into historicoStatus (id_HistóricoSemana, id_caixa, status, local, data, hora) values (?, ?, ?, ?, ?, ?, ?);',
                [obj.id_HistóricoSemana, obj.id_caixa, obj.status, obj.local, obj.data, obj.hora],
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

const update = (id: number, obj: Historico) => {
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            //comando SQL modificável
            tx.executeSql(
                // 'insert into historicoStatus (id, id_HistóricoSemana, id_caixa, status, local, data, hora) values (?, ?, ?, ?, ?, ?, ?);',
                "UPDATE historicoStatus SET id=?, id_caixa=?, status=?, local=?, data=?, hora=? WHERE id_HistóricoSemana=?;",
                [obj.id, obj.id_caixa, obj.status, obj.local, obj.data, obj.hora, obj.id_HistóricoSemana],
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

const encontrar = (id: number): Promise<Historico> => {
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            //comando SQL modificável
            tx.executeSql(
                // 'insert into historicoStatus (id, id_HistóricoSemana, id_caixa, status, local, data, hora) values (?, ?, ?, ?, ?, ?, ?);',
                "SELECT * FROM historicoStatus WHERE id_HistóricoSemana=?;",
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

const findByFornecedor = (nome: string): Promise<Historico[]> => {
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            //comando SQL modificável
            tx.executeSql(
                // 'insert into historicoStatus (id, id_HistóricoSemana, id_caixa, status, local, data, hora) values (?, ?, ?, ?, ?, ?, ?);',
                "SELECT * FROM historicoStatus WHERE brand LIKE ?;",
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


const todos = (): Promise<Historico[]> => {
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            //comando SQL modificável
            tx.executeSql(
                // 'insert into historicoStatus (id, id_HistóricoSemana, id_caixa, status, local, data, hora) values (?, ?, ?, ?, ?, ?, ?);',
                "SELECT * FROM historicoStatus;",
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
                // 'insert into historicoStatus (id, id_HistóricoSemana, id_caixa, status, local, data, hora) values (?, ?, ?, ?, ?, ?, ?);',
                "DELETE FROM historicoStatus WHERE id_HistóricoSemana=?;",
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
                // 'insert into historicoStatus (id, id_HistóricoSemana, id_caixa, status, local, data, hora) values (?, ?, ?, ?, ?, ?, ?);',
                "DROP TABLE historicoStatus;",
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