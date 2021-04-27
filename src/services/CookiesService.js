import store from '../store/index'
import router from '../router/index'
import Axios from 'axios'
const API = process.env.VUE_APP_URL_API_PRODUCCION
function formato_cookies_usuario(loginSesion){       
    let cookies = {}
    let tokenUser = {}
    Axios.post(`${API}/login/Cookie`, { userId: loginSesion.userId })
    .then((response) => {         
        let plazasUsuario =  response.data.result.cookie.map(item => {        
            return {
                refereciaPlaza: item.referenceSquare,
                administradorId: item.adminSquareId,
                numeroPlaza: item.squareCatalogId,
                plazaNombre: item.squareName,
                plazaAdminNombre: item.plazaAdministrador,
                statusAdmin: item.statusAdmin
            }
        })          
        tokenUser = response.data.result.userToken
        cookies['plazasUsuario'] = plazasUsuario
        cookies['rollId'] = loginSesion.rolId
        cookies['nombreRoll'] = loginSesion.rolDescription
        cookies['userId'] = loginSesion.userId         
        cookies['registrado'] = cookies.plazasUsuario.length > 0 ? true : false               
        store.dispatch("Login/BUSCAR_PLAZAS");
        Axios.post(`${API}/login/LoginInfo`, { userId: loginSesion.userId })
        .then((response) => {            
            cookies['nombreUsuario'] = response.data.result.loginList[0].nombre
            store.commit("Login/LISTA_HEADER_PLAZA_USER_MUTATION", response.data.result.loginList)             
        })                             
    })
    .catch((error) => {
        console.log(error)
    })    
    localStorage.clear()    
    localStorage.setItem('cookiesUser', JSON.stringify(cookies));  
    localStorage.setItem('token', JSON.stringify(tokenUser))  
    return cookies 
}
async function refrescar_barer_token(){
    localStorage.removeItem('token')
    let objRefresh = { userId: store.state.Login.cookiesUser.userId }     
    await Axios.post(`${API}/login/Refresh`, objRefresh)
    .then((response) => {                
        localStorage.setItem('token', JSON.stringify(response.data.result))        
    })
    .catch(error => {        
        console.log(error) 
    });
}
async function actualizar_plaza(adminId, numeroPlaza){  
    let clousere_actualizar = async (adminId, numPlaza, tipoFiltro)  => {        
        const listaPlazas = store.state.Login.cookiesUser.plazasUsuario
        const listaHeaders = store.state.Header.listaHeaders        
        let plazaSelect = {}
        let convenioSelect = {}
        switch (tipoFiltro) {
            case 1:
                plazaSelect = listaPlazas.find(plaza => plaza.administradorId == adminId)                 
                convenioSelect = listaHeaders.find(header => header.adminSquareId == adminId)                   
                break;
            case 2:
                plazaSelect = listaPlazas[0]           
                convenioSelect = listaHeaders.find(header => header.referenceSquare == plazaSelect.refereciaPlaza && header.adminSquareId == plazaSelect.administradorId)
                break;   
            case 3:
                plazaSelect = listaPlazas.find(plaza => plaza.numeroPlaza == numPlaza) 
                break;  
            default:
                break;
        }
        await store.commit('Login/PLAZA_SELECCIONADA_MUTATION', plazaSelect)                                                
        let objConvenio = { id: null, numPlaza: plazaSelect.numeroPlaza, numConvenio: convenioSelect.agrement, idConvenio: convenioSelect.agremmentInfoId }  
        await store.commit('Header/CONVENIO_ACTUAL_MUTATION', objConvenio)
        await store.commit('Header/HEADER_SELECCIONADO_MUTATION',convenioSelect)
        await store.dispatch('Refacciones/FULL_COMPONETES', objConvenio)                     
        return { plazaSelect, convenioSelect } 
    }    
    if(adminId != undefined)
        return clousere_actualizar(adminId, undefined, 1)       
    else if(adminId == undefined)
        if(numeroPlaza != undefined)
            return clousere_actualizar(adminId, undefined, 2)
        else
            return clousere_actualizar(adminId, undefined, 3)         
}
function obtener_bearer_token(tokenPDF){
    if(tokenPDF == undefined) {
        let tokenData = JSON.parse(localStorage.getItem('token'))            
        let config = {
            headers: { Authorization: `Bearer ${tokenData.token}` }
        };
        return config
    }
    else{
        let tokenData = JSON.parse(localStorage.getItem('token'))  
        return tokenData.token
    }
}
async function cache_token(){    
    let datosUserCookies = JSON.parse(localStorage.getItem('cookiesUser'))        
    let headerUser = {}   
    await Axios.post(`${API}/login/LoginInfo`, { userId: datosUserCookies.userId })
    .then((response) => {                  
        headerUser = response.data.result.loginList
    })    
    if(datosUserCookies != null){         
        await store.commit('Login/COOKIES_USER_MUTATION', datosUserCookies)    
        await store.commit('Login/LISTA_HEADER_PLAZA_USER_MUTATION', headerUser)
        await store.commit('Header/LISTA_HEADERS_MUTATION', headerUser)    
        await actualizar_plaza()    
        await store.dispatch('Login/BUSCAR_PLAZAS')
        await store.dispatch('DTC/BUSCAR_DESCRIPCIONES_DTC')
        await store.dispatch('Header/BUSCAR_LISTA_UNIQUE')
        return true  
    }  
    else{
        return false
    }
}
function token_no_autorizado(){   
    localStorage.clear()
    router.push('/SesionExpirada')
}
export default{
    formato_cookies_usuario,
    actualizar_plaza,
    obtener_bearer_token,
    token_no_autorizado,
    cache_token,
    refrescar_barer_token
}