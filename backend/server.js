
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.log('Database connection failed:', err.message);
        return;
    }
    console.log('MySQL Database Connected Successfully!');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.get('/api/subscribers', (req, res) => {
    db.query('SELECT * FROM subscribers', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/subscribers', (req, res) => {
    const { full_name, phone, address } = req.body;
    const sql = 'INSERT INTO subscribers (full_name, phone, address) VALUES (?, ?, ?)';

    db.query(sql, [full_name, phone, address], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({
            message: 'Subscriber added successfully!',
            subscriber_id: result.insertId
        });
    });
});

app.put('/api/subscribers/:id', (req, res) => {
    const { full_name, phone, address } = req.body;
    const { id } = req.params;
    const sql = 'UPDATE subscribers SET full_name = ?, phone = ?, address = ? WHERE subscriber_id = ?';

    db.query(sql, [full_name, phone, address, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Subscriber not found' });
        }
        res.json({ message: 'Subscriber updated successfully!' });
    });
});

app.delete('/api/subscribers/:id', (req, res) => {
    db.query('DELETE FROM subscribers WHERE subscriber_id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Subscriber not found' });
        }
        res.json({ message: 'Subscriber deleted successfully!' });
    });
});

app.get('/api/publications', (req, res) => {
    db.query('SELECT * FROM publications ORDER BY publication_id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/publications', (req, res) => {
    const { publication_name, monthly_price, status } = req.body;

    if (!publication_name || monthly_price === undefined || Number(monthly_price) <= 0) {
        return res.status(400).json({ error: 'Please enter valid newspaper details.' });
    }

    const sql = 'INSERT INTO publications (publication_name, monthly_price, status) VALUES (?, ?, ?)';

    db.query(sql, [publication_name, monthly_price, status || 'Active'], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({
            message: 'Newspaper added successfully!',
            publication_id: result.insertId
        });
    });
});

app.put('/api/publications/:id', (req, res) => {
    const { publication_name, monthly_price } = req.body;

    if (!publication_name || !Number.isFinite(Number(monthly_price)) || Number(monthly_price) <= 0) {
        return res.status(400).json({ error: 'Enter a valid newspaper name and price.' });
    }

    const sql = 'UPDATE publications SET publication_name = ?, monthly_price = ? WHERE publication_id = ?';

    db.query(sql, [publication_name.trim(), Number(monthly_price), req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Newspaper not found.' });
        }
        res.json({ message: 'Newspaper updated successfully!' });
    });
});

app.delete('/api/publications/:id', (req, res) => {
    db.query('DELETE FROM publications WHERE publication_id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Newspaper not found.' });
        }
        res.json({ message: 'Newspaper deleted successfully!' });
    });
});

app.get('/api/delivery-agents', (req, res) => {
    db.query('SELECT * FROM delivery_agents ORDER BY agent_id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/delivery-agents', (req, res) => {
    const { full_name, phone } = req.body;

    if (!full_name || !phone) {
        return res.status(400).json({ error: 'Name and phone are required.' });
    }

    db.query(
        'INSERT INTO delivery_agents (full_name, phone) VALUES (?, ?)',
        [full_name.trim(), phone.trim()],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                message: 'Delivery agent added successfully!',
                agent_id: result.insertId
            });
        }
    );
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
