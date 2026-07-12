CREATE TABLE IF NOT EXISTS custom_foods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    phe REAL NOT NULL CHECK (phe >= 0),
    protein REAL NOT NULL CHECK (protein >= 0),
    carbs REAL NOT NULL CHECK (carbs >= 0),
    fat REAL NOT NULL CHECK (fat >= 0),
    calories REAL NOT NULL CHECK (calories >= 0),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_custom_foods_name ON custom_foods(name COLLATE NOCASE);
