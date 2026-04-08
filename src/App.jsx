import { transactions } from "./data";
import { useState, useEffect } from "react";
import { FaTrash, FaEdit, FaSun, FaMoon, FaWallet } from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function App() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [role, setRole] = useState("admin");
  const [editId, setEditId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : transactions;
  });

  const [newTransaction, setNewTransaction] = useState({
    date: "",
    category: "",
    amount: "",
    type: "expense",
  });

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(data));
  }, [data]);

  const filteredTransactions = data.filter((t) => {
    return (
      (filter === "all" || t.type === filter) &&
      t.category.toLowerCase().includes(search.toLowerCase())
    );
  });

  const monthlyDataMap = {};
  data.forEach((t) => {
    const month = t.date.slice(0, 7);

    if (!monthlyDataMap[month]) {
      monthlyDataMap[month] = { month, balance: 0 };
    }

    if (t.type === "income") {
      monthlyDataMap[month].balance += t.amount;
    } else {
      monthlyDataMap[month].balance -= t.amount;
    }
  });

  const lineData = Object.values(monthlyDataMap).sort(
    (a, b) => new Date(a.month) - new Date(b.month),
  );

  const totalIncome = data
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = data
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const categoryMap = {};
  data.forEach((t) => {
    if (t.type === "expense") {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    }
  });

  const categoryData = Object.keys(categoryMap).map((key) => ({
    name: key,
    value: categoryMap[key],
  }));

  const highestCategory = Object.keys(categoryMap).reduce(
    (a, b) => (categoryMap[a] > categoryMap[b] ? a : b),
    "",
  );

  const handleAdd = () => {
    if (
      !newTransaction.date ||
      !newTransaction.category ||
      !newTransaction.amount
    ) {
      return;
    }

    if (editId) {
      const updated = data.map((item) =>
        item.id === editId
          ? {
              ...newTransaction,
              id: editId,
              amount: Number(newTransaction.amount),
            }
          : item,
      );
      setData(updated);
      setEditId(null);
    } else {
      const newItem = {
        ...newTransaction,
        id: Date.now(),
        amount: Number(newTransaction.amount),
      };
      setData([newItem, ...data]);
    }

    setNewTransaction({
      date: "",
      category: "",
      amount: "",
      type: "expense",
    });

    setShowForm(false);
  };

  const handleEdit = (item) => {
    setNewTransaction(item);
    setEditId(item.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    const updated = data.filter((item) => item.id !== id);
    setData(updated);
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100"
      } min-h-screen p-6`}
    >
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FaWallet className="text-green-500 text-2xl" />
          Finance Dashboard
        </h1>

        <div className="flex items-center gap-4">
          <select
            className="border p-2 rounded"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="viewer">Viewer</option>
            <option value="admin">Admin</option>
          </select>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 shadow"
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          className={`${darkMode ? "bg-gray-800" : "bg-white"} p-5 rounded-xl shadow`}
        >
          <p className="text-gray-500">Total Balance</p>
          <h2 className="text-2xl font-bold mt-2">
            ₹{(totalIncome - totalExpense).toLocaleString("en-IN")}
          </h2>
        </div>

        <div
          className={`${darkMode ? "bg-gray-800" : "bg-white"} p-5 rounded-xl shadow`}
        >
          <p className="text-gray-500">Income</p>
          <h2 className="text-2xl font-bold mt-2 text-green-500">
            ₹{totalIncome.toLocaleString("en-IN")}
          </h2>
        </div>

        <div
          className={`${darkMode ? "bg-gray-800" : "bg-white"} p-5 rounded-xl shadow`}
        >
          <p className="text-gray-500">Expenses</p>
          <h2 className="text-2xl font-bold mt-2 text-red-500">
            ₹{totalExpense.toLocaleString("en-IN")}
          </h2>
        </div>

        <div
          className={`${darkMode ? "bg-gray-800" : "bg-white"} p-5 rounded-xl shadow`}
        >
          <p className="text-gray-500">Top Spending Category</p>
          <h2 className="text-2xl font-bold mt-2 text-[#00C49F]/80">
            {highestCategory || "N/A"}
          </h2>
        </div>
      </div>

      {/* Transaction Form */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div
            className={`${darkMode ? "bg-gray-800" : "bg-white"} p-6 rounded-xl w-full max-w-lg shadow-lg`}
          >
            <h2 className="text-xl font-semibold mb-4">
              {editId ? "Edit Transaction" : "Add Transaction"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="date"
                className="border p-2 rounded"
                value={newTransaction.date}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, date: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Category"
                className="border p-2 rounded"
                value={newTransaction.category}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    category: e.target.value,
                  })
                }
              />
              <input
                type="number"
                placeholder="Amount"
                className="border p-2 rounded"
                value={newTransaction.amount}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    amount: e.target.value,
                  })
                }
              />
              <select
                className="border p-2 rounded"
                value={newTransaction.type}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, type: e.target.value })
                }
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 rounded bg-green-500 text-white"
              >
                {editId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transactions */}
      <div
        className={`mt-10 ${darkMode ? "bg-gray-800" : "bg-white"} p-5 rounded-xl shadow`}
      >
        <h2 className="text-xl font-semibold mb-4">Transactions</h2>

        {role === "admin" && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
          >
            Add Transaction
          </button>
        )}

        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search category..."
            className="border p-2 rounded w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border p-2 rounded"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        {/* Header hidden on mobile */}
        <div className="hidden md:grid md:grid-cols-5 font-semibold border-b pb-2 mb-2 text-gray-600">
          <span>Date</span>
          <span>Category</span>
          <span>Amount</span>
          <span>Type</span>
          {role === "admin" && <span className="text-right">Actions</span>}
        </div>

        {filteredTransactions.map((t) => (
          <div
            key={t.id}
            className="grid grid-cols-1 md:grid-cols-5 items-center border-b py-2 hover:bg-gray-50"
          >
            <span>{t.date}</span>
            <span>{t.category}</span>

            {/* Mobile stacked */}
            <span className="block md:hidden text-sm">
              ₹{t.amount.toLocaleString("en-IN")} • {t.type}
            </span>

            {/* Desktop */}
            <span
              className={`hidden md:block ${
                t.type === "income" ? "text-green-500" : "text-red-500"
              }`}
            >
              ₹{t.amount.toLocaleString("en-IN")}
            </span>
            <span className="hidden md:block">{t.type}</span>

            <div className="flex gap-3 justify-end">
              {role === "admin" && (
                <>
                  <button
                    onClick={() => handleEdit(t)}
                    className="text-blue-500"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-red-500"
                  >
                    <FaTrash />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Spending Breakdown */}
      <div
        className={`mt-10 ${darkMode ? "bg-gray-800" : "bg-white"} p-5 rounded-xl shadow`}
      >
        <h2 className="text-xl font-semibold mb-4">Spending Breakdown</h2>
        <div className="flex justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Balance Trend */}
      <div
        className={`mt-10 ${darkMode ? "bg-gray-800" : "bg-white"} p-5 rounded-xl shadow`}
      >
        <h2 className="text-xl font-semibold mb-4">Balance Trend</h2>
        <div className="overflow-x-auto">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default App;
