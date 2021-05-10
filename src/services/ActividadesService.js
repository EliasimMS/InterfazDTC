import store from '../store/index'
import moment from "moment";
import Axios from 'axios'
const API = process.env.VUE_APP_URL_API_PRODUCCION

async function filtrar_actividades_mensuales(mes, año, tipoCalendario, status, carril, ref){        
    let user = await store.getters['Login/GET_USEER_ID_PLAZA_ID']
    let nombrePlaza = store.state.Login.plazaSelecionada.plazaNombre    
    store.dispatch('Refacciones/BUSCAR_CARRILES',user.numPlaza)
    if(mes == undefined && año == undefined){
        let fecha_comodin = new Date()
        mes = fecha_comodin.getMonth() + 1,
        año = fecha_comodin.getFullYear()
    }       
    let listaActidadesTipo = []    
    if(ref != undefined){
        //alert()
        let objApi = { "userId": user.idUser, "squareId": user.numPlaza, "month": mes, "year": año,}   
        let plazasUserSinRepetir = []
        let concentradoActividades = []
        store.state.Login.cookiesUser.plazasUsuario.forEach(plaza => {
            if(plazasUserSinRepetir.find(item => item.numeroPlaza == plaza.numeroPlaza) == undefined){
                plazasUserSinRepetir.push(plaza)
            }
        })        
        console.log({ plazasUserSinRepetir, objApi})
        plazasUserSinRepetir.forEach((item) => {
            console.log(item)
            objApi['squareId'] = item.numeroPlaza
            Axios.post(`${API}/Calendario/ActividadMesYear/${item.referenciaPlaza}`,objApi)
            .then((response) => {                               
                response.data.result.forEach(item => concentradoActividades.push(item))
                store.commit("Actividades/ACTIVIDADES_MENSUALES_MUTATION", response.data.result)                
                console.log(response.data.result)
            })
            .catch(error => {
                store.commit("Actividades/ACTIVIDADES_MENSUALES_MUTATION", [])  
                console.log(error)                                                      
            });
        })
        setTimeout( () =>{            
            concentradoActividades.forEach(item => {
                if(item.referenceNumber.toUpperCase().includes(ref)){
                    listaActidadesTipo.push(item)
                }
            })         
        }, 1000)
    }
    else{   
        let objApi = { "userId": user.idUser, "squareId": user.numPlaza, "month": mes, "year": año,}   
        await store.dispatch('Actividades/OBTENER_ACTIVIDADES_MESNUALES', objApi) 
        listaActidadesTipo = tipoCalendario === false 
        ? await store.getters['Actividades/GET_ACTIVIDADES_MENSUALES'](objApi)
        : eventos_calendario_formato(objApi)         
        console.log(listaActidadesTipo)        
        if (status === true || status === false){ 
            //alert('status')                 
            listaActidadesTipo = listaActidadesTipo.filter(item => item.statusMaintenance == status)            
            //console.log(listaActidadesTipo)                
        }
        console.log(carril)
        if (carril != undefined){  
            //alert('carril')      
            listaActidadesTipo = listaActidadesTipo.filter(item => item.lane.split('-')[0] == carril)
        }
    }
    
    let obj = {
        listaActividadesMensuales: listaActidadesTipo,
        plazaNombre: nombrePlaza,
        comentario: store.state.Actividades.comentarioMensual, 
        plazaSelect: user.numPlaza,
        mes: mes,
        año: año,
        mesNombre: numero_to_nombre(mes)         
    }    
    return obj
}
function eventos_calendario_formato(objApi){
    let eventoSinFormato = store.getters['Actividades/GET_ACTIVIDADES_MENSUALES'](objApi)
    let catalogoActividades = store.state.Actividades.catalogoActividades
    let eventsReturn = []
    var i = 1;
    let eventoReducidoDay = [];       
    while (i < 32) {
        let query = eventoSinFormato.filter(
            (item) => item.day.split('/')[0] == i
        );                
        for (let actividad of catalogoActividades) {                         
            let _itemFilter = query.filter(itemfilter => {
                return parseInt(itemfilter.frequencyId) == actividad.value
            })                               
            if(_itemFilter.length > 0) {                            
                eventoReducidoDay.push(_itemFilter);
            }
        }
        i++;
    }        
    for (let item of eventoReducidoDay) {  
        eventsReturn.push(construir_objeto_actividad(item, item[0]))
    }
    return eventsReturn.flat()
}
function construir_objeto_actividad(listaCarriles, info){
    let carriles = []    
    for (let carril of listaCarriles) {
        carriles.push({
            lane: carril.lane,
            capufeLaneNum: carril.capufeLaneNum,
            idGare: carril.idGare,
            calendarId: parseInt(carril.calendarId)
        });
    }       
    return {                        
        start: moment(info.day, "DD/MM/YYYY").format("YYYY-MM-DD"), 
        tipoActividad: codigo_colores_actividad(info.frequencyId).nombre,
        title: 'Actividad' + ' ' + codigo_colores_actividad(info.frequencyId).nombre,                   
        carriles: carriles,            
        end: moment(info.day, "DD/MM/YYYY").format("YYYY-MM-DD"),   
        class: codigo_colores_actividad(info.frequencyId).css,                            
    }    
}
function objeto_actividad_insertar(listaCarriles, info){
    let idGares = []
    console.log(info);
    let capufeLaneNum = []
    let daySplit = info.day.split('/')
    let user = store.getters['Login/GET_USEER_ID_PLAZA_ID']
    for (let carril of listaCarriles) {
        idGares.push(carril.idGare);
        capufeLaneNum.push(carril.capufeLaneNum);
    }    
    let obj = {};       
    obj["frequencyId"] = info.frequencyId,
    obj["capufeLaneNums"] = capufeLaneNum,
    obj["idGares"] = idGares,
    obj["squareId"] = user.numPlaza,
    obj["userId"] = user.idUser,
    obj["day"] = parseInt(daySplit[0]),
    obj["month"] = parseInt(daySplit[1]),
    obj["year"] = parseInt(daySplit[2])    
    return obj
}
const MESES = [{"nombre": "ENERO", "numero": 1},
                {"nombre": "FEBRERO", "numero": 2},
                {"nombre": "MARZO", "numero": 3},
                {"nombre": "ABRIL", "numero": 4},
                {"nombre": "MAYO", "numero": 5},
                {"nombre": "JUNIO", "numero": 6},
                {"nombre": "JULIO", "numero": 7},
                {"nombre": "AGOSTO", "numero": 8},
                {"nombre": "SEPTIEMBRE", "numero": 9},
                {"nombre": "OCTUBRE", "numero": 10},
                {"nombre": "NOVIEMBRE", "numero": 11},
                {"nombre": "DICIEMBRE", "numero": 12}
            ]
const nombre_to_numero = function(_mes){    
    return MESES.find(mes => mes.nombre == _mes.toUpperCase()).numero
}
const numero_to_nombre = function(_numero){
    return MESES.find(mes => mes.numero == _numero).nombre
}
function codigo_colores_actividad(frequencyId){
    switch(parseInt(frequencyId)) {
        case 1:
            return { css: 'ActividadSemanal', nombre: 'Semanal' }
        case 2:
            return { css: 'ActividadMensual', nombre: 'Mensual' }                    
        case 3:
            return { css: 'ActividadTrimestral', nombre: 'Trimestral' }                                
        case 4:
            return { css: 'ActividadSemestral', nombre: 'Semestral' }                                           
        case 5:
            return { css: 'ActividadAnual', nombre: 'Anual' }                                                       
        default:
            break;
    }
}
export default{
    filtrar_actividades_mensuales, 
    construir_objeto_actividad,
    objeto_actividad_insertar,
    nombre_to_numero,
    numero_to_nombre,    
}