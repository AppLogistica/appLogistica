import { StyleSheet } from 'react-native';
import { TEMA } from '../../tema/tema';

export const styles = StyleSheet.create({
  Principal: {
    alignItems: "center",
    justifyContent: "center",
  }
  ,
  container: {
    //marginVertical: 15,
    width: "80%",
   // height: 200,
    //flexGrow: 1,
    borderRadius: 8
  },

  footer: {
    flexDirection: 'row',
    width: '100%',
    borderRadius: 8,
  },

  Texto: {
    padding: 16,
    width: '100%',
    borderTopEndRadius: 8,
    borderBottomEndRadius: 8,
  },

  Produtor: {
    fontSize: TEMA.FONT_SIZE.MD,
    fontFamily: TEMA.FONT_FAMILY.SEMI_BOLD,
    marginTop: 15
  },
  
  idSemana: {
    fontFamily: TEMA.FONT_FAMILY.BOLD
  },

  Detalhes: {
    fontSize: TEMA.FONT_SIZE.MD,
    fontFamily: TEMA.FONT_FAMILY.REGULAR,
  },

  Semana: {
    fontSize: TEMA.FONT_SIZE.SM,
    fontFamily: TEMA.FONT_FAMILY.REGULAR,
  },

  Endereco: {
    fontSize: TEMA.FONT_SIZE.MD,
    fontFamily: TEMA.FONT_FAMILY.REGULAR,
    marginTop: 25,
  },

  linha: {
    height: '100%',
    width: 10,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },

  Textmapa: {
    textAlign: 'right',
    color: 'blue'
   
  }

});