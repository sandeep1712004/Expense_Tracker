import React, { useState, useEffect } from 'react';
import { getTransactions, addTransaction, deleteTransaction } from './api';
import { Wallet, TrendingUp, TrendingDown, Trash2, PlusCircle, IndianRupee } from 'lucide-react';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('debit');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await getTransactions();
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const calculateTotal = () => transactions.reduce((acc, item) =>
    item.type === 'credit' ? acc + item.amount : acc - item.amount, 0).toFixed(2);

  const calculateIncome = () => transactions
    .filter(item => item.type === 'credit')
    .reduce((acc, item) => acc + item.amount, 0).toFixed(2);

  const calculateExpense = () => transactions
    .filter(item => item.type === 'debit')
    .reduce((acc, item) => acc + item.amount, 0).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text || !amount) return;

    try {
      await addTransaction({ text, amount: parseFloat(amount), type });
      setText('');
      setAmount('');
      setType('debit');
      fetchTransactions();
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 font-sans p-4 md:p-8 flex items-center justify-center">

      {/* Main Container */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6 relative">

        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10 mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-danger/20 rounded-full blur-3xl -z-10 mix-blend-screen pointer-events-none"></div>

        {/* Dashboard Left Side (Balance & Form) */}
        <div className="md:col-span-4 flex flex-col gap-6">

          {/* Balance Card */}
          <div className="glass-panel p-6 rounded-3xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Wallet size={80} />
            </div>
            <h2 className="text-slate-400 font-medium tracking-wider text-sm uppercase mb-2">Total Balance</h2>
            <div className="flex items-center gap-1 text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              <IndianRupee size={32} />
              {calculateTotal()}
            </div>
          </div>

          {/* Add Transaction Form */}
          <div className="glass-panel p-6 rounded-3xl shadow-2xl flex-1 flex flex-col">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PlusCircle size={20} className="text-primary" />
              New Transaction
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1 justify-center">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. Salary, Groceries"
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-slate-200 placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Amount</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <IndianRupee size={16} />
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-slate-200 placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setType('credit')}
                  className={`py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${type === 'credit' ? 'bg-success/20 text-success border border-success/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-slate-800/50 text-slate-400 border border-transparent hover:bg-slate-700/50'}`}
                >
                  <TrendingUp size={18} />
                  Income
                </button>
                <button
                  type="button"
                  onClick={() => setType('debit')}
                  className={`py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${type === 'debit' ? 'bg-danger/20 text-danger border border-danger/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'bg-slate-800/50 text-slate-400 border border-transparent hover:bg-slate-700/50'}`}
                >
                  <TrendingDown size={18} />
                  Expense
                </button>
              </div>

              <button
                type="submit"
                className="mt-6 w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
              >
                Add Transaction
              </button>
            </form>
          </div>

        </div>

        {/* Dashboard Right Side (Stats & History) */}
        <div className="md:col-span-8 flex flex-col gap-6">

          {/* Income / Expense Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="glass-panel p-6 rounded-3xl shadow-lg border-t-4 border-t-success relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Total Income</p>
                  <div className="flex items-center gap-1 text-2xl font-bold text-success mt-1">
                    <IndianRupee size={22} />
                    {calculateIncome()}
                  </div>
                </div>
                <div className="p-3 bg-success/10 rounded-2xl text-success">
                  <TrendingUp size={24} />
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl shadow-lg border-t-4 border-t-danger relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Total Expense</p>
                  <div className="flex items-center gap-1 text-2xl font-bold text-danger mt-1">
                    <IndianRupee size={22} />
                    {calculateExpense()}
                  </div>
                </div>
                <div className="p-3 bg-danger/10 rounded-2xl text-danger">
                  <TrendingDown size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History List */}
          <div className="glass-panel rounded-3xl shadow-xl flex-1 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/20">
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
              <span className="text-xs font-medium px-3 py-1 bg-slate-800 rounded-full text-slate-300">
                {transactions.length} entries
              </span>
            </div>

            <div className="p-4 sm:p-6 flex-1 overflow-y-auto max-h-[500px] flex flex-col gap-3">
              {transactions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4 opacity-60">
                  <div className="p-6 bg-slate-800/50 rounded-full">
                    <Wallet size={48} className="text-slate-600" />
                  </div>
                  <p>No transactions yet. Add one to get started.</p>
                </div>
              ) : (
                transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/30 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${transaction.type === 'credit' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                        {transaction.type === 'credit' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-200">{transaction.text}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(transaction.date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`font-semibold text-lg flex items-center ${transaction.type === 'credit' ? 'text-success' : 'text-danger'}`}>
                        {transaction.type === 'credit' ? '+' : '-'} <IndianRupee size={16} className="mx-[1px]" /> {transaction.amount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="p-2 text-slate-500 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete transaction"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default App;
