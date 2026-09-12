// =====================================
// MY EXPENSE - EXPENSE TRACKER
// =====================================


// ---------- GET HTML ELEMENTS ----------

const form = document.getElementById("expenseForm");

const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const descriptionInput = document.getElementById("description");

const totalExpenses = document.getElementById("totalExpenses");
const monthExpenses = document.getElementById("monthExpenses");
const totalTransactions = document.getElementById("totalTransactions");

const expenseList = document.getElementById("expenseList");
const expenseBadge = document.getElementById("expenseBadge");

const searchInput = document.getElementById("search");
const categoryFilter = document.getElementById("categoryFilter");

const chartType = document.getElementById("chartType");

const submitButton = document.getElementById("submitButton");


// ---------- VARIABLES ----------

let expenses = [];

let editingId = null;

let expenseChart = null;


// ---------- LOAD SAVED DATA ----------

try {

    const savedData = localStorage.getItem("myExpenses");

    if (savedData) {
        expenses = JSON.parse(savedData);
    }

} catch (error) {

    expenses = [];

}


// ---------- TODAY'S DATE ----------

dateInput.value = new Date().toISOString().split("T")[0];


// ---------- CATEGORY ICONS ----------

const icons = {

    Food: "🍔",

    Travel: "✈️",

    Shopping: "🛍️",

    Bills: "💡",

    Education: "📚",

    Entertainment: "🎬",

    Other: "📌"

};


// ---------- SAVE DATA ----------

function saveData() {

    localStorage.setItem(
        "myExpenses",
        JSON.stringify(expenses)
    );

}


// ---------- FORMAT MONEY ----------

function money(value) {

    return "₹" + Number(value).toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });

}


// ---------- FORMAT DATE ----------

function displayDate(date) {

    if (!date) {
        return "";
    }

    const d = new Date(date + "T00:00:00");

    return d.toLocaleDateString("en-IN", {

        day: "2-digit",

        month: "short",

        year: "numeric"

    });

}


// =====================================
// ADD EXPENSE
// =====================================

form.addEventListener("submit", function(event) {

    event.preventDefault();


    const amount = Number(amountInput.value);

    const category = categoryInput.value;

    const date = dateInput.value;

    const description =
        descriptionInput.value.trim();


    // Check fields

    if (
        amount <= 0 ||
        category === "" ||
        date === "" ||
        description === ""
    ) {

        alert("Please fill all the fields correctly.");

        return;

    }


    // EDIT EXISTING EXPENSE

    if (editingId !== null) {

        const index = expenses.findIndex(
            expense => expense.id === editingId
        );


        if (index !== -1) {

            expenses[index].amount = amount;

            expenses[index].category = category;

            expenses[index].date = date;

            expenses[index].description = description;

        }


        editingId = null;

        submitButton.textContent = "+ Add Expense";

    }


    // ADD NEW EXPENSE

    else {

        const newExpense = {

            id: Date.now(),

            amount: amount,

            category: category,

            date: date,

            description: description

        };


        expenses.unshift(newExpense);

    }


    // SAVE

    saveData();


    // CLEAR FORM

    form.reset();

    dateInput.value =
        new Date().toISOString().split("T")[0];


    // UPDATE EVERYTHING

    updateAll();

});


// =====================================
// UPDATE EVERYTHING
// =====================================

function updateAll() {

    updateSummary();

    displayExpenses();

    updateChart();

}


// =====================================
// SUMMARY
// =====================================

function updateSummary() {


    // TOTAL EXPENSE

    let total = 0;


    for (let expense of expenses) {

        total += Number(expense.amount);

    }


    totalExpenses.textContent = money(total);


    // CURRENT MONTH

    const now = new Date();

    const currentMonth = now.getMonth();

    const currentYear = now.getFullYear();


    let monthlyTotal = 0;


    for (let expense of expenses) {

        const expenseDate =
            new Date(expense.date + "T00:00:00");


        if (
            expenseDate.getMonth() === currentMonth &&
            expenseDate.getFullYear() === currentYear
        ) {

            monthlyTotal += Number(expense.amount);

        }

    }


    monthExpenses.textContent =
        money(monthlyTotal);


    // TRANSACTIONS

    totalTransactions.textContent =
        expenses.length;

}


// =====================================
// DISPLAY EXPENSES
// =====================================

function displayExpenses() {


    const searchText =
        searchInput.value.toLowerCase().trim();


    const selectedCategory =
        categoryFilter.value;


    const filtered = expenses.filter(function(expense) {


        const searchMatch =

            expense.description
                .toLowerCase()
                .includes(searchText)

            ||

            expense.category
                .toLowerCase()
                .includes(searchText);


        const categoryMatch =

            selectedCategory === "All"

            ||

            expense.category === selectedCategory;


        return searchMatch && categoryMatch;

    });


    expenseList.innerHTML = "";


    expenseBadge.textContent =
        filtered.length;


    // NO EXPENSE

    if (filtered.length === 0) {

        expenseList.innerHTML = `

            <div class="empty">

                <div>💜</div>

                <p>No expenses found.</p>

            </div>

        `;

        return;

    }


    // CREATE EXPENSE ITEMS

    filtered.forEach(function(expense) {


        const expenseElement =
            document.createElement("div");


        expenseElement.className =
            "expense";


        // LEFT

        const left =
            document.createElement("div");

        left.className =
            "expense-left";


        // ICON

        const icon =
            document.createElement("div");

        icon.className =
            "expense-icon";

        icon.textContent =
            icons[expense.category] || "📌";


        // INFO

        const info =
            document.createElement("div");

        info.className =
            "expense-info";


        const title =
            document.createElement("h3");

        title.textContent =
            expense.description;


        const details =
            document.createElement("p");

        details.textContent =
            expense.category +
            " • " +
            displayDate(expense.date);


        info.appendChild(title);

        info.appendChild(details);


        left.appendChild(icon);

        left.appendChild(info);


        // RIGHT

        const right =
            document.createElement("div");

        right.className =
            "expense-right";


        // AMOUNT

        const amount =
            document.createElement("span");

        amount.className =
            "amount";

        amount.textContent =
            money(expense.amount);


        // ACTIONS

        const actions =
            document.createElement("div");

        actions.className =
            "actions";


        // EDIT

        const editButton =
            document.createElement("button");

        editButton.className =
            "action";

        editButton.textContent =
            "✏️";

        editButton.title =
            "Edit";


        editButton.addEventListener(
            "click",
            function() {

                editExpense(expense.id);

            }
        );


        // DELETE

        const deleteButton =
            document.createElement("button");

        deleteButton.className =
            "action";

        deleteButton.textContent =
            "🗑️";

        deleteButton.title =
            "Delete";


        deleteButton.addEventListener(
            "click",
            function() {

                deleteExpense(expense.id);

            }
        );


        actions.appendChild(editButton);

        actions.appendChild(deleteButton);


        right.appendChild(amount);

        right.appendChild(actions);


        expenseElement.appendChild(left);

        expenseElement.appendChild(right);


        expenseList.appendChild(expenseElement);

    });

}


// =====================================
// DELETE
// =====================================

function deleteExpense(id) {


    const answer =
        confirm("Are you sure you want to delete this expense?");


    if (!answer) {
        return;
    }


    expenses =
        expenses.filter(function(expense) {

            return expense.id !== id;

        });


    saveData();

    updateAll();

}


// =====================================
// EDIT
// =====================================

function editExpense(id) {


    const expense =
        expenses.find(function(item) {

            return item.id === id;

        });


    if (!expense) {
        return;
    }


    amountInput.value =
        expense.amount;


    categoryInput.value =
        expense.category;


    dateInput.value =
        expense.date;


    descriptionInput.value =
        expense.description;


    editingId = id;


    submitButton.textContent =
        "✓ Update Expense";


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// =====================================
// SEARCH
// =====================================

searchInput.addEventListener(
    "input",
    displayExpenses
);


// =====================================
// CATEGORY FILTER
// =====================================

categoryFilter.addEventListener(
    "change",
    displayExpenses
);


// =====================================
// CHART
// =====================================

function updateChart() {


    // If Chart.js isn't available,
    // don't stop the rest of the app.

    if (typeof Chart === "undefined") {

        console.log(
            "Chart.js could not be loaded."
        );

        return;

    }


    const canvas =
        document.getElementById("expenseChart");


    if (!canvas) {
        return;
    }


    const ctx =
        canvas.getContext("2d");


    // Destroy old chart

    if (expenseChart) {

        expenseChart.destroy();

        expenseChart = null;

    }


    // CATEGORY TOTALS

    const totals = {};


    expenses.forEach(function(expense) {

        if (!totals[expense.category]) {

            totals[expense.category] = 0;

        }


        totals[expense.category] +=
            Number(expense.amount);

    });


    const labels =
        Object.keys(totals);


    const values =
        Object.values(totals);


    // If there are no expenses

    if (labels.length === 0) {

        return;

    }


    // COLORS

    const colors = [

        "#8F6CCB",

        "#A98DDB",

        "#BFAAE9",

        "#7654B5",

        "#D0BFF0",

        "#9676D1",

        "#6C499F"

    ];


    // CREATE CHART

    expenseChart = new Chart(ctx, {

        type: chartType.value,

        data: {

            labels: labels,

            datasets: [{

                label: "Expenses",

                data: values,

                backgroundColor: colors,

                borderColor: "#ffffff",

                borderWidth: 2

            }]

        },


        options: {

            responsive: true,

            maintainAspectRatio: false,


            plugins: {

                legend: {

                    position: "bottom"

                }

            },


            scales:

                chartType.value === "bar"

                ?

                {

                    y: {

                        beginAtZero: true

                    }

                }

                :

                {}

        }

    });

}


// =====================================
// CHART TYPE CHANGE
// =====================================

chartType.addEventListener(
    "change",
    updateChart
);


// =====================================
// START APP
// =====================================

updateAll();