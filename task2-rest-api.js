const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

let books = [
    { id: 1, title: 'Война и мир', author: 'Толстой', year: 1869 }
];
let nextId = 2;

app.get('/api/books', (req, res) => {
    res.json(books);
});

app.get('/api/books/search', (req, res) => {
    const author = req.query.author;
    if (!author) {
        return res.status(400).json({ error: 'Укажите параметр author' });
    }
    const result = books.filter(b => b.author.toLowerCase().includes(author.toLowerCase()));
    res.json(result);
});

app.get('/api/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const book = books.find(b => b.id === id);
    if (!book) {
        return res.status(404).json({ error: 'Книга не найдена' });
    }
    res.json(book);
});

app.post('/api/books', (req, res) => {
    const { title, author, year } = req.body;
    if (!title || !author || !year) {
        return res.status(400).json({ error: 'Неверные данные' });
    }
    const book = { id: nextId++, title, author, year };
    books.push(book);
    res.status(201).json(book);
});

app.put('/api/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const book = books.find(b => b.id === id);
    if (!book) {
        return res.status(404).json({ error: 'Книга не найдена' });
    }
    const { title, author, year } = req.body;
    if (title) book.title = title;
    if (author) book.author = author;
    if (year) book.year = year;
    res.json(book);
});

app.delete('/api/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = books.findIndex(b => b.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Книга не найдена' });
    }
    books.splice(index, 1);
    res.json({ message: 'Книга удалена' });
});

app.listen(PORT, () => {
    console.log('Сервер запущен на порту ' + PORT);
});