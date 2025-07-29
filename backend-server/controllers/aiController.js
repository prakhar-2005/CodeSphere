const { GoogleGenAI } = require("@google/genai");
const dotenv = require('dotenv');
dotenv.config();

const genAI = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY });

const simplifyProblem = async (req, res) => {
    const { problemStatement } = req.body;

    if (!problemStatement) {
        return res.status(400).json({ message: "Problem statement is required." });
    }

    try {
        const prompt = `Simplify the following competitive programming problem statement. Extract the core concept and key idea. Present it clearly and concisely, focusing on making it easier to understand for a beginner. Make the reponse short so it seems like an apt summary. If it's a very simple problem already, just rephrase it slightly to emphasize the core idea.

Problem Statement:
${problemStatement}

Simplified Explanation:`;

        const result = await genAI.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
        });
        const response = result.text;
        res.json({ simplifiedProblem: response });
    } catch (error) {
        console.error("Error simplifying problem with Gemini API:", error);
        res.status(500).json({ message: "Failed to simplify problem.", error: error.message });
    }
};

const generateBoilerplate = async (req, res) => {
    const { problemStatement, language } = req.body;

    if (!problemStatement || !language) {
        return res.status(400).json({ message: "Problem statement and language are required." });
    }

    try {
        const prompt = `Generate a basic boilerplate (starter code) for the following competitive programming problem in ${language}. 
        Include necessary imports/headers, the main function/method, and basic I/O setup if typical for the language. 
        Do NOT include any problem-solving logic, just the structural boilerplate. 
        Ensure the code is correctly formatted and ready to be filled in by the user.
        
        IMPORTANT: Only return the code itself. Do NOT wrap the code in markdown fences (e.g., \`\`\`python) or any other conversational text.

Problem Statement:
${problemStatement}

Language: ${language}`;

        const result = await genAI.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
        });
        const response = result.text;
        res.json({ boilerplateCode: response });
    } catch (error) {
        console.error("Error generating boilerplate with Gemini API:", error);
        res.status(500).json({ message: "Failed to generate boilerplate.", error: error.message });
    }
};

const analyzeTimeComplexity = async (req, res) => {
    const { code, language } = req.body;

    if (!code || !language) {
        return res.status(400).json({ message: "Code and language are required for complexity analysis." });
    }

    try {
        const prompt = `Analyze the time complexity of the following code snippet written in ${language}. 
        Provide the Big O notation (e.g., O(N), O(N log N)). 
        
        Then, provide a **brief and concise explanation** of how you arrived at this complexity, focusing only on the operations within the provided code. 
        
        Do NOT discuss the problem statement or alternative algorithms unless directly relevant to the provided code's logic. 
        
        Format your response using Markdown. Start with the Big O notation on a new line, followed by the explanation.
        
        Example Output:
        **Time Complexity: O(N)**
        
        This complexity arises from the single loop iterating N times.
        
Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Time Complexity Analysis:`;

        const result = await genAI.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
        });
        const response = result.text;
        res.json({ complexityAnalysis: response });
    } catch (error) {
        console.error("Error analyzing time complexity with Gemini API:", error);
        res.status(500).json({ message: "Failed to analyze time complexity.", error: error.message });
    }
};

module.exports = {
    simplifyProblem,
    generateBoilerplate,
    analyzeTimeComplexity,
};