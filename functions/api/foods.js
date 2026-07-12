const CUSTOM_FOOD_ID_OFFSET = 100000;

const createTableSql = `CREATE TABLE IF NOT EXISTS custom_foods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    phe REAL NOT NULL CHECK (phe >= 0),
    protein REAL NOT NULL CHECK (protein >= 0),
    carbs REAL NOT NULL CHECK (carbs >= 0),
    fat REAL NOT NULL CHECK (fat >= 0),
    calories REAL NOT NULL CHECK (calories >= 0),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;
const createIndexSql = 'CREATE INDEX IF NOT EXISTS idx_custom_foods_name ON custom_foods(name COLLATE NOCASE)';

const json = (body, status = 200) => Response.json(body, {
    status,
    headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
    }
});

const getDatabase = (context) => {
    if (!context.env.DB) {
        throw new Error('Die Cloudflare-D1-Bindung "DB" fehlt.');
    }
    return context.env.DB;
};

const ensureSchema = async (db) => {
    await db.batch([
        db.prepare(createTableSql),
        db.prepare(createIndexSql)
    ]);
};

const toFood = (row) => ({
    id: CUSTOM_FOOD_ID_OFFSET + Number(row.id),
    name: row.name,
    category: row.category,
    phe: Number(row.phe),
    protein: Number(row.protein),
    carbs: Number(row.carbs),
    fat: Number(row.fat),
    calories: Number(row.calories),
    custom: true
});

const cleanText = (value, maxLength) => String(value ?? '').normalize('NFKC').trim().slice(0, maxLength);

const validateFood = (payload) => {
    const food = {
        name: cleanText(payload?.name, 120),
        category: cleanText(payload?.category, 60),
        phe: Number(payload?.phe),
        protein: Number(payload?.protein),
        carbs: Number(payload?.carbs),
        fat: Number(payload?.fat),
        calories: Number(payload?.calories)
    };

    if (!food.name || !food.category) return { error: 'Name und Kategorie sind erforderlich.' };
    const nutrientKeys = ['phe', 'protein', 'carbs', 'fat', 'calories'];
    if (!nutrientKeys.every(key => Number.isFinite(food[key]) && food[key] >= 0 && food[key] <= 100000)) {
        return { error: 'Alle Nährwerte müssen gültige, nicht negative Zahlen sein.' };
    }
    return { food };
};

export async function onRequestGet(context) {
    try {
        const db = getDatabase(context);
        await ensureSchema(db);
        const { results } = await db.prepare(`
            SELECT id, name, category, phe, protein, carbs, fat, calories
            FROM custom_foods
            ORDER BY name COLLATE NOCASE ASC, id ASC
        `).all();
        return json({ foods: results.map(toFood) });
    } catch (error) {
        console.error('Custom foods GET failed', error);
        return json({ error: error.message || 'Lebensmittel konnten nicht geladen werden.' }, 503);
    }
}

export async function onRequestPost(context) {
    try {
        const contentType = context.request.headers.get('content-type') || '';
        if (!contentType.toLowerCase().includes('application/json')) {
            return json({ error: 'Content-Type application/json ist erforderlich.' }, 415);
        }

        const contentLength = Number(context.request.headers.get('content-length') || 0);
        if (contentLength > 8192) return json({ error: 'Die Anfrage ist zu groß.' }, 413);

        const validation = validateFood(await context.request.json());
        if (validation.error) return json({ error: validation.error }, 400);

        const db = getDatabase(context);
        await ensureSchema(db);
        const food = validation.food;
        const row = await db.prepare(`
            INSERT INTO custom_foods (name, category, phe, protein, carbs, fat, calories)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            RETURNING id, name, category, phe, protein, carbs, fat, calories
        `).bind(
            food.name,
            food.category,
            food.phe,
            food.protein,
            food.carbs,
            food.fat,
            food.calories
        ).first();

        return json({ food: toFood(row) }, 201);
    } catch (error) {
        console.error('Custom foods POST failed', error);
        if (error instanceof SyntaxError) return json({ error: 'Ungültiges JSON.' }, 400);
        return json({ error: error.message || 'Lebensmittel konnte nicht gespeichert werden.' }, 503);
    }
}
