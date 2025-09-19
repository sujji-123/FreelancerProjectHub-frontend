// src/services/paymentService.js
import api from "./api";

export const createBankAccount = (data) => api.post("/payment/account", data);
export const requestOtp = (data) => api.post("/payment/account/request-otp", data);
export const verifyLogin = (data) => api.post("/payment/account/verify", data);
export const addAmount = (data) => api.post("/payment/account/add", data);
export const withdrawAmt = (data) => api.post("/payment/withdraw", data);
export const transferMoney = (data) => api.post("/payment/transfer", data);
export const getBalance = () => api.get("/payment/balance");
export const getTransactions = () => api.get("/payment/transactions");

export default {
  createBankAccount,
  requestOtp,
  verifyLogin,
  addAmount,
  withdrawAmt,
  transferMoney,
  getBalance,
  getTransactions,
};