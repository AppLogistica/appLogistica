
import { color } from "native-base/lib/typescript/theme/styled-system";
import { StyleSheet } from "react-native";
import { TEMA } from "../../tema/tema";

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  Data: {
    fontSize: TEMA.FONT_SIZE.LG,
  },

  Seta: {
    fontSize: 20,
  },

  DiaSemana: {

    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: TEMA.COLORS.TEMA_AZUL,
  },

  TextDiaSemana: {
    fontSize: 20,
    marginVertical: 5,
  },

  contentList: {
    paddingBottom: 150
  }

});








