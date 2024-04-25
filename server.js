/** @format */

const express = require('express');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/notes', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// Push notes to server
app.get('/api/notes', (req, res) => {
	fs.readFile('db.json', 'utf8', (err, data) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ error: 'Failed to read notes from file' });
		}
		res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
		res.setHeader('Pragma', 'no-cache');
		res.setHeader('Expires', '0');
		res.json(JSON.parse(data));
	});
});
// Show saved notes
app.post('/api/notes', (req, res) => {
	fs.readFile('db.json', 'utf8', (err, data) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ error: 'Failed to read notes from file' });
		}
		const notes = JSON.parse(data);
		const newNote = {
			id: Date.now().toString(),
			title: req.body.title,
			text: req.body.text,
		};
		notes.push(newNote);
		fs.writeFile('db.json', JSON.stringify(notes), (err) => {
			if (err) {
				console.error(err);
				return res.status(500).json({ error: 'Failed to save note' });
			}
			res.json(newNote);
		});
	});
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
// Bonus portion
app.delete('/api/notes/:id', (req, res) => {
	const noteId = req.params.id;
	fs.readFile('db.json', 'utf8', (err, data) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ error: 'Failed to read notes from file' });
		}
		let notes = JSON.parse(data);
		notes = notes.filter((note) => note.id !== noteId);
		fs.writeFile('db.json', JSON.stringify(notes), (err) => {
			if (err) {
				console.error(err);
				return res.status(500).json({ error: 'Failed to delete note' });
			}
			res.sendStatus(204);
		});
	});
});
