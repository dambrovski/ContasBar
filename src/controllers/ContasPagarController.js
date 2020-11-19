const {query} = require('../database/connectionMysql');
const {gravarMov} = require('../utils/movPagar');


module.exports = {
    index(req, res){
        let filter = '';
        if(req.params.idContasPagar) filter = ' WHERE idContasPagar=' + parseInt(req.params.idContasPagar);
        query("SELECT * FROM contasPagar" + filter, function (error, result, field) {
            if (error) {
                res.json(error);
            } else {
                res.json(result);
            }
        });
    },

    create(req, res){
        cPagar = req.body; 

        //antes de criar, verificar se o titulo já existe para esse cliente e desse tipo
        filter = " WHERE idDocumento= " + cPagar.idDocumento + " AND idEventoGeradorFK= " + cPagar.idEventoGeradorFK + " AND cpfCnpj='" + cPagar.cpfCnpj + "'" + " AND valorPago is null";    
        query("SELECT * FROM contasPagar" + filter, function (error, result, field) {
        if (result.length < 1){
            //inicia criação do contas a pagar baubaus
            query(`INSERT INTO contasPagar
            (dataVenc, dataLanc, idSituacaoFK, idEventoGeradorFK,
            idDocumento, nossoNumero, cpfCnpj, valorOriginal, desconto, juros, mora, observ) 
            VALUES 
            ('${cPagar.dataVenc}','${cPagar.dataLanc}','${cPagar.idSituacaoFK}', 
            '${cPagar.idEventoGeradorFK}','${cPagar.idDocumento}','${cPagar.nossoNumero}', 
            '${cPagar.cpfCnpj}','${cPagar.valorOriginal}','${cPagar.desconto}', 
            '${cPagar.juros}','${cPagar.mora}','${cPagar.observ}')`,
            function (error, resultado, field) {
                if (error) {
                    res.json(error);
                } else {
                    cPagar.texto = "Contas a pagar Criado!";
                    let idContas = parseInt(resultado['insertId'])
                    cPagar.idContasPagar = idContas
                    let teste = gravarMov(cPagar, res);
                }
            })
        }else{
            res.json("Erro: Já existe um Contas a Pagar com este número de documento com essa finalidade para este cliente!");
        }
        });
    },

    liquida(req, res){
        cPagar = req.body; 

        //antes de liquidar, verificar se o titulo existe pra esse cliente e está com valor pago zerado
        filter = " WHERE idDocumento= " + cPagar.idDocumento + " AND valorPago is null"+ " AND cpfCnpj='" + cPagar.cpfCnpj + "'";    
        query("SELECT * FROM contasPagar" + filter, function (error, result, field) { 
        if (result.length > 0){
            if (cPagar.valorPago == result[0].valorOriginal) {
                console.log("valor igual baixar total")
                filter = " WHERE idDocumento= " + cPagar.idDocumento + " AND valorPago is null"+ " AND cpfCnpj='" + cPagar.cpfCnpj + "'";
                query(`UPDATE contasPagar SET valorPago =` +cPagar.valorPago + filter,
                function (error, results, field) {
                    if (error) {
                        console.log(error);
                        res.json("Erro ao baixar contas a pagar!")
                    } else {
                        cPagar.texto = "Contas a pagar baixado!";
                        cPagar.idSituacaoFK = 3 
                        gravarMov(cPagar, res);
                    }                                                        
                });

            }
            else if(cPagar.valorPago < result[0].valorOriginal){
                result[0].observ = "Substitução do Código Original: " + result[0].idContasPagar + " | Valor Original: " + result[0].valorOriginal + " | Valor Pago: " + cPagar.valorPago;
                result[0].valorOriginal = result[0].valorOriginal - cPagar.valorPago;
                //inicia criação do contas de substituição baubau
            query(`INSERT INTO contasPagar
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

                    cPagar.idSituacaoFK = 4
                    let idContasSubs = parseInt(resultado['insertId'])
                    cPagar.idContasPagarSubs = idContasSubs
                    cPagar.texto = "Contas de Substituição Criado! Novo código: " + idContasSubs + " | "+result[0].observ;
                    let teste = gravarMov(cPagar, res);
                }
            })

            }
            else if(cPagar.valorPago > result[0].valorOriginal){
                console.log("valor pago a mais, vou baixar o titulo e recomendar dev. da diferença em creditos") 
                filter = " WHERE idDocumento= " + cPagar.idDocumento + " AND valorPago is null"+ " AND cpfCnpj='" + cPagar.cpfCnpj + "'";s
             
                query(`UPDATE contasPagar SET valorPago =` +result[0].valorOriginal + filter,
                function (error, results, field) {
                    if (error) {
                        console.log(error);
                        
                        res.json("Erro ao baixar contas a pagar!")
                    } else {
                        cPagar.idSituacaoFK = 3 
                        let credito = cPagar.valorPago - result[0].valorOriginal 
                        cPagar.texto = "Titulo baixado com sucesso! O cliente pagou a mais, tem o direito de R$" + credito + " em créditos!";
                        gravarMov(cPagar, res);
                    }                                                        
                });
                
            }
            else{
                console.log("deu algum ruim")
            }
            //inicia liquidação do contas a pagar
   
        }else{
            res.json("Alerta: Nenhum Contas a Pagar em aberto encontrado com este número!");
        }
        });
    },
    cancela(req, res){
        cPagar = req.body; 

        //antes de cancelar, verificar se o titulo já existe para esse cliente e desse tipo
        filter = " WHERE idDocumento= " + cPagar.idDocumento + " AND idEventoGeradorFK= " + cPagar.idEventoGeradorFK + " AND cpfCnpj='" + cPagar.cpfCnpj + "'" + " AND valorPago is null";    
        query("SELECT * FROM contasPagar" + filter, function (error, result, field) {
        if (result.length > 0){
            //inicia cancelamento baubau
            filter = " WHERE idDocumento= " + cPagar.idDocumento + " AND valorPago is null"+ " AND cpfCnpj='" + cPagar.cpfCnpj + "'";
             
            query(`UPDATE contasPagar SET idSituacaoFK = 2, observ = 'TITULO CANCELADO'`+ filter,
            function (error, results, field) {
                if (error) {
                    console.log(error);
                    res.json("Erro ao cancelar contas a pagar!")
                } else {
                    
                    cPagar.idSituacaoFK = 2 
                    cPagar.texto = "Titulo cancelado com sucesso!";
                    gravarMov(cPagar, res);
                }                                                        
            });
        }else{
            res.json("Alerta: Nenhum Contas a Pagar em aberto encontrado com este número!");
        }
        });
    },
}