import { StyleSheet } from 'react-native';
import { TEMA } from '../../tema/tema';

export const styles = StyleSheet.create({

  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 25,
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

  containerView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  containerViewView:{
    marginVertical: 10,
  },

  buttonLocal: {
    height: 46,
    borderRadius: 6,
    backgroundColor: TEMA.COLORS.TEMA_AZUL,
    width: '45%'
  },

  buttonConfirma: {
    width: '47%',
    height: 50,
    borderRadius: 5,
    backgroundColor: TEMA.COLORS.TEMA_AZUL,
  },


  buttonCancela: {
    width: '47%',
    height: 50,
    borderRadius: 5,
    backgroundColor: TEMA.COLORS.TEMA_AZUL,
  },

  buttonPdf: {
    width: '100%',
    height: 50,
    borderRadius: 5,
    backgroundColor: TEMA.COLORS.TEMA_AZUL,
  },

  buttonFinalizar: {
    width: '100%',
    height: 50,
    borderRadius: 5,
    backgroundColor: TEMA.COLORS.TEMA_AZUL,
  },

  comboBoxTouch: {
    marginBottom: 10,
    marginTop: 10,
  },

  modalView: {
    backgroundColor: 'black',
    opacity: 0.8,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  viewFlatList: {
    marginVertical: '50%',
  },

  flatListTouch: {
    width: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
  },

  flatListTouchText: {
    marginTop: 10,
    marginBottom: 10
  },
});