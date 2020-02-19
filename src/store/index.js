import Vue from "vue";
import Vuex from "vuex";


import Carriles from './Modulos/Carriles'
import Refacciones from './Modulos/Refacciones'
import DTC from './Modulos/DTC'
import Inventario from './Modulos/Inventario'


Vue.use(Vuex)

export default new Vuex.Store({

  modules:{

    DTC,
    Carriles,
    Refacciones,
    Inventario    
    
  }

})
