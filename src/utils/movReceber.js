const {query} = require('../database/connectionMysql');

const gravarMov = (req, res) => {
    movimentacao = req;
    movimentacao.dataMovimentacao = '2020-11-14';
    query(`INSERT INTO movimentacao
    (dataMovimentacao, idContas, idSituacaoFK) 
    VALUES(
    '${movimentacao.dataMovimentacao}', '${movimentacao.idContasReceber}', 
    '${movimentacao.idSituacaoFK}')`,
    function (error, result, field) {
        if (error) {
            return (error);
      } 
        else {
            if(movimentacao.idContasReceberSubs != null){
                query(`INSERT INTO movimentacao
                (dataMovimentacao, idContas, idSituacaoFK) 
                VALUES(
                 '${movimentacao.dataMovimentacao}', '${movimentacao.idContasReceberSubs}')`,
                 function (error, result, field) {
                    if (error) {
                        return (error);
                     }
                     else{
                        res.json(movimentacao.texto)
                        console.log("esse foi de substituição")
                     }
                  });
                
            
            }
            res.json(movimentacao.texto)
        }
    });
}


module.exports = {
    gravarMov
};