const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

let books = [
    { id: 1, title: 'Война и мир', author: 'Толстой', year: 1869, genre: 'роман' },
    { id: 2, title: 'Преступление и наказание', author: 'Достоевский', year: 1866, genre: 'роман' },
    { id: 3, title: 'Мастер и Маргарита', author: 'Булгаков', year: 1967, genre: 'роман' },
    { id: 4, title: '1984', author: 'Оруэлл', year: 1949, genre: 'антиутопия' }
];
let nextId = 5;

app.get('/api/books', (req, res) => {
    let result = books.slice();

    if (req.query.author) {
        result = result.filter(b => b.author.toLowerCase().includes(req.query.author.toLowerCase()));
    }
    if (req.query.year) {
        result = result.filter(b => b.year === Number(req.query.year));
    }
    if (req.query.yearFrom && req.query.yearTo) {
        const from = Number(req.query.yearFrom);
        const to = Number(req.query.yearTo);
        result = result.filter(b => b.year >= from && b.year <= to);
    }
    if (req.query.search) {
        const s = req.query.search.toLowerCase();
        result = result.filter(b =>
            b.title.toLowerCase().includes(s) || b.author.toLowerCase().includes(s)
        );
    }

    if (req.query.sort) {
        const sort = req.query.sort;
        if (sort === 'title') result.sort((a, b) => a.title.localeCompare(b.title));
        else if (sort === '-year') result.sort((a, b) => b.year - a.year);
    }

    const total = result.length;
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const offset = (page - 1) * limit;
    result = result.slice(offset, offset + limit);

    res.json({
        data: result,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
});

app.get('/api/books/stats', (req, res) => {
    const total = books.length;
    const byAuthor = {};
    const byGenre = {};
    let oldestYear = Infinity;
    let newestYear = -Infinity;

    books.forEach(b => {
        byAuthor[b.author] = (byAuthor[b.author] || 0) + 1;
        byGenre[b.genre] = (byGenre[b.genre] || 0) + 1;
        if (b.year < oldestYear) oldestYear = b.year;
        if (b.year > newestYear) newestYear = b.year;
    });

    res.json({ total, byAuthor, byGenre, oldestYear, newestYear });
});

app.get('/api/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const book = books.find(b => b.id === id);
    if (!book) return res.status(404).json({ error: 'Книга не найдена', status: 404 });
    res.json(book);
});

app.post('/api/books', (req, res) => {
    const { title, author, year, genre } = req.body;

    if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Название обязательно', status: 400 });
    }
    if (!year || year < 1000 || year > 2030) {
        return res.status(400).json({ error: 'Неверный год', status: 400 });
    }

    const duplicate = books.find(b => b.title === title && b.author === author);
    if (duplicate) {
        return res.status(400).json({ error: 'Такая книга уже есть', status: 400 });
    }

    const book = { id: nextId++, title, author, year, genre };
    books.push(book);
    res.status(201).json(book);
});

app.put('/api/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const book = books.find(b => b.id === id);
    if (!book) return res.status(404).json({ error: 'Книга не найдена', status: 404 });

    const { title, author, year, genre } = req.body;
    if (title) book.title = title;
    if (author) book.author = author;
    if (year) book.year = year;
    if (genre) book.genre = genre;
    res.json(book);
});


app.delete('/api/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = books.findIndex(b => b.id === id);
    if (index === -1) return res.status(404).json({ error: 'Книга не найдена', status: 404 });
    books.splice(index, 1);
    res.json({ message: 'Книга удалена' });
});

app.listen(PORT, () => {
    console.log('Сервер запущен на порту ' + PORT);
});