

const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({});



const getAIChatResponse = async (req, res) => {
    const { question } = req.body;
    const userId = req.user.id;

    if (!question) {
        return res.status(400).json({ message: 'A question is required.' });
    }

    let financialSummary = '';
    let fullPrompt = '';

    try {
        const user = await User.findById(userId).select('username totalIncome totalExpenses');


        const recentTransactions = await Transaction.find({ user: userId })
            .sort({ date: -1 })
            .limit(10)
            .select('description type amount category date');

        if (!user) {
            return res.status(404).json({ message: 'User data not found.' });
        }


        financialSummary = `
            User: ${user.username}
            Total Income: ${user.totalIncome.toFixed(2)}
            Total Expenses: ${user.totalExpenses.toFixed(2)}
            Current Balance: ${(user.totalIncome - user.totalExpenses).toFixed(2)}
            
            Recent Transactions (last 10):
            ${recentTransactions.map(t =>
            `${new Date(t.date).toLocaleDateString()}: ${t.type} of ${t.amount.toFixed(2)} for ${t.description} in category ${t.category}`
        ).join('\n')}
        `;


        fullPrompt = `You are a friendly and professional financial coach. Analyze the user's financial data provided below, keeping your advice concise, encouraging, and focused on the user's question. All currency is assumed to be INR (₹).

            --- FINANCIAL DATA ---
            ${financialSummary}
            --- END DATA ---

            User's Question: "${question}"
        `;


        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        });


        res.status(200).json({
            response: response.text,
            data: { balance: (user.totalIncome - user.totalExpenses) }
        });

    } catch (error) {
        console.error('AI Chat Error:', error);

        res.status(500).json({
            message: 'Server error while generating AI response.',
            error: error.message
        });
    }
};

module.exports = {
    getAIChatResponse
};