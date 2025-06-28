const { GoogleGenerativeAI } = require('@google/generative-ai');

// Validate Gemini API key on startup
if (!process.env.GEMINI_API_KEY) {
  console.error('FATAL ERROR: GEMINI_API_KEY environment variable is not set');
  process.exit(1);
}

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
    console.log('Making Gemini API call for poll generation');
    
    const result = await model.generateContent(prompt);

    const response = await result.response;
    const text = response.text();
    
    // Log only in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('AI Response:', text);
    }

    // Parse the JSON response with improved error handling
    let pollData;
    try {
      // More comprehensive cleaning of AI response
      let cleanedText = text.trim();
      
      // Remove various markdown code block formats
      cleanedText = cleanedText
        .replace(/^```(?:json)?\s*/gm, '')  // Remove opening code blocks
        .replace(/```\s*$/gm, '')          // Remove closing code blocks
        .replace(/`{1,3}/g, '')            // Remove any remaining backticks
        .replace(/^\s*[\r\n]+/gm, '')      // Remove empty lines
        .trim();
      
      // Try to extract JSON if wrapped in other text
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }
      
      pollData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError.message);
      
      // Log raw response only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Raw AI Response:', text);
      }
      
      return res.status(500).json({
        error: true,
        message: 'AI generated an invalid response format. Please try again with a different topic.'
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
    // Log error details appropriately for environment
    if (process.env.NODE_ENV === 'development') {
      console.error('AI Poll Generation Error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data || 'No response data'
      });
    } else {
      // Production: Log only essential info without sensitive data
      console.error('AI Poll Generation Error:', error.message);
    }
    
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
