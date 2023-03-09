
import { StyleSheet } from "react-native";
import { TEMA } from "../../tema/tema";

export const styles = StyleSheet.create({
  container: {

    marginHorizontal: '5%',
    marginVertical: '70%',
  },
  
  input: {
    width: '100%',
    height: 50,
    marginVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: TEMA.COLORS.TEMA_AZUL,
    borderRadius: 5,
  },

  button: {
    width: '100%',
    height: 50,
    borderRadius: 5,
    marginTop: 20,
  },

  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },

  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },

  createAccoutText: {
    color: TEMA.COLORS.TEMA_AZUL,
  },
  
});








