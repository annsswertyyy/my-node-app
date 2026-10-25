const express = require('express');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(compression());

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { error: 'Слишком много запросов', status: 429 },
    standardHeaders: true,
    legacyHeaders: false
});
app.use(limiter);

app.use((req, res, next) => {
    const start = Date.now();
    const now = new Date().toLocaleString('ru-RU');
    res.on('finish', () => {
        const ms = Date.now() - start;
        console.log(`[${now}] ${req.method} ${req.url} ${res.statusCode} - ${ms}ms`);
    });
    next();
});

let books = [
    { id: 1, title: 'Война и мир', author: 'Толстой', year: 1869 }
];
let nextId = 2;

app.get('/api/books', (req, res) => {
    res.json(books);
});

app.get('/api/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const book = books.find(b => b.id === id);
    if (!book) {
        const err = new Error('Книга не найдена');
        err.status = 404;
        throw err;
    }
    res.json(book);
});

app.post('/api/books', (req, res) => {
    const { title, author, year } = req.body;
    if (!title || !author || !year) {
        return res.status(400).json({ error: 'Неверные данные', status: 400 });
    }
    const book = { id: nextId++, title, author, year };
    books.push(book);
    res.status(201).json(book);
});

app.get('/error', (req, res) => {
    throw new Error('Внутренняя ошибка сервера');
});

app.get('/async-error', async (req, res, next) => {
    try {
        await Promise.reject(new Error('Асинхронная ошибка'));
    } catch (err) {
        next(err);
    }
});

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        error: err.message || 'Внутренняя ошибка сервера',
        status: err.status || 500
    });
});

app.listen(PORT, () => {
    console.log('Сервер запущен на порту ' + PORT);
});