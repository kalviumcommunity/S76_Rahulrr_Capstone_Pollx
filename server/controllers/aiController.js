const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate poll using AI
const generatePoll = async (req, res) => {
  try {
    const { topic } = req.body;

    // Validation
    if (!topic || !topic.trim()) {
      return res.status(400).json({ 
        error: true,
        message: 'Topic is required for poll generation' 
      });
    }

    if (topic.trim().length > 100) {
      return res.status(400).json({ 
        error: true,
        message: 'Topic must be less than 100 characters' 
      });
    }

    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Craft the prompt for poll generation
    const prompt = `Generate a poll question and options for the topic: "${topic.trim()}"

Requirements:
1. Create an engaging, clear poll question
2. Provide exactly 2-4 answer options
3. Make options balanced and distinct
4. Keep question under 150 characters
5. Keep each option under 50 characters
6. Make it suitable for a social polling platform

Respond ONLY with valid JSON in this exact format:
{
  "question": "Your poll question here?",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"]
}

Topic: ${topic.trim()}`;

    // Generate content with simple format for Gemini API
    console.log('Making Gemini API call with topic:', topic.trim());
    
    const result = await model.generateContent(prompt);

    const response = await result.response;
    const text = response.text();
    
    console.log('AI Response:', text);

    // Parse the JSON response
    let pollData;
    try {
      // Clean the response - remove any markdown formatting
      const cleanedText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/`/g, '')
        .trim();
      
      pollData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw AI Response:', text);
      
      return res.status(500).json({
        error: true,
        message: 'Failed to parse AI response. Please try again with a different topic.'
      });
    }

    // Validate the generated poll structure
    if (!pollData.question || !pollData.options || !Array.isArray(pollData.options)) {
      return res.status(500).json({
        error: true,
        message: 'AI generated invalid poll format. Please try again.'
      });
    }

    if (pollData.options.length < 2 || pollData.options.length > 4) {
      return res.status(500).json({
        error: true,
        message: 'AI generated poll with invalid number of options. Please try again.'
      });
    }

    // Validate that all options have content
    const validOptions = pollData.options.filter(option => option && option.trim().length > 0);
    if (validOptions.length !== pollData.options.length) {
      return res.status(500).json({
        error: true,
        message: 'AI generated poll with empty options. Please try again.'
      });
    }

    // Return successful response
    res.json({
      success: true,
      poll: {
        question: pollData.question.trim(),
        options: pollData.options.map(option => option.trim()),
        generatedBy: 'ai',
        topic: topic.trim()
      }
    });

  } catch (error) {
    console.error('AI Poll Generation Error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data || 'No response data'
    });
    
    // Handle specific API errors
    if (error.message && error.message.includes('API key')) {
      return res.status(500).json({
        error: true,
        message: 'AI service configuration error. Please try again later.'
      });
    }

    if (error.message && error.message.includes('quota')) {
      return res.status(500).json({
        error: true,
        message: 'AI service temporarily unavailable. Please try again later.'
      });
    }

    // Generic error
    res.status(500).json({
      error: true,
      message: 'Failed to generate poll with AI. Please try creating manually or try again later.'
    });
  }
};

module.exports = {
  generatePoll
};
