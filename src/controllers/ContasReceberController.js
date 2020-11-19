const {query} = require('../database/connectionMysql');
const {gravarMov} = require('../utils/movReceber');


module.exports = {
    index(req, res){
        let filter = '';
        if(req.params.idContasReceber) filter = ' WHERE idContasReceber=' + parseInt(req.params.idContasReceber);
        query("SELECT * FROM contasReceber" + filter, function (error, result, field) {
            if (error) {
                res.json(error);
            } else {
                res.json(result);
            }
        });
    },

    create(req, res){
        cReceber = req.body; 

        //antes de criar, verificar se o titulo já existe para esse cliente e desse tipo
        filter = " WHERE idDocumento= " + cReceber.idDocumento + " AND idEventoGeradorFK= " + cReceber.idEventoGeradorFK + " AND cpfCnpj='" + cReceber.cpfCnpj + "'" + " AND valorPago is null";    
        query("SELECT * FROM contasReceber" + filter, function (error, result, field) {
        if (result.length < 1){
            //inicia criação do contas a receber baubaus
            query(`INSERT INTO contasReceber
            (dataVenc, dataLanc, idSituacaoFK, idEventoGeradorFK,
            idDocumento, nossoNumero, cpfCnpj, valorOriginal, desconto, juros, mora, observ) 
            VALUES 
            ('${cReceber.dataVenc}','${cReceber.dataLanc}','${cReceber.idSituacaoFK}', 
            '${cReceber.idEventoGeradorFK}','${cReceber.idDocumento}','${cReceber.nossoNumero}', 
            '${cReceber.cpfCnpj}','${cReceber.valorOriginal}','${cReceber.desconto}', 
            '${cReceber.juros}','${cReceber.mora}','${cReceber.observ}')`,
            function (error, resultado, field) {
                if (error) {
                    res.json(error);
                } else {
                    cReceber.texto = "Contas a receber Criado!";
                    let idContas = parseInt(resultado['insertId'])
                    cReceber.idContasReceber = idContas
                    let teste = gravarMov(cReceber, res);
                }
            })
        }else{
            res.json("Erro: Já existe um Contas a receber com este número de documento com essa finalidade para este cliente!");
        }
        });
    },

    liquida(req, res){
        cReceber = req.body; 

        //antes de liquidar, verificar se o titulo existe pra esse cliente e está com valor pago zerado
        filter = " WHERE idDocumento= " + cReceber.idDocumento + " AND valorPago is null"+ " AND cpfCnpj='" + cReceber.cpfCnpj + "'";    
        query("SELECT * FROM contasReceber" + filter, function (error, result, field) { 
        if (result.length > 0){
            if (cReceber.valorPago == result[0].valorOriginal) {
                console.log("valor igual baixar total")
                filter = " WHERE idDocumento= " + cReceber.idDocumento + " AND valorPago is null"+ " AND cpfCnpj='" + cReceber.cpfCnpj + "'";
                query(`UPDATE contasReceber SET valorPago =` +cReceber.valorPago + filter,
                function (error, results, field) {
                    if (error) {
                        console.log(error);
                        res.json("Erro ao baixar contas a receber!")
                    } else {
                        cReceber.texto = "Contas a receber baixado!";
                        cReceber.idSituacaoFK = 3 
                        gravarMov(cReceber, res);
                    }                                                        
                });

            }
            else if(cReceber.valorPago < result[0].valorOriginal){
                result[0].observ = "Substitução do Código Original: " + result[0].idContasReceber + " | Valor Original: " + result[0].valorOriginal + " | Valor Pago: " + cReceber.valorPago;
                result[0].valorOriginal = result[0].valorOriginal - cReceber.valorPago;
                //inicia criação do contas de substituição baubau
            query(`INSERT INTO contasReceber
            (dataVenc, dataLanc, idSituacaoFK, idEventoGeradorFK,
            idDocumento, nossoNumero, cpfCnpj, valorOriginal, desconto, juros, mora, observ) 
            VALUES 
            ('${result[0].dataVenc}','${result[0].dataLanc}','${result[0].idSituacaoFK}', 
            '${result[0].idEventoGeradorFK}','${result[0].idDocumento}','${result[0].nossoNumero}', 
            '${result[0].cpfCnpj}','${result[0].valorOriginal}','${result[0].desconto}', 
            '${result[0].juros}','${result[0].mora}','${result[0].observ}')`,
            function (error, resultado, field) {
                if (error) {
                    res.json(error);
                } else {

                    cReceber.idSituacaoFK = 4
                    let idContasSubs = parseInt(resultado['insertId'])
                    cReceber.idContasReceberSubs = idContasSubs
                    cReceber.texto = "Contas de Substituição Criado! Novo código: " + idContasSubs + " | "+result[0].observ;
                    let teste = gravarMov(cReceber, res);
                }
            })

            }
            else if(cReceber.valorPago > result[0].valorOriginal){
                console.log("valor pago a mais, vou baixar o titulo e recomendar dev. da diferença em creditos") 
                filter = " WHERE idDocumento= " + cReceber.idDocumento + " AND valorPago is null"+ " AND cpfCnpj='" + cReceber.cpfCnpj + "'";
             
                query(`UPDATE contasReceber SET valorPago =` +result[0].valorOriginal + filter,
                function (error, results, field) {
                    if (error) {
                        console.log(error);
                        
                        res.json("Erro ao baixar contas a receber!")
                    } else {
                        cReceber.idSituacaoFK = 3 
                        let credito = cReceber.valorPago - result[0].valorOriginal 
                        cReceber.texto = "Titulo baixado com sucesso! O cliente pagou a mais, tem o direito de R$" + credito + " em créditos!";
                        gravarMov(cReceber, res);
                    }                                                        
                });
                
            }
            else{
                console.log("deu algum ruim")
            }
            //inicia liquidação do contas a receber
   
        }else{
            res.json("Alerta: Nenhum Contas a receber em aberto encontrado com este número!");
        }
        });
    },
    cancela(req, res){
        cReceber = req.body; 

        //antes de cancelar, verificar se o titulo já existe para esse cliente e desse tipo
        filter = " WHERE idDocumento= " + cReceber.idDocumento + " AND idEventoGeradorFK= " + cReceber.idEventoGeradorFK + " AND cpfCnpj='" + cReceber.cpfCnpj + "'" + " AND valorPago is null";    
        query("SELECT * FROM contasReceber" + filter, function (error, result, field) {
        if (result.length > 0){
            //inicia cancelamento baubau
            filter = " WHERE idDocumento= " + cReceber.idDocumento + " AND valorPago is null"+ " AND cpfCnpj='" + cReceber.cpfCnpj + "'";
             
            query(`UPDATE contasReceber SET idSituacaoFK = 2, observ = 'TITULO CANCELADO'`+ filter,
            function (error, results, field) {
                if (error) {
                    console.log(error);
                    res.json("Erro ao cancelar contas a receber!")
                } else {
                    
                    cReceber.idSituacaoFK = 2 
                    cReceber.texto = "Titulo cancelado com sucesso!";
                    gravarMov(cReceber, res);
                }                                                        
            });
        }else{
            res.json("Alerta: Nenhum Contas a Receber em aberto encontrado com este número!");
        }
        });
    },
}