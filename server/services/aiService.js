// server/services/aiService.js
const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from server/.env and root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error('GEMINI_API_KEY is not configured on the server');
    err.statusCode = 500;
    throw err;
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const explainComparison = async (comparisonData) => {
  if (!comparisonData || !comparisonData.comparisons || comparisonData.comparisons.length === 0) {
    const err = new Error('Valid comparison data is required for explanation');
    err.statusCode = 400;
    throw err;
  }

  const ai = getGeminiClient();

  const loanSummaries = comparisonData.comparisons.map((c) => ({
    bank: c.loan.bank_name,
    type: c.loan.loan_type,
    rate: `${c.loan.interest_rate}%`,
    monthlyEmi: `₹${c.summary.monthlyEmi}`,
    totalInterest: `₹${c.summary.totalInterest}`,
    processingFee: `₹${c.summary.processingFee}`,
    totalCost: `₹${c.summary.totalCost}`,
    effectiveCostPercent: `${c.summary.effectiveCostPercent}%`,
  }));

  const prompt = `Analyze this loan comparison for amount ₹${comparisonData.amount} over ${comparisonData.tenureMonths} months:
${JSON.stringify(loanSummaries, null, 2)}

Best value metrics:
${JSON.stringify(comparisonData.bestValue || {}, null, 2)}

Please provide a concise plain-language recommendation under 120 words highlighting which loan offers the best overall financial value and why.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      systemInstruction: 'You are an objective loan advisor. Provide a concise, clear plain-language recommendation under 120 words explaining which loan is the best choice and why.',
    },
  });

  return response.text;
};

module.exports = {
  explainComparison,
};
