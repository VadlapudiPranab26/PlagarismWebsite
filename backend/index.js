const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const cheerio = require('cheerio');
const { OpenAI } = require('openai');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const BING_API_KEY = process.env.BING_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
let mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/plagiarism-checker';

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory DB for testing
let mongod;
async function startDb() {
  if (process.env.NODE_ENV !== 'production') {
    mongod = await MongoMemoryServer.create();
    mongoURI = mongod.getUri();
  }
  mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// Schemas
// ... (Schemas are the same)
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', UserSchema);

const CheckSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, required: true },
  percentage: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});
const Check = mongoose.model('Check', CheckSchema);


// Auth Middleware
// ... (auth middleware is the same)
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).send('Access denied. No token provided.');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send('Invalid token.');
  }
};


// AI & Web Scraping Functions
async function getSearchResults(query) {
    if (!BING_API_KEY) {
        console.log("Bing API key not found. Returning mock search results.");
        return [{ title: "Mock Source 1", url: "https://example.com/mock1" }];
    }
    try {
        const endpoint = 'https://api.bing.microsoft.com/v7.0/search';
        const { data } = await axios.get(endpoint, {
            headers: { 'Ocp-Apim-Subscription-Key': BING_API_KEY },
            params: { q: query, count: 3 } // Limit to 3 results for now
        });
        return data.webPages ? data.webPages.value.map(result => ({ title: result.name, url: result.url })) : [];
    } catch (error) {
        console.error("Error fetching search results:", error.response?.data || error.message);
        return [];
    }
}

async function scrapeContent(url) {
    try {
        const { data } = await axios.get(url, { timeout: 4000 });
        const $ = cheerio.load(data);
        return $('p').text().substring(0, 5000); // Limit content size
    } catch (error) {
        console.error(`Error scraping ${url}:`, error.message);
        return '';
    }
}

async function getEmbedding(text) {
    if (!openai) {
        console.log("OpenAI API key not found. Returning mock embedding.");
        return Array(1536).fill(0.1);
    }
    try {
        const response = await openai.embeddings.create({
            model: "text-embedding-3-large",
            input: text.replace(/\n/g, ' '),
        });
        return response.data[0].embedding;
    } catch (error) {
        console.error("Error getting embedding:", error.response?.data || error.message);
        return null;
    }
}

function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB) return 0;
    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function paraphraseText(text) {
    if (!openai) {
        return "Paraphrasing requires an OpenAI API key.";
    }
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: `Paraphrase the following text: "${text}"` }],
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error("Error paraphrasing text:", error);
        return "Could not paraphrase text.";
    }
}


// API Routes
app.post('/api/check', auth, async (req, res) => {
    const { text } = req.body;
    if (!text || text.trim().length < 20) {
        return res.status(400).json({ error: 'Text must be at least 20 characters long.' });
    }

    const searchResults = await getSearchResults(text.substring(0, 100));
    const userTextEmbedding = await getEmbedding(text);

    if (!userTextEmbedding) {
        return res.status(500).json({ error: 'Could not process text for checking.' });
    }

    let similarityScores = [];
    let sources = [];

    for (const result of searchResults) {
        const scrapedText = await scrapeContent(result.url);
        if (scrapedText) {
            const scrapedTextEmbedding = await getEmbedding(scrapedText);
            const similarity = cosineSimilarity(userTextEmbedding, scrapedTextEmbedding);
            if (similarity > 0.8) { // Similarity threshold
                similarityScores.push(similarity);
                sources.push(result);
            }
        }
    }

    const maxSimilarity = similarityScores.length > 0 ? Math.max(...similarityScores) : 0;
    const uniquePercentage = (1 - maxSimilarity) * 100;

    const newCheck = new Check({
        user: req.user.userId,
        content: text,
        percentage: uniquePercentage,
    });
    await newCheck.save();

    res.json({
        uniquePercentage,
        plagiarizedText: text, // Highlighting will be handled by the frontend
        sources,
    });
});


// ... (Other routes are the same)
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send("Username and password required.");
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });
  try {
    await user.save();
    res.status(201).send('User created successfully.');
  } catch (error) {
    res.status(400).send('Username already exists.');
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).send('Invalid credentials.');
  }
  const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

app.post('/api/paraphrase', auth, async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required.' });
    const paraphrasedText = await paraphraseText(text);
    res.json({ paraphrasedText });
});

app.get('/api/checks', auth, async (req, res) => {
  const checks = await Check.find({ user: req.user.userId }).sort({ timestamp: -1 }).limit(20);
  res.json(checks);
});


async function startServer() {
    await startDb();
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

startServer();
