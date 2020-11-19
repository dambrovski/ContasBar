const {query} = require('../database/connectionMysql');
    
module.exports = {
    index(req, res){
        let filter = '';
        if(req.params.idContas) filter = ' WHERE idContas=' + parseInt(req.params.idContas);
        query("SELECT * FROM movimentacao" + filter, function (error, result, field) {
            if (error) {
                res.json(error);
            } else {
                if (result.length > 0){
                    res.json(result);
                }
                else{
                    res.json("Nenhuma movimentação encontrada com essa ID!");
                }
            }
        });
    },

    create(req, res, callBack){
        movimentacao = req;
        //let data = date.dataAtual()
        //console.log(data);
            query(`INSERT INTO movimentacao
            (dataMovimentacao, idContas, idSituacaoFK) 
            VALUES 
            (
            '${movimentacao.dataLanc}','${movimentacao.idContas}', 
            '${movimentacao.idSituacaoFK}')`,
            function (error, result, field) {
                if (error) {
                    console.log("erro")
                    res.json(error);                 
                } else {
                    res.json("Alerta: Movimentação gravada com Sucesso!");
               }
            });
    }
}

