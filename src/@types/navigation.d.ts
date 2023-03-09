
import { SemanalProps, SemanaProps } from "../componentes/SemanalCard"

export declare global {
  namespace ReactNavigation {
    interface RootParamList {

      login: undefined;

      semanal: {
        email:    string;
        password: string;
        admin:    Number;
      };

      semanalDetalhes: SemanaProps;

      historicoStatus: SemanaProps;
    }
  }
}