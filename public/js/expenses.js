// DOM Elements
const expenseForm = document.getElementById('expenseForm');
const expenseTableBody = document.getElementById('expenseTableBody');

// Load Expenses
const loadExpenses = async () => {
    try {
        const response = await fetch('/api/expenses', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const expenses = await response.json();

        if (response.ok) {
            displayExpenses(expenses);
        } else {
            alert('Error loading expenses');
        }
    } catch (error) {
        alert('Error loading expenses');
    }
};

// Display Expenses
const displayExpenses = (expenses) => {
    expenseTableBody.innerHTML = '';
    expenses.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expense.title}</td>
            <td>$${expense.amount.toFixed(2)}</td>
            <td>${expense.category}</td>
            <td>${new Date(expense.date).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteExpense('${expense._id}')">Delete</button>
            </td>
        `;
        expenseTableBody.appendChild(row);
    });
};

// Add Expense
expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('expenseTitle').value;
    const amount = document.getElementById('expenseAmount').value;
    const category = document.getElementById('expenseCategory').value;
    const description = document.getElementById('expenseDescription').value;

    try {
        const response = await fetch('/api/expenses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ title, amount, category, description })
        });

        if (response.ok) {
            expenseForm.reset();
            loadExpenses();
        } else {
            alert('Error adding expense');
        }
    } catch (error) {
        alert('Error adding expense');
    }
});

// Delete Expense
const deleteExpense = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
        return;
    }

    try {
        const response = await fetch(`/api/expenses/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            loadExpenses();
        } else {
            alert('Error deleting expense');
        }
    } catch (error) {
        alert('Error deleting expense');
    }
};

// Load expenses when page loads if user is authenticated
if (localStorage.getItem('token')) {
    loadExpenses();
} 