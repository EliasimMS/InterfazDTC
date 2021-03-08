import store from '../store/index'
import router from '../router/index'
function formato_cookies_usuario(loginSesion, tipoUsuario){    
    let plazasUsuario = loginSesion.cookie.map(item => {
        return {
            refereciaPlaza: item.referenceSquare,
            administradorId: item.adminSquareId,
            numeroPlaza: item.squareCatalogId,
            plazaNombre: item.squareName
        }
    })    
    let rollNombre = tipoUsuario.find(tipoUser => tipoUser.id == loginSesion.cookie[0].rollId).nombre
    let userValido = plazasUsuario.length > 0 ? true : false
    let cookies = {
        rollId: loginSesion.cookie[0].rollId,
        nombreRoll: rollNombre,
        userId: loginSesion.cookie[0].userId,
        plazasUsuario: plazasUsuario,
        registrado: userValido
    }        
    localStorage.clear()    
    localStorage.setItem('cookiesUser', JSON.stringify(cookies));  
    localStorage.setItem('token', JSON.stringify(loginSesion.userToken)) 
    return cookies 
}
async function actualizar_plaza(plazaSelect, listaPlazas, listaHeaders, soloReferencia){
    if(soloReferencia != undefined){        
        try{        
        listaPlazas = store.state.Login.cookiesUser.plazasUsuario        
        listaHeaders = store.state.Header.listaHeaders        
        let plazaSelect = listaPlazas.find(plaza => plaza.refereciaPlaza == soloReferencia)             
        let convenioSelect = listaHeaders.find(header => header.referenceSquare == soloReferencia)
        await store.commit('Login/PLAZA_SELECCIONADA_MUTATION', plazaSelect)                                                
        let objConvenio = {
            id: null,
            numPlaza: plazaSelect.numeroPlaza,
            numConvenio: convenioSelect.agrement,
            idConvenio: convenioSelect.agremmentInfoId,
        }                            
        await store.commit('Header/CONVENIO_ACTUAL_MUTATION', objConvenio)
        await store.commit('Header/HEADER_SELECCIONADO_MUTATION',convenioSelect)
        await store.dispatch('Refacciones/FULL_COMPONETES', objConvenio)
        return {
            plazaSelect,
            convenioSelect,                    
        }
        }
        catch(error) {
            alert()
            console.log(error)
        }

    }
    else if(plazaSelect == undefined){        
        listaPlazas = store.state.Login.cookiesUser.plazasUsuario
        listaHeaders = store.state.Header.listaHeaders        
        let plazaSelect = listaPlazas[0]           
        let convenioSelect = listaHeaders.find(header => header.referenceSquare == plazaSelect.refereciaPlaza)
        await store.commit('Login/PLAZA_SELECCIONADA_MUTATION', plazaSelect)                                                
        let objConvenio = {
            id: null,
            numPlaza: plazaSelect.numeroPlaza,
            numConvenio: convenioSelect.agrement,
            idConvenio: convenioSelect.agremmentInfoId,
        }                             
        await store.commit('Header/CONVENIO_ACTUAL_MUTATION', objConvenio)
        await store.commit('Header/HEADER_SELECCIONADO_MUTATION',convenioSelect)
        await store.dispatch('Refacciones/FULL_COMPONETES', objConvenio)
        return {
            plazaSelect,
            convenioSelect,                    
        }
    }
    else{
        store.commit('Login/PLAZA_SELECCIONADA_MUTATION', plazaSelect)  
        let convenioSelect = listaHeaders.find(header => header.referenceSquare == plazaSelect.refereciaPlaza)                                         
        let objConvenio = {
            id: null,
            numPlaza: plazaSelect.numeroPlaza,
            numConvenio: convenioSelect.agrement,
            idConvenio: convenioSelect.agremmentInfoId,
        }                      
        await store.commit('Header/CONVENIO_ACTUAL_MUTATION', objConvenio)
        await store.commit('Header/HEADER_SELECCIONADO_MUTATION',convenioSelect)
        await store.dispatch('Refacciones/FULL_COMPONETES', objConvenio)
        return convenioSelect
    }
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
    let headerUser = JSON.parse(localStorage.getItem('listaHeaderUser'))   
    if(datosUserCookies != null && headerUser != null){ 
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
    router.push('/SesionExpirada')
}
export default{
    formato_cookies_usuario,
    actualizar_plaza,
    obtener_bearer_token,
    token_no_autorizado,
    cache_token
}