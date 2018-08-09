let express = require('express');
let router = express.Router();
let axios = require('axios');
let RateLimit = require('express-rate-limit');

let WormholeHTTP = axios.create({
  baseURL: process.env.RPC_BASEURL
});
let username = process.env.RPC_USERNAME;
let password = process.env.RPC_PASSWORD;

let config = {
  rawTransactionsRateLimit1: undefined,
  rawTransactionsRateLimit2: undefined,
  rawTransactionsRateLimit3: undefined,
  rawTransactionsRateLimit4: undefined,
  rawTransactionsRateLimit5: undefined,
  rawTransactionsRateLimit6: undefined,
};

let i = 1;
while(i < 7) {
  config[`rawTransactionsRateLimit${i}`] = new RateLimit({
    windowMs: 60*60*1000, // 1 hour window
    delayMs: 0, // disable delaying - full speed until the max limit is reached
    max: 60, // start blocking after 60 requests
    handler: function (req, res, /*next*/) {
      res.format({
        json: function () {
          res.status(500).json({ error: 'Too many requests. Limits are 60 requests per minute.' });
        }
      });
    }
  });
  i++;
}

router.get('/', config.rawTransactionsRateLimit1, (req, res, next) => {
  res.json({ status: 'dataRetrieval' });
});

router.post('/change/:rawtx/:prevTxs/:destination/:fee', config.rawTransactionsRateLimit2, (req, res, next) => {
  let query;
  if(req.query.query) {
    query = req.query.query;
  }

  WormholeHTTP({
    method: 'post',
    auth: {
      username: username,
      password: password
    },
    data: {
      jsonrpc: "1.0",
      id:"whc_createrawtx_change",
      method: "whc_createrawtx_change",
      params: [
        req.params.rawtx,
        JSON.parse(req.params.prevTxs),
        req.params.destination,
        parseFloat(req.params.fee),
        query
      ]
    }
  })
  .then((response) => {
    res.json(response.data.result);
  })
  .catch((error) => {
    res.send(error.response.data.error.message);
  });
});

router.post('/input/:rawTx/:txid/:n', config.rawTransactionsRateLimit3, (req, res, next) => {

  WormholeHTTP({
    method: 'post',
    auth: {
      username: username,
      password: password
    },
    data: {
      jsonrpc: "1.0",
      id:"whc_createrawtx_input",
      method: "whc_createrawtx_input",
      params: [
        req.params.rawTx,
        req.params.txid,
        parseInt(req.params.n)
      ]
    }
  })
  .then((response) => {
    res.json(response.data.result);
  })
  .catch((error) => {
    res.send(error.response.data.error.message);
  });
});

router.post('/opReturn/:rawTx/:payload', config.rawTransactionsRateLimit4, (req, res, next) => {

  WormholeHTTP({
    method: 'post',
    auth: {
      username: username,
      password: password
    },
    data: {
      jsonrpc: "1.0",
      id:"whc_createrawtx_opreturn",
      method: "whc_createrawtx_opreturn",
      params: [
        req.params.rawTx,
        req.params.payload
      ]
    }
  })
  .then((response) => {
    res.json(response.data.result);
  })
  .catch((error) => {
    res.send(error.response.data.error.message);
  });
});

router.post('/reference/:rawTx/:destination', config.rawTransactionsRateLimit5, (req, res, next) => {
  let amount;
  if(req.query.amount) {
    amount = req.query.amount;
  }

  WormholeHTTP({
    method: 'post',
    auth: {
      username: username,
      password: password
    },
    data: {
      jsonrpc: "1.0",
      id:"whc_createrawtx_reference",
      method: "whc_createrawtx_reference",
      params: [
        req.params.rawTx,
        req.params.destination,
        amount
      ]
    }
  })
  .then((response) => {
    res.json(response.data.result);
  })
  .catch((error) => {
    res.send(error.response.data.error.message);
  });
});

router.get('/decodeTransaction/:rawTx', config.rawTransactionsRateLimit6, (req, res, next) => {
  let prevTxs;
  if(req.query.prevTxs) {
    prevTxs = req.query.prevTxs;
  }
  let height;
  if(req.query.height) {
    height = req.query.height;
  }

  WormholeHTTP({
    method: 'post',
    auth: {
      username: username,
      password: password
    },
    data: {
      jsonrpc: "1.0",
      id:"whc_decodetransaction",
      method: "whc_decodetransaction",
      params: [
        req.params.rawTx,
        prevTxs,
        height
      ]
    }
  })
  .then((response) => {
    res.json(response.data.result);
  })
  .catch((error) => {
    res.send(error.response.data.error.message);
  });
});

module.exports = router;
