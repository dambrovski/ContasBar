const express = require('express');
const cors = require('cors')


const MovimentacaoController = require('./controllers/MovimentacaoController');
const ContasPagarController = require('./controllers/ContasPagarController');
const ContasReceberController = require('./controllers/ContasReceberController');



const routes = express.Router();

routes.get('/', ContasPagarController.index);

routes.post('/contaspagar/create', ContasPagarController.create);
routes.post('/contaspagar/liquida', ContasPagarController.liquida);
routes.post('/contaspagar/cancela', ContasPagarController.cancela);
routes.get('/contaspagar', ContasPagarController.index);

routes.post('/contasreceber/create', ContasReceberController.create);
routes.post('/contasreceber/liquida', ContasReceberController.liquida);
routes.post('/contasreceber/cancela', ContasReceberController.cancela);
routes.get('/contasreceber', ContasReceberController.index);

routes.post('/movimentacao/', MovimentacaoController.create);
routes.get('/movimentacao/:idContas', MovimentacaoController.index);




module.exports = routes;





