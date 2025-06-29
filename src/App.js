import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";
import firebaseConfig from "./firebaseConfig";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ADMIN_EMAIL = "admin@example.com";

function App() {
  const [userEmail, setUserEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [mealCount, setMealCount] = useState(0);
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [meals, setMeals] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const login = () => {
    setIsAdmin(userEmail === ADMIN_EMAIL);
    fetchMeals();
    fetchExpenses();
  };

  const markMeal = async () => {
    if (isAdmin && mealCount > 0) {
      await addDoc(collection(db, "meals"), {
        email: userEmail,
        count: mealCount,
        date: new Date().toISOString()
      });
      setMealCount(0);
      fetchMeals();
    }
  };

  const addExpense = async () => {
    if (isAdmin && expenseDesc && expenseAmount > 0) {
      await addDoc(collection(db, "expenses"), {
        description: expenseDesc,
        amount: Number(expenseAmount),
        date: new Date().toISOString()
      });
      setExpenseAmount("");
      setExpenseDesc("");
      fetchExpenses();
    }
  };

  const fetchMeals = async () => {
    const data = await getDocs(collection(db, "meals"));
    setMeals(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
  };

  const fetchExpenses = async () => {
    const data = await getDocs(collection(db, "expenses"));
    setExpenses(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Meal Manager</h1>
      <input placeholder="Enter your email" value={userEmail} onChange={e => setUserEmail(e.target.value)} />
      <button onClick={login}>Login</button>
      {isAdmin && (
        <div>
          <h2>Mark Meal</h2>
          <input type="number" value={mealCount} onChange={e => setMealCount(Number(e.target.value))} />
          <button onClick={markMeal}>Submit</button>
          <h2>Add Expense</h2>
          <input placeholder="Description" value={expenseDesc} onChange={e => setExpenseDesc(e.target.value)} />
          <input type="number" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} />
          <button onClick={addExpense}>Add</button>
        </div>
      )}
      <h2>Meal Records</h2>
      <table border="1"><thead><tr><th>Email</th><th>Count</th><th>Date</th></tr></thead><tbody>
        {meals.map(m => <tr key={m.id}><td>{m.email}</td><td>{m.count}</td><td>{new Date(m.date).toLocaleString()}</td></tr>)}
      </tbody></table>
      <h2>Expenses</h2>
      <table border="1"><thead><tr><th>Description</th><th>Amount</th><th>Date</th></tr></thead><tbody>
        {expenses.map(e => <tr key={e.id}><td>{e.description}</td><td>{e.amount}</td><td>{new Date(e.date).toLocaleString()}</td></tr>)}
      </tbody></table>
    </div>
  );
}

export default App;