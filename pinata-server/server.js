const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // если используете node 18+, встроен fetch, можно убрать импорт
const app = express();
const PORT = 3000;


const JWT = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI2MTQ2ZGRkNC1mZDk4LTQ4NDMtOTlkNC02ZGJkNjUzYTk5ZDgiLCJlbWFpbCI6ImlubmV0YTNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjdkZjIxNjdjZWQ2ZDk5MGFiMGI0Iiwic2NvcGVkS2V5U2VjcmV0IjoiYjM5YzljN2FiZjMxMGVmNjEwYzdjZTQxOTFkYWI0YWFlMDcxNDBlOGVmMWU5NjRlZjhiYzBiODc1ZDBlZWVkNiIsImV4cCI6MTc4ODk3MDQ5OX0.maWoeIsrDcY4JL9ItBvJuQXMy8WWCShG1CbZ_I_29EE"; // токен JWT для Pinata (вместо apiKey и secretApiKey)

// Чтобы express мог читать JSON в теле запроса
app.use(express.json());

// Настройка CORS
app.use(cors({
    origin: 'http://localhost:5062', // фронтенд
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: false 
    //allowedHeaders: ['Content-Type', 'Authorization'],
    //credentials: true // важно, если на фронте credentials: 'include'
}));

// Обработка POST запроса на /upload
app.post('/upload', async (req, res) => {
    console.log('POST /upload вызван');
    console.log('Тело запроса:', req.body);
    //

    try {
        // Отправляем данные на Pinata
        const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': JWT
            },
            body: JSON.stringify(req.body)
        });

        if (!pinataResponse.ok) {
            const errorText = await pinataResponse.text();
            console.error("Ошибка от Pinata:", errorText);
            return res.status(pinataResponse.status).json({ error: errorText });
        }

        const data = await pinataResponse.json();

        console.log('Pinata response:', data);

        // Возвращаем IpfsHash клиенту
        res.status(200).json({ IpfsHash: data.IpfsHash });

        //res.status(200).json({ IpfsHash: 'QmPfe83NvuAfDAX6RRNgtPTkjZmVoyL4zwMAUttu6JCiZE' });
        //res.status(200).json({ IpfsHash: '12345' });
    } catch (error) {
        console.error('❌ Ошибка в сервере:', error.stack || error);
        res.status(500).json({ error: 'Ошибка загрузки в Pinata' });
    }
});


// Обработка GET запроса на /test
app.post('/test', (req, res) => {
    console.log('POST /test вызван');
    res.status(200).json({ message: 'Test endpoint is working!' });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
