const axios = require('axios');
const qs = require('qs');

const TRUELAYER_CONFIG = {
  client_id: process.env.TRUELAYER_CLIENT_ID,
  client_secret: process.env.TRUELAYER_CLIENT_SECRET,
};

const TRUELAYER_AUTH_ROOT = 'https://auth.truelayer.com';
const TRUELAYER_API_ROOT = 'https://api.truelayer.com/data/v1';

const exchangeCodeForToken = async (code, redirect_uri) => {
  const response = await axios({
    method: 'post',
    url: `${TRUELAYER_AUTH_ROOT}/connect/token`,
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      ...TRUELAYER_CONFIG,
      grant_type: 'authorization_code',
      redirect_uri,
      code
    }
  });
  return response.data;
};

const generateAccessToken = async () => {
  const response = await axios({
    method: 'post',
    url: `${TRUELAYER_AUTH_ROOT}/connect/token`,
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      ...TRUELAYER_CONFIG,
      grant_type: 'client_credentials',
      scope: 'payments'
    }
  });
  return response;
}

/**
 * Used to refresh an access token pre-flight
 * @param {*} refresh_token 
 * @returns Promise<TrueLayerToken>
 */
const refreshToken = async (refresh_token) => {
  const data = qs.stringify({
    ...TRUELAYER_CONFIG,
    grant_type: 'refresh_token',
    refresh_token
  });
  const response = await axios({
    method: 'post',
    url: `${TRUELAYER_AUTH_ROOT}/connect/token`,
    headers: {},
    data
  });
  return response.data;
};

const getAccounts = async (token) => {
  const response = await axios({
    method: 'get',
    url: `${TRUELAYER_API_ROOT}/accounts`,
    headers: { 
      'Authorization': `Bearer ${token}`
    },
  });
  return response.data?.results;
};

const getAccountBalance = async (accountId, token) => {
  const response = await axios({
    method: 'get',
    url: `${TRUELAYER_API_ROOT}/accounts/${accountId}/balance`,
    headers: { 
      'Authorization': `Bearer ${token}`
    },
  });
  return response.data?.results?.[0];
};

const getTransactions = async (accountId, from, to, token) => {
  const promises = [
    axios({
      method: 'get',
      url: `${TRUELAYER_API_ROOT}/accounts/${accountId}/transactions/pending?from=${from}&to=${(to)}`,
      headers: { 
        'Authorization': `Bearer ${token}`
      },
    }),
    axios({
      method: 'get',
      url: `${TRUELAYER_API_ROOT}/accounts/${accountId}/transactions?from=${from}&to=${(to)}`,
      headers: { 
        'Authorization': `Bearer ${token}`
      },
    }),
  ]
  const responses = await Promise.all(promises);
  return [...responses[0]?.data?.results, ...responses[1]?.data?.results];
};

module.exports = {
  exchangeCodeForToken,
  generateAccessToken,
  refreshToken,
  getAccounts,
  getAccountBalance,
  getTransactions
}