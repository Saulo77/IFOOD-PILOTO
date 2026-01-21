// server.js - Versão Simplificada para Iniciar
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

// Conexão com MongoDB (use MongoDB Atlas ou local)
const MONGODB_URI = 'mongodb://127.0.0.1:27017/foodapp';
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB conectado'))
.catch(err => console.log('❌ Erro MongoDB:', err));

// Schemas simples
const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

const RestaurantSchema = new mongoose.Schema({
    name: String,
    category: String,
    deliveryTime: String,
    rating: Number,
    image: String
});

const User = mongoose.model('User', UserSchema);
const Restaurant = mongoose.model('Restaurant', RestaurantSchema);

// Rotas básicas
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        
        const token = jwt.sign(
            { userId: user._id },
            'secret_key',
            { expiresIn: '7d' }
        );
        
        res.json({ token, user: { id: user._id, name, email } });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        
        const token = jwt.sign(
            { userId: user._id },
            'secret_key',
            { expiresIn: '7d' }
        );
        
        res.json({ 
            token, 
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email
            } 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Rota para adicionar restaurantes de exemplo
app.post('/api/seed-restaurants', async (req, res) => {
    try {
        await Restaurant.deleteMany({});
        
        const restaurants = [
            {
                name: "Burguer King",
                category: "Fast Food",
                deliveryTime: "30-40 min",
                rating: 4.5,
                image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400"
            },
            {
                name: "Pizza Hut",
                category: "Pizza",
                deliveryTime: "40-50 min",
                rating: 4.3,
                image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400"
            },
            {
                name: "McDonald's",
                category: "Fast Food",
                deliveryTime: "20-30 min",
                rating: 4.2,
                image: "https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400"
            },
            {
                name: "Outback",
                category: "Australiana",
                deliveryTime: "50-60 min",
                rating: 4.7,
                image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400"
            },
            {
                name: "China in Box",
                category: "Chinesa",
                deliveryTime: "40-50 min",
                rating: 4.1,
                image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400"
            }
        ];
        
        await Restaurant.insertMany(restaurants);
        res.json({ message: "Restaurantes adicionados!", count: restaurants.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/restaurants', async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        res.json(restaurants);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rota de teste
app.get('/api/test', (req, res) => {
    res.json({ message: "API funcionando! 🚀" });
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
    console.log(`📌 Teste a API: http://localhost:${PORT}/api/test`);
    console.log(`📌 Restaurantes: http://localhost:${PORT}/api/restaurants`);
});