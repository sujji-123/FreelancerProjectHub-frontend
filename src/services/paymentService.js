// src/services/paymentService.js
import api from './api';

// Corresponds to POST /api/payment/create-account
export const createBankAccount = (details) => {
    return api.post('/payment/create-account', details);
};

// Corresponds to POST /api/payment/login/request-otp
export const requestBankLoginOtp = (email) => {
    return api.post('/payment/login/request-otp', email);
};

// Corresponds to POST /api/payment/login/verify
export const verifyBankLogin = (credentials) => {
    return api.post('/payment/login/verify', credentials);
};

// Corresponds to POST /api/payment/add-amount
export const addAmount = (amount) => {
    return api.post('/payment/add-amount', amount);
};

// Corresponds to POST /api/payment/transfer
export const transferMoney = (transferDetails) => {
    return api.post('/payment/transfer', transferDetails);
};

// Corresponds to GET /api/payment/balance
export const getBalance = () => {
    return api.get('/payment/balance');
};

// Corresponds to GET /api/payment/transactions
export const getTransactions = () => {
    return api.get('/payment/transactions');
};

// Corresponds to POST /api/payment/withdraw
export const withdraw = (amount) => {
    return api.post('/payment/withdraw', amount);
};