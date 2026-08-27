# 💰 FinanceManager

A modern personal finance management dashboard built with Angular.  
FinanceManager helps users monitor their income, expenses, savings, transactions, budgets, and financial reports through a clean and intuitive interface.

---

## 📌 Overview

FinanceManager is an Angular-based finance management application designed to provide users with a centralized view of their financial activities.

The dashboard presents important financial information through summary cards, charts, transaction lists, and different management sections.

---

## ✨ Features

### 📊 Dashboard
- Total Balance overview
- Income tracking
- Expense tracking
- Savings overview
- Income vs Expense chart
- Expense breakdown by category
- Recent transactions
- Transaction search

### 💳 Transactions
- View financial transactions
- Categorize transactions
- Track income and expenses
- View transaction details

### 🎯 Budgets
- Manage financial budgets
- Monitor budget-related information

### 📈 Reports
- Analyze financial data
- View financial insights and reports

### 🏷️ Categories
- Manage transaction categories
- Organize expenses based on categories

### 👤 Profile
- User profile section
- User-related information management

### ⚙️ Settings
- Application settings
- User preferences

### 🌙 Dark Mode
- Toggle between light and dark themes

---

## 🛠️ Tech Stack

- **Angular**
- **TypeScript**
- **HTML5**
- **CSS3**
- **Angular Router**
- **Angular CLI**
- **npm**

---

## 🏗️ Angular Architecture

The project follows a modern Angular application structure.

```text
                    FinanceManager
                          │
              ┌───────────┴───────────┐
              │                       │
        Build & Delivery        Browser Application
              │                       │
       ┌──────┴──────┐          ┌─────┴─────┐
       │             │          │           │
 package.json   package-lock  index.html  styles.css
       │
 angular.json
       │
       ▼
 Production Build
