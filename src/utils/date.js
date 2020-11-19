const {query} = require('../database/connectionMysql');


const dataAtual = () => {
    //criando data
    var data = new Date(),
    dia  = data.getDate().toString().padStart(2, '0'),
    mes  = (data.getMonth()+1).toString().padStart(2, '0'), 
    ano  = data.getFullYear();
    var dataPedido = ano+'-'+mes+'-'+dia
    return dataAtual;
    //finalizando data
}


module.exports = {
    dataAtual
};