import Axios from "axios";
import CookiesService from '../../services/CookiesService'

const API = process.env.VUE_APP_URL_API_PRODUCCION

const state = {
  listaHeaderDtcUser: null,
  listaPlazas: [],
  cookiesUser: {},
  listaTec: [],
  plazaSelecionada: {},
  PLAZAELEGIDA: 0,
  tipoUsuario: [
    {id: 1, nombre: 'Tecnico'},
    {id: 2, nombre: 'Supervisor'},
    {id: 3, nombre: 'Sistemas'},
    {id: 4, nombre: 'Administracion'},
    {id: 5, nombre: 'Supervisor Sistemas'},
    {id: 6, nombre: 'Almacen'},
    {id: 7, nombre: 'CAPUFE'},
    {id: 8, nombre: 'Contabilidad'},
    {id: 9, nombre: 'Documentacion'},
    {id: 10, nombre: 'Desarrollo'},
  ]
};
const getters = {
  getUserForDTC: () => {
    return {
      numPlaza: state.plazaSelecionada.numeroPlaza,
      idUser: state.cookiesUser.userId
    }
  },
  getUser: () => state.listaHeaderDtcUser,
  GET_USER_IS_LOGIN: () => state.cookiesUser.registrado,
  getReferenceSquareActual: () => state.cookiesUser.plazasUsuario[state.PLAZAELEGIDA].refereciaPlaza,
  getReferenceSquareNombre: (state) => (nombrePlaza) =>  state.cookiesUser.plazasUsuario.find(item => item.plazaNombre ==  nombrePlaza),
  getTypeUser: () => state.cookiesUser.rollId,  
  getPlaza: () => state.listaPlazas.find(item => item.squareCatalogId == state.cookiesUser.plazasUsuario[state.PLAZAELEGIDA].numeroPlaza)
};
const mutations = {
  PLAZA_SELECCIONADA_MUTATION: (state, value) => state.plazaSelecionada = value,
  PLAZAELEGIDAMUTATION: (state, value) => state.PLAZAELEGIDA = value,
  LISTA_PLAZAS_MUTATION: (state, value) => state.listaPlazas = value,
  COOKIES_USER_MUTATION: (state, value) => state.cookiesUser = value,
  LISTA_TECNICOS_MUTATION: (state, value) => state.listaTec = value,
  cleanOut: (state) => {
    state.listaHeaderDtcUser = []
    state.listaPlazas = []
    state.cookiesUser = []
  },
  LISTA_HEADER_PLAZA_USER: (state, value) => {
    state.listaHeaderDtcUser = value,
    state.PLAZAELEGIDA = 0
  },  
  PLAZAELEGIDAFINDMUTATION: (state, value) => {    
    let index = state.listaHeaderDtcUser.findIndex(item => item.referenceSquare == value)    
    if(index != -1){
      state.PLAZAELEGIDA = index
    }
  }
};
const actions = {
  //CONSULTA PARA OBTENER DTCHEADER POR ID TECNICO
  async BUSCAR_HEADER_OTRO_TECNICO({ commit }, value) {
    await Axios.get(`${API}/login/buscarHeaderTec/${value}`)
      .then(response => {
        commit("LISTA_HEADER_PLAZA_USER", response.data.result);
      })
      .catch(Ex => {
        console.log(Ex);
      });
  },
  //CONSULTA PARA LISTAR TODOS LO TECNICOS DE UNA PLAZA
  async BUSCAR_TECNICOS_PLAZA({ commit }, value) {
    await Axios.get(`${API}/login/buscarTec/${value}`)
      .then(response => {
        commit("LISTA_TECNICOS_MUTATION", response.data.result);
      })
      .catch(Ex => {
        console.log(Ex);
      });
  },
  //CONSULTA PARA SABER SI EL USUARIO ESTA REGISTRADO
  async BUSCAR_COOKIES_USUARIO({ commit }, value) { 
    let objLogin = {
      username: value.User,
      password: value.Password,
      flag: true
    }   
    console.log(objLogin)    
    await Axios.post(`${API}/login/ValidUser`,objLogin)
      .then(response => {
        if (response.data.result != null) {         
          commit("COOKIES_USER_MUTATION",  CookiesService.formato_cookies_usuario(response.data.result, state.tipoUsuario));
        }
        else {
          commit("COOKIES_USER_MUTATION", []);
        }
      })
      .catch(Ex => {
        commit("COOKIES_USER_MUTATION", []);
        console.log(Ex);
      });
  },
  //CONSULTA PARA TENER EL DTCHEADER DEL TECNICO PERSONAL
  async buscarUsuario({ commit }, value) {   
    let objLogin = {
      username: value.User,
      password: value.Password,
      flag: false
    } 
    console.log(objLogin)
    await Axios.post(`${API}/login`,objLogin)
      .then(response => {        
        commit("LISTA_HEADER_PLAZA_USER", response.data.result);
      })
      .catch(Ex => {
        console.log(Ex);
      });
  },
  //CONULTA PARA LISTAR LAS PLAZAS
  async BUSCAR_PLAZAS({ commit }) {
    await Axios.get(`${API}/squaresCatalog`)
      .then(response => {
        commit("LISTA_PLAZAS_MUTATION", response.data.result);
      })
      .catch(Ex => {
        console.log(Ex);
      });
  },
};
export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
