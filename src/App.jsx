import { transactions } from "./data";
import { useState } from "react";
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
} from "recharts";

function App() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [role, setRole] = useState("viewer");

  // Filter logic
  const filteredTransactions = transactions.filter((t) => {
    return (
      (filter === "all" || t.type === filter) &&
      t.category.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Monthly data for line chart
  const monthlyDataMap = {};
  transactions.forEach((t) => {
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
    (a, b) => new Date(a.month) - new Date(b.month)
  );

  // Insights
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Category map
  const categoryMap = {};
  transactions.forEach((t) => {
    if (t.type === "expense") {
      categoryMap[t.category] =
        (categoryMap[t.category] || 0) + t.amount;
    }
  });

  const categoryData = Object.keys(categoryMap).map((key) => ({
    name: key,
    value: categoryMap[key],
  }));

  const highestCategory = Object.keys(categoryMap).reduce(
    (a, b) => (categoryMap[a] > categoryMap[b] ? a : b),
    ""
  );

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Finance Dashboard</h1>

        <select
          className="border p-2 rounded"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="viewer">Viewer</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500">Total Balance</p>
          <h2 className="text-2xl font-bold mt-2">
            ₹{totalIncome - totalExpense}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500">Income</p>
          <h2 className="text-2xl font-bold mt-2 text-green-500">
            ₹{totalIncome}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500">Expenses</p>
          <h2 className="text-2xl font-bold mt-2 text-red-500">
            ₹{totalExpense}
          </h2>
        </div>
      </div>

      {/* Transactions */}
      <div className="mt-10 bg-white p-5 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Transactions</h2>

        {role === "admin" && (
          <button className="bg-blue-500 text-white px-4 py-2 rounded mb-4">
            + Add Transaction
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

        <div>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((t) => (
              <div key={t.id} className="flex justify-between border-b py-2">
                <span>{t.date}</span>
                <span>{t.category}</span>
                <span
                  className={
                    t.type === "income"
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  ₹{t.amount}
                </span>
                <span>{t.type}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              No transactions found
            </p>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500">Total Income</p>
          <h2 className="text-xl font-bold text-green-500 mt-2">
            ₹{totalIncome}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500">Total Expense</p>
          <h2 className="text-xl font-bold text-red-500 mt-2">
            ₹{totalExpense}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500">Top Spending Category</p>
          <h2 className="text-xl font-bold mt-2">
            {highestCategory || "N/A"}
          </h2>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="mt-10 bg-white p-5 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">
          Spending Breakdown
        </h2>

        <div className="flex justify-center">
          <PieChart width={300} height={300}>
            <Pie
              data={categoryData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {categoryData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>

      {/* Line Chart */}
      <div className="mt-10 bg-white p-5 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">
          Balance Trend
        </h2>

        <div className="overflow-x-auto">
          <LineChart width={600} height={300} data={lineData}>
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
        </div>
      </div>

    </div>
  );
}

export default App;