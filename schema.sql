-- Cloudflare D1 Database Schema for RoboAdvisor
-- This schema will be used when implementing backend database support

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    date_of_birth DATE,
    age INTEGER,
    risk_profile TEXT CHECK(risk_profile IN ('conservative', 'moderate', 'balanced', 'aggressive', 'very-aggressive')),
    currency TEXT DEFAULT 'INR',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Retirement plans table
CREATE TABLE IF NOT EXISTS retirement_plans (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    current_age INTEGER NOT NULL,
    retirement_age INTEGER NOT NULL,
    life_expectancy INTEGER NOT NULL,
    current_monthly_expenses REAL NOT NULL,
    current_savings REAL NOT NULL,
    monthly_investment REAL NOT NULL,
    inflation_rate REAL NOT NULL,
    expected_return REAL NOT NULL,
    retirement_corpus_needed REAL NOT NULL,
    projected_corpus REAL NOT NULL,
    shortfall REAL,
    equity_allocation REAL,
    debt_allocation REAL,
    gold_allocation REAL,
    others_allocation REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT CHECK(type IN ('non-recurring', 'recurring')),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    target_amount REAL NOT NULL,
    target_year INTEGER,
    priority TEXT CHECK(priority IN ('high', 'medium', 'low')),
    current_savings REAL DEFAULT 0,
    monthly_investment REAL DEFAULT 0,
    expected_return REAL,
    inflation_rate REAL,
    is_recurring BOOLEAN DEFAULT 0,
    recurring_amount REAL,
    recurring_frequency TEXT,
    status TEXT CHECK(status IN ('planning', 'active', 'achieved', 'modified')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Income streams table
CREATE TABLE IF NOT EXISTS income_streams (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    start_age INTEGER NOT NULL,
    end_age INTEGER NOT NULL,
    frequency TEXT CHECK(frequency IN ('monthly', 'quarterly', 'annually')),
    inflation_adjusted BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bucket strategies table (for retirement corpus management)
CREATE TABLE IF NOT EXISTS bucket_strategies (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    bucket_number INTEGER CHECK(bucket_number IN (1, 2, 3)),
    name TEXT NOT NULL,
    years INTEGER NOT NULL,
    amount REAL NOT NULL,
    equity_allocation REAL,
    debt_allocation REAL,
    gold_allocation REAL,
    expected_return REAL,
    withdrawal_strategy TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT CHECK(type IN ('mutual-fund', 'asset-allocation', 'strategy')),
    title TEXT NOT NULL,
    description TEXT,
    reason TEXT,
    priority TEXT CHECK(priority IN ('high', 'medium', 'low')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Mutual funds table (for product recommendations)
CREATE TABLE IF NOT EXISTS mutual_funds (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    amc TEXT NOT NULL,
    aum REAL,
    expense_ratio REAL,
    min_investment REAL,
    one_year_return REAL,
    three_year_return REAL,
    five_year_return REAL,
    risk_level TEXT,
    exit_load TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Advisor clients table (for professional tier)
CREATE TABLE IF NOT EXISTS advisor_clients (
    id TEXT PRIMARY KEY,
    advisor_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    relationship_status TEXT CHECK(relationship_status IN ('active', 'inactive', 'pending')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (advisor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(advisor_id, client_id)
);

-- Indexes for better query performance
CREATE INDEX idx_retirement_plans_user_id ON retirement_plans(user_id);
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_income_streams_user_id ON income_streams(user_id);
CREATE INDEX idx_bucket_strategies_user_id ON bucket_strategies(user_id);
CREATE INDEX idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX idx_advisor_clients_advisor_id ON advisor_clients(advisor_id);
CREATE INDEX idx_advisor_clients_client_id ON advisor_clients(client_id);
