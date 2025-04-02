require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/api/ask', async (req, res) => {
  const { question, language } = req.body;

  try {
    const translatedInput = await translateText(question, language, 'EN');

    const aiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: translatedInput }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const aiMessage = aiResponse.data.choices[0].message.content;
    const translatedOutput = await translateText(aiMessage, 'EN', language);

    res.status(200).json({ reply: translatedOutput });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

async function translateText(text, from, to) {
  try {
    const response = await axios.post(
      'https://api-free.deepl.com/v2/translate',
      new URLSearchParams({
        auth_key: process.env.DEEPL_API_KEY,
        text: text,
        source_lang: from,
        target_lang: to,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );
    return response.data.translations[0].text;
  } catch (error) {
    console.error('Translation Error:', error.message);
    return text;
  }
}

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
