import { transactionService } from "./data/transactionService.js";

const state = {
  transactions: [],
  month: new Date(2026, 8, 1),
  selectedDate: "2026-09-19"
};

const $ = (id) => document.getElementById(id);

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const money = (value, currency = "AED") =>
  `${currency} ${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

const compact = (value) => Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 });

function monthTransactions() {
  const y = state.month.getFullYear();
  const m = state.month.getMonth() + 1;
  return state.transactions.filter((tx) => {
    const [ty, tm] = tx.date.split("-").map(Number);
    return ty === y && tm === m;
  });
}

function renderSummary() {
  let income = 0;
  let expense = 0;

  monthTransactions().forEach((tx) => {
    if (tx.type === "Income") income += tx.amount;
    if (tx.type === "Expense") expense += tx.amount;
  });

  $("incomeTotal").textContent = money(income);
  $("expenseTotal").textContent = money(expense);
  $("netTotal").textContent = money(income - expense);
}

function renderCalendar() {
  const y = state.month.getFullYear();
  const m = state.month.getMonth();

  $("monthLabel").textContent = state.month.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  const grid = $("calendarGrid");
  grid.innerHTML = "";

  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const today = formatDateKey(new Date());

  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement("div");
    blank.className = "day-cell muted";
    grid.appendChild(blank);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = formatDateKey(new Date(y, m, day));
    const daily = state.transactions.filter((tx) => tx.date === dateKey);
    const expense = daily
      .filter((tx) => tx.type === "Expense")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const cell = document.createElement("button");
    cell.className = "day-cell";
    cell.type = "button";
    if (dateKey === state.selectedDate) cell.classList.add("selected");
    if (dateKey === today) cell.classList.add("today");

    cell.innerHTML = `
      <div class="day-number">${day}</div>
      ${expense ? `<div class="day-total">${compact(expense)}</div>` : ""}
    `;

    cell.addEventListener("click", () => {
      state.selectedDate = dateKey;
      renderCalendar();
      renderTransactions();
    });

    grid.appendChild(cell);
  }
}

function renderTransactions() {
  const list = $("transactionList");
  const selected = new Date(`${state.selectedDate}T00:00:00`);
  $("selectedDateLabel").textContent = selected.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

  const daily = state.transactions
    .filter((tx) => tx.date === state.selectedDate)
    .sort((a, b) => a.merchant.localeCompare(b.merchant));

  if (!daily.length) {
    list.innerHTML = '<div class="empty-state">No transactions for this day.</div>';
    return;
  }

  list.innerHTML = daily.map((tx) => {
    const sign = tx.type === "Expense" ? "-" : tx.type === "Income" ? "+" : "";
    const amountClass = tx.type === "Expense" ? "expense" : tx.type === "Income" ? "income" : "";
    const icon = tx.type === "Expense" ? "↑" : tx.type === "Income" ? "↓" : "↔";
    const review = tx.category === "Needs Review"
      ? '<span class="tx-review">Needs Review</span>'
      : "";

    return `
      <article class="transaction-row">
        <div class="tx-icon">${icon}</div>
        <div>
          <div class="tx-title">${tx.merchant}</div>
          <div class="tx-meta">${tx.category} · ${tx.account} · ${tx.owner}</div>
          ${review}
        </div>
        <div class="tx-amount ${amountClass}">${sign}${Number(tx.amount).toFixed(2)}</div>
      </article>
    `;
  }).join("");
}

function render() {
  renderSummary();
  renderCalendar();
  renderTransactions();
}

async function refresh() {
  state.transactions = await transactionService.list();
  render();
}

function shiftMonth(offset) {
  state.month = new Date(state.month.getFullYear(), state.month.getMonth() + offset, 1);
  state.selectedDate = formatDateKey(state.month);
  render();
}

$("prevMonthBtn").addEventListener("click", () => shiftMonth(-1));
$("nextMonthBtn").addEventListener("click", () => shiftMonth(1));
$("todayBtn").addEventListener("click", () => {
  const now = new Date();
  state.month = new Date(now.getFullYear(), now.getMonth(), 1);
  state.selectedDate = formatDateKey(now);
  render();
});

$("addBtn").addEventListener("click", () => {
  $("txDate").value = state.selectedDate;
  $("transactionDialog").showModal();
});

$("transactionForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const tx = {
    date: $("txDate").value,
    owner: $("txOwner").value,
    type: $("txType").value,
    account: $("txAccount").value,
    merchant: $("txMerchant").value,
    amount: $("txAmount").value,
    currency: $("txCurrency").value,
    category: $("txCategory").value
  };

  await transactionService.add(tx);

  state.selectedDate = tx.date;
  const [y, m] = tx.date.split("-").map(Number);
  state.month = new Date(y, m - 1, 1);

  $("transactionForm").reset();
  $("transactionDialog").close();
  await refresh();
});

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    if (button.dataset.view !== "calendar") {
      alert(`${button.textContent} will be added in the next version.`);
      document.querySelector('[data-view="calendar"]').classList.add("active");
      button.classList.remove("active");
    }
  });
});

refresh();