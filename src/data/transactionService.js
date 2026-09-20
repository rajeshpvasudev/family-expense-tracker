const seedTransactions = [
  {
    id: "tx_demo_1",
    date: "2026-09-19",
    owner: "Uttu",
    account: "Uttu RAK",
    type: "Expense",
    merchant: "Amazon Grocery",
    amount: 123.46,
    currency: "AED",
    category: "Groceries",
    source: "RAKBANK SMS",
    reconciliationStatus: "Unreconciled"
  }
];

const STORAGE_KEY = "family-expense-tracker.transactions.v1";

function readStore() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedTransactions));
    return [...seedTransactions];
  }
  try {
    return JSON.parse(saved);
  } catch {
    return [...seedTransactions];
  }
}

function writeStore(transactions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

export const transactionService = {
  async list() {
    return readStore();
  },

  async add(input) {
    const transactions = readStore();
    const tx = {
      id: crypto.randomUUID(),
      date: input.date,
      owner: input.owner,
      account: input.account,
      type: input.type,
      merchant: input.merchant.trim(),
      amount: Number(input.amount),
      currency: input.currency,
      category: input.category,
      source: "Manual",
      reconciliationStatus: "Unreconciled"
    };

    transactions.push(tx);
    writeStore(transactions);
    return tx;
  }
};