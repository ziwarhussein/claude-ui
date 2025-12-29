export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, model, apiKey } = req.body;

  console.log('=== API CALL DEBUG ===');
  console.log('API Key present:', !!apiKey);
  console.log('API Key length:', apiKey ? apiKey.length : 0);
  console.log('API Key starts with:', apiKey ? apiKey.substring(0, 10) + '...' : 'none');
  console.log('Model:', model);
  console.log('Messages count:', messages ? messages.length : 0);

  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required' });
  }

  if (!apiKey.startsWith('sk-ant-')) {
    return res.status(400).json({ error: 'Invalid API key format - should start with sk-ant-' });
  }

  try {
    const requestBody = {
      model: model,
      max_tokens: 4096,
      messages: messages
    };

    console.log('Sending to Anthropic:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('Anthropic API Error:', JSON.stringify(error, null, 2));
      return res.status(response.status).json({ 
        error: error.error?.message || 'API request failed',
        details: error,
        debugInfo: {
          model: model,
          hasApiKey: !!apiKey,
          status: response.status
        }
      });
    }

    const data = await response.json();
    console.log('Success! Response received');
    
    // Extract text content from response
    const content = data.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');

    return res.status(200).json({ content });
  } catch (error) {
    console.error('Exception:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}
