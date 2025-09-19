// src/pages/ClientPayment.jsx
import React, { useState, useEffect } from "react";
import {
  createBankAccount,
  requestOtp,
  verifyLogin,
  addAmount,
  transferMoney,
  getBalance,
  getTransactions,
} from "../services/paymentService";
import { toast } from "react-toastify";

export default function ClientPayment() {
    const [view, setView] = useState('welcome'); // 'welcome', 'create', 'login', 'otp', 'dashboard'
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    // State for the creation form
    const [createDetails, setCreateDetails] = useState({ fullName: "", email: "", phone: "", bankName: "", pin: "" });
    
    // State for the login process
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPin, setLoginPin] = useState("");
    const [otp, setOtp] = useState("");

    // State for the dashboard
    const [balance, setBalance] = useState(0);
    const [topupAmount, setTopupAmount] = useState("");
    const [transferToUserId, setTransferToUserId] = useState("");
    const [transferAmount, setTransferAmount] = useState("");
    const [transactions, setTransactions] = useState([]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (createDetails.pin.length !== 4 || !/^\d{4}$/.test(createDetails.pin)) {
            toast.error("PIN must be exactly 4 digits.");
            return;
        }
        try {
            await createBankAccount(createDetails);
            toast.success("Bank account created successfully! Please log in.");
            setView('login'); // Switch to login view after successful creation
            setLoginEmail(createDetails.email); // Pre-fill email for convenience
        } catch (err) {
            toast.error(err?.response?.data?.message || "Error creating account");
        }
    };

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        if (!loginEmail) {
            toast.error("Please enter your email address.");
            return;
        }
        try {
            await requestOtp({ email: loginEmail });
            setView('otp'); // Move to OTP entry view
            toast.info("OTP has been sent to your email.");
        } catch (err) {
            toast.error(err?.response?.data?.message || "This email does not have a bank account.");
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            const res = await verifyLogin({ email: loginEmail, otp, pin: loginPin });
            setIsLoggedIn(true);
            setBalance(res.data.account.balance);
            fetchTx();
            setView('dashboard'); // Move to the main dashboard view
            toast.success("Logged in to your bank account!");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Login failed. Check OTP and PIN.");
        }
    };

    const handleAddAmount = async () => {
        if (!topupAmount || Number(topupAmount) <= 0) {
            toast.error("Please enter a valid amount.");
            return;
        }
        try {
            const res = await addAmount({ amount: Number(topupAmount) });
            setBalance(res.data.balance);
            fetchTx();
            toast.success("Funds added successfully!");
            setTopupAmount("");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to add funds");
        }
    };

    const handleTransfer = async () => {
        if (!transferToUserId || !transferAmount || Number(transferAmount) <= 0) {
            toast.error("Please provide a valid User ID and amount.");
            return;
        }
        try {
            const res = await transferMoney({ toUserId: transferToUserId, amount: Number(transferAmount) });
            setBalance(res.data.fromBalance);
            fetchTx();
            toast.success("Payment sent successfully!");
            setTransferAmount("");
            setTransferToUserId("");
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

    // ✅ Using useEffect + getBalance + isLoggedIn to auto-refresh account balance
    useEffect(() => {
        if (isLoggedIn) {
            const fetchBalance = async () => {
                try {
                    const res = await getBalance();
                    setBalance(res.data.balance);
                } catch (err) {
                    console.error("Failed to fetch balance:", err);
                }
            };
            fetchBalance();
            fetchTx();
        }
    }, [isLoggedIn]);

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
                return (
                    <div className="p-8 border rounded-lg shadow-sm bg-white">
                        <h2 className="text-2xl font-semibold">Account Dashboard</h2>
                        <p className="text-4xl font-bold my-4">Balance: ${balance.toFixed(2)}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Add Money to Account</h3>
                                <input type="number" placeholder="Amount to add" value={topupAmount} onChange={(e) => setTopupAmount(e.target.value)} className="w-full p-2 border rounded mb-2" />
                                <button onClick={handleAddAmount} className="w-full px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Add Funds</button>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Send Money to Freelancer</h3>
                                <input type="text" placeholder="Freelancer's User ID" value={transferToUserId} onChange={(e) => setTransferToUserId(e.target.value)} className="w-full p-2 border rounded mb-2" />
                                <input type="number" placeholder="Amount" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} className="w-full p-2 border rounded mb-2" />
                                <button onClick={handleTransfer} className="w-full px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Send Payment</button>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="font-semibold text-lg mb-2">Transaction History</h3>
                            <ul className="divide-y max-h-60 overflow-y-auto">
                                {transactions.length > 0 ? transactions.map(tx => (
                                    <li key={tx._id} className="py-2 flex justify-between">
                                        <span>{tx.type.toUpperCase()}: ${tx.amount}</span>
                                        <span className="text-gray-500">{new Date(tx.createdAt).toLocaleString()}</span>
                                    </li>
                                )) : <p className="text-gray-500">No transactions yet.</p>}
                            </ul>
                        </div>
                    </div>
                );
            default: // 'welcome' view
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
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Client Payments</h1>
        {renderContent()}
      </div>
    );
}
