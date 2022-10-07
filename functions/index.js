/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * Copied from below and modified
 * https://github.com/firebase/functions-samples/blob/main/authorized-https-endpoint/functions/index.js
 */
const { https } = require('firebase-functions');
const { initializeApp } = require('firebase-admin/app');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const validateFirebaseIdToken = require('./middleware/auth');
const trueLayerMiddleware = require('./truelayer/middleware');
const connectionsApi = require('./routes/connections');
const periodsApi = require('./routes/periods');
// const bankConnectionsApi = require('./routes/bank-connections');
// const deleteApi = require('./routes/delete');
// const accountsApi = require('./routes/accounts');
// const balanceApi = require('./routes/balance');
// const transactionsApi = require('./routes/transactions');

const app = express();
initializeApp();

app.use(cors({origin: true}));
app.use(cookieParser());
app.use(validateFirebaseIdToken);

app.use('/connections', connectionsApi);
app.use('/periods', periodsApi);

// app.use('/bank-connections', bankConnectionsApi);

// app.use('/delete', deleteApi);

// app.use('/accounts', trueLayerMiddleware, accountsApi);
// app.use('/balance', trueLayerMiddleware, balanceApi);
// app.use('/transactions', trueLayerMiddleware, transactionsApi);

app.get('/whoami', (req, res) => {
  res.json(req.user);
});

app.use((req, res, next) => {
  res.status(404);
  res.send();
});

exports.api = https.onRequest(app);