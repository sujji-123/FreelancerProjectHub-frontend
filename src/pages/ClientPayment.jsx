// src/pages/ClientPayment.jsx
import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import {
  createBankAccount,
  requestBankLoginOtp,
  verifyBankLogin,
  addAmount,
  transferMoney,
  getBalance,
  getTransactions,
} from "../services/paymentService";
import { getAllFreelancers } from '../services/userService'; 
import { toast } from "react-toastify";
import { FaEye, FaPlusCircle, FaPaperPlane, FaHistory, FaArrowLeft } from 'react-icons/fa';

export default function ClientPayment() {
    const [view, setView] = useState('welcome');
    const [isLoggedIn, setIsLoggedIn] = useState(sessionStorage.getItem('bankAccountLoggedIn') === 'true');
    const [createDetails, setCreateDetails] = useState({ fullName: "", email: "", phone: "", bankName: "", pin: "" });
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPin, setLoginPin] = useState("");
    const [otp, setOtp] = useState("");
    const [balance, setBalance] = useState(0);
    const [topupAmount, setTopupAmount] = useState("");
    const [transferToUserId, setTransferToUserId] = useState("");
    const [freelancers, setFreelancers] = useState([]);
    const [transferAmount, setTransferAmount] = useState("");
    const [transactions, setTransactions] = useState([]);
    const [dashboardView, setDashboardView] = useState('main');
    const [showBalance, setShowBalance] = useState(false);
    const [showTransactions, setShowTransactions] = useState(false);

    useEffect(() => {
        if (isLoggedIn) {
            setView('dashboard');
            const fetchFreelancers = async () => {
                try {
                    const res = await getAllFreelancers();
                    setFreelancers(res.data || []);
                } catch (err) {
                    console.error("Failed to fetch freelancers:", err);
                    toast.error("Could not load the freelancers list.");
                }
            };
            fetchFreelancers();
        }
    }, [isLoggedIn]);
    
    const handleCreate = async (e) => {
        e.preventDefault();
        if (createDetails.pin.length !== 4 || !/^\d{4}$/.test(createDetails.pin)) {
            toast.error("PIN must be exactly 4 digits.");
            return;
        }
        try {
            await createBankAccount(createDetails);
            toast.success("Bank account created! Please log in.");
            setView('login');
            setLoginEmail(createDetails.email);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Error creating account");
        }
    };

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        try {
            await requestBankLoginOtp({ email: loginEmail });
            setView('otp');
            toast.info("OTP sent to your email.");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Account not found.");
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            const res = await verifyBankLogin({ email: loginEmail, otp, pin: loginPin });
            sessionStorage.setItem('bankAccountLoggedIn', 'true');
            setIsLoggedIn(true);
            setBalance(res.data.account.balance);
            fetchTx();
            setView('dashboard');
            toast.success("Logged in to bank account!");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Login failed.");
        }
    };

    const handleAddAmount = async () => {
        if (!topupAmount || Number(topupAmount) <= 0) return toast.error("Invalid amount.");
        try {
            const res = await addAmount({ amount: Number(topupAmount) });
            setBalance(res.data.balance);
            await fetchTx();
            toast.success("Funds added!");
            setTopupAmount("");
            setDashboardView('main');
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to add funds");
        }
    };

    const handleTransfer = async () => {
        if (!transferToUserId || !transferAmount || Number(transferAmount) <= 0) {
            return toast.error("Please select a freelancer and enter a valid amount.");
        }
        try {
            const res = await transferMoney({ toUserId: transferToUserId, amount: Number(transferAmount) });
            setBalance(res.data.fromBalance);
            await fetchTx();
            toast.success("Payment sent!");
            setTransferAmount("");
            setTransferToUserId("");
            setDashboardView('main');
        } catch (err) {
            toast.error(err?.response?.data?.message || "Transfer failed");
        }
    };
    
    const fetchTx = async () => {
        try {
            const res = await getTransactions();
            setTransactions(res.data.transactions || []);
        } catch (err) {
            console.error("Failed to fetch transactions:", err);
        }
    };

    useEffect(() => {
        if (isLoggedIn) {
            const fetchInitialData = async () => {
                try {
                    const res = await getBalance();
                    setBalance(res.data.balance);
                    await fetchTx();
                } catch (err) {
                    console.error("Failed to fetch initial data:", err);
                }
            };
            fetchInitialData();
        }
    }, [isLoggedIn]);
    
    const handleLogout = () => {
        sessionStorage.removeItem('bankAccountLoggedIn');
        setIsLoggedIn(false);
        setView('welcome');
        toast.info("Logged out of payment gateway.");
    };
    
    const toggleBalance = async () => {
        if (!showBalance) {
            try {
                const res = await getBalance();
                setBalance(res.data.balance);
            } catch (err) { console.error("Failed to fetch balance:", err); }
        }
        setShowBalance(!showBalance);
    };

    const renderDashboard = () => (
        <div className="p-8 border rounded-lg shadow-sm bg-white">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Account Dashboard</h2>
                <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">Logout of Gateway</button>
            </div>
            
            {dashboardView === 'main' && (
                 <div className="space-y-4">
                     <div className="p-4 border rounded-lg flex items-center justify-between">
                         <div>
                             <p className="text-gray-500">Account Balance</p>
                             <p className={`text-3xl font-bold transition-all duration-300 ${showBalance ? 'blur-none' : 'blur-md'}`}>
                                 ${showBalance ? balance.toFixed(2) : 'XXXX.XX'}
                             </p>
                         </div>
                         <button onClick={toggleBalance} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                             <FaEye /> {showBalance ? 'Hide' : 'View'} Balance
                         </button>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <button onClick={() => setDashboardView('add')} className="flex flex-col items-center justify-center p-6 bg-blue-50 hover:bg-blue-100 rounded-lg border-2 border-dashed border-blue-200 text-blue-700 transition-colors">
                             <FaPlusCircle className="text-3xl mb-2" />
                             <span className="font-semibold">Add Money</span>
                         </button>
                         <button onClick={() => setDashboardView('send')} className="flex flex-col items-center justify-center p-6 bg-green-50 hover:bg-green-100 rounded-lg border-2 border-dashed border-green-200 text-green-700 transition-colors">
                             <FaPaperPlane className="text-3xl mb-2" />
                             <span className="font-semibold">Send Money</span>
                         </button>
                     </div>
                 </div>
            )}

            {dashboardView === 'add' && (
                 <div>
                     <h3 className="font-semibold text-xl mb-4">Add Money to Account</h3>
                     <input type="number" placeholder="Amount to add" value={topupAmount} onChange={(e) => setTopupAmount(e.target.value)} className="w-full p-2 border rounded mb-2" />
                     <div className="flex gap-4">
                         <button onClick={handleAddAmount} className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Add Funds</button>
                         <button onClick={() => setDashboardView('main')} className="flex-1 px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Back</button>
                     </div>
                 </div>
            )}
            
            {dashboardView === 'send' && (
                 <div>
                     <h3 className="font-semibold text-xl mb-4">Send Money to Freelancer</h3>
                     <select value={transferToUserId} onChange={(e) => setTransferToUserId(e.target.value)} className="w-full p-2 border rounded mb-2">
                         <option value="">-- Select a Freelancer --</option>
                         {freelancers.map(f => (
                             <option key={f._id} value={f._id}>{f.name}</option>
                         ))}
                     </select>
                     <input type="number" placeholder="Amount" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} className="w-full p-2 border rounded mb-2" />
                     <div className="flex gap-4">
                         <button onClick={handleTransfer} className="flex-1 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Send Payment</button>
                         <button onClick={() => setDashboardView('main')} className="flex-1 px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Back</button>
                     </div>
                 </div>
            )}

            <div className="mt-8">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-lg">Transaction History</h3>
                    <button onClick={() => setShowTransactions(!showTransactions)} className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                        <FaHistory /> {showTransactions ? 'Hide' : 'View'} History
                    </button>
                </div>
                {showTransactions && (
                    <ul className="divide-y max-h-60 overflow-y-auto border rounded-lg p-2">
                        {transactions.length > 0 ? transactions.map(tx => (
                            <li key={tx._id} className="py-2 flex justify-between items-center">
                                <div>
                                    {/* --- THIS IS THE CORRECTED CODE --- */}
                                    <span className="font-medium capitalize">{tx.type}</span>
                                    {tx.type === 'transfer' && tx.recipient ? (
                                        <p className="text-sm text-gray-500">To: {tx.recipient.name}</p>
                                    ) : (
                                        <p className="text-sm text-gray-500">{tx.note || 'Self Transaction'}</p>
                                    )}
                                    <p className={`font-semibold ${tx.type === 'transfer' ? 'text-red-600' : 'text-green-600'}`}>
                                        {tx.type === 'transfer' ? '-' : '+'} ${tx.amount.toFixed(2)}
                                    </p>
                                </div>
                                <span className="text-gray-500 text-sm">{new Date(tx.createdAt).toLocaleString()}</span>
                            </li>
                        )) : <p className="text-gray-500 p-4 text-center">No transactions yet.</p>}
                    </ul>
                )}
            </div>
        </div>
    );
    
    const renderContent = () => {
        switch(view) {
            case 'create':
                return (
                    <form onSubmit={handleCreate} className="p-8 border rounded-lg shadow-sm bg-white">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Create Your Dummy Bank Account</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Full Name" value={createDetails.fullName} onChange={(e) => setCreateDetails({...createDetails, fullName: e.target.value})} className="p-2 border rounded" required />
                            <input type="email" placeholder="Email" value={createDetails.email} onChange={(e) => setCreateDetails({...createDetails, email: e.target.value})} className="p-2 border rounded" required />
                            <input type="text" placeholder="Phone Number" value={createDetails.phone} onChange={(e) => setCreateDetails({...createDetails, phone: e.target.value})} className="p-2 border rounded" required />
                            <input type="text" placeholder="Bank Name (e.g., Dummy Bank)" value={createDetails.bankName} onChange={(e) => setCreateDetails({...createDetails, bankName: e.target.value})} className="p-2 border rounded" required />
                            <input type="password" placeholder="Set 4-Digit PIN" value={createDetails.pin} onChange={(e) => setCreateDetails({...createDetails, pin: e.target.value})} className="p-2 border rounded" required pattern="\d{4}" title="PIN must be 4 digits" maxLength="4" />
                        </div>
                        <div className="mt-6 flex items-center gap-4">
                            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Create Account</button>
                            <button type="button" onClick={() => setView('welcome')} className="text-sm text-gray-600 hover:underline">Back to Welcome</button>
                        </div>
                    </form>
                );
            case 'login':
                return (
                    <form onSubmit={handleRequestOtp} className="p-8 border rounded-lg shadow-sm bg-white max-w-md mx-auto">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Login to Your Account</h2>
                        <input type="email" placeholder="Email Address" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full p-2 border rounded mb-4" required />
                        <p className="text-sm text-gray-500 mb-4">An OTP will be sent to your email for secure verification.</p>
                        <button type="submit" className="w-full px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Request OTP</button>
                        <p className="mt-4 text-center text-sm">Don't have an account? <button type="button" onClick={() => setView('create')} className="font-semibold text-indigo-600 hover:underline">Create one</button></p>
                    </form>
                );
            case 'otp':
                return (
                    <form onSubmit={handleVerify} className="p-8 border rounded-lg shadow-sm bg-white max-w-md mx-auto">
                       <h2 className="text-2xl font-semibold mb-4 text-gray-800">Verify Your Identity</h2>
                       <input type="text" placeholder="6-Digit OTP from email" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full p-2 border rounded mb-4" required maxLength="6" />
                       <input type="password" placeholder="Your 4-Digit PIN" value={loginPin} onChange={(e) => setLoginPin(e.target.value)} className="w-full p-2 border rounded mb-4" required maxLength="4" />
                       <button type="submit" className="w-full px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Verify & Login</button>
                       <button type="button" onClick={() => setView('login')} className="mt-3 text-sm text-gray-600 hover:underline">Back to Login</button>
                   </form>
                );
            case 'dashboard':
                return renderDashboard();
            default:
                return (
                    <div className="text-center p-8 border rounded-lg shadow-sm bg-white">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Welcome to the Payment Gateway</h2>
                        <p className="mb-6 text-gray-600">Securely manage your project funds and pay freelancers with ease.</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setView('login')} className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Login to Bank Account</button>
                            <button onClick={() => setView('create')} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Create New Account</button>
                        </div>
                    </div>
                );
        }
    }

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <Link to="/client/dashboard" className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2">
                    <FaArrowLeft />
                    Back to Dashboard
                </Link>
            </div>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Client Payments</h1>
            {renderContent()}
        </div>
      </div>
    );
}