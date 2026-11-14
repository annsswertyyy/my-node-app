const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

const bookPool = {
    titles: ['Мастер и Маргарита', 'Тихий Дон', 'Отцы и дети', 'Обломов', 'Герой нашего времени', 'Мёртвые души', 'Ревизор', 'Горе от ума', 'Евгений Онегин', 'Братья Карамазовы'],
    authors: ['Булгаков', 'Шолохов', 'Тургенев', 'Гончаров', 'Лермонтов', 'Гоголь', 'Грибоедов', 'Пушкин', 'Достоевский', 'Толстой'],
    genres: ['классика', 'роман', 'драма', 'поэма', 'комедия']
};

let library = [];
let currentId = 1;

function generateBooks(count) {
    for (let i = 0; i < count; i++) {
        const t = bookPool.titles[i % bookPool.titles.length];
        const a = bookPool.authors[i % bookPool.authors.length];
        const g = bookPool.genres[i % bookPool.genres.length];
        const y = 1850 + Math.floor(Math.random() * 150);
        const isbn = `978-5-${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 9) + 1}`;
        library.push({
            id: currentId++,
            title: `${t} (изд. ${i + 1})`,
            author: a,
            year: y,
            genre: g,
            isbn: isbn,
            isAvailable: Math.random() > 0.2
        });
    }
}

generateBooks(100);

const queryCache = new Map();

function cacheGet(key) {
    const item = queryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expires) {
        queryCache.delete(key);
        return null;
    }
    return item.value;
}

function cacheSet(key, value, ttlMs = 300000) {
    queryCache.set(key, { value, expires: Date.now() + ttlMs });
}

app.get('/api/books', (req, res) => {
    const cacheKey = 'books:' + JSON.stringify(req.query);
    const cached = cacheGet(cacheKey);
    if (cached) {
        return res.json({ ...cached, fromCache: true });
    }

    let filtered = [...library];

    const { author, genre, available, sort, limit, page } = req.query;

    if (author) {
        filtered = filtered.filter(b => b.author.toLowerCase().includes(author.toLowerCase()));
    }
    if (genre) {
        filtered = filtered.filter(b => b.genre === genre);
    }
    if (available === 'true') {
        filtered = filtered.filter(b => b.isAvailable);
    }

    if (sort === 'title') {
        filtered.sort((x, y) => x.title.localeCompare(y.title));
    } else if (sort === '-year') {
        filtered.sort((x, y) => y.year - x.year);
    }

    const total = filtered.length;
    const pageSize = Math.min(Number(limit) || 10, 100);
    const pageNum = Math.max(Number(page) || 1, 1);
    const start = (pageNum - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    const result = {
        data: paginated,
        pagination: {
            total,
            page: pageNum,
            limit: pageSize,
            pages: Math.ceil(total / pageSize)
        }
    };

    cacheSet(cacheKey, result);
    res.json(result);
});

app.get('/api/books/stats', (req, res) => {
    const total = library.length;
    const availableCount = library.filter(b => b.isAvailable).length;
    const oldest = library.reduce((min, b) => b.year < min ? b.year : min, Infinity);
    const newest = library.reduce((max, b) => b.year > max ? b.year : max, -Infinity);

    const genreStats = {};
    library.forEach(b => {
        genreStats[b.genre] = (genreStats[b.genre] || 0) + 1;
    });

    res.json({
        total,
        available: availableCount,
        oldestYear: oldest,
        newestYear: newest,
        byGenre: genreStats
    });
});

app.get('/api/books/available', (req, res) => {
    const available = library.filter(b => b.isAvailable);
    res.json({ count: available.length, data: available });
});

app.get('/api/books/:id', (req, res) => {
    const book = library.find(b => b.id === Number(req.params.id));
    if (!book) {
        return res.status(404).json({ error: 'Книга не найдена', status: 404 });
    }
    res.json(book);
});

app.post('/api/books', (req, res) => {
    const { title, author, year, genre } = req.body;
    if (!title || !author || !year) {
        return res.status(400).json({ error: 'Неверные данные', status: 400 });
    }
    if (library.some(b => b.title === title && b.author === author)) {
        return res.status(409).json({ error: 'Дубликат', status: 409 });
    }
    const newBook = {
        id: currentId++,
        title,
        author,
        year,
        genre: genre || 'неизвестно',
        isbn: `978-5-${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 9) + 1}`,
        isAvailable: true
    };
    library.push(newBook);
    queryCache.clear();
    res.status(201).json(newBook);
});

app.put('/api/books/:id', (req, res) => {
    const book = library.find(b => b.id === Number(req.params.id));
    if (!book) {
        return res.status(404).json({ error: 'Книга не найдена', status: 404 });
    }
    const allowed = ['title', 'author', 'year', 'genre', 'isAvailable'];
    allowed.forEach(field => {
        if (req.body[field] !== undefined) {
            book[field] = req.body[field];
        }
    });
    queryCache.clear();
    res.json(book);
});

app.delete('/api/books/:id', (req, res) => {
    const index = library.findIndex(b => b.id === Number(req.params.id));
    if (index === -1) {
        return res.status(404).json({ error: 'Книга не найдена', status: 404 });
    }
    library.splice(index, 1);
    queryCache.clear();
    res.json({ deleted: true, id: Number(req.params.id) });
});

app.listen(PORT, () => {
    console.log('Библиотека запущена на порту ' + PORT);
    console.log('Сгенерировано книг: ' + library.length);
});