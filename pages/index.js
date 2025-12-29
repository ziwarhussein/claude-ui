import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('claude-sonnet-4-20250514');
  const [files, setFiles] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const models = [
    { id: 'claude-opus-4-5-20250514', name: 'Claude Opus 4.5' },
    { id: 'claude-opus-4-20250514', name: 'Claude Opus 4' },
    { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
    { id: 'claude-sonnet-3-5-20241022', name: 'Claude 3.5 Sonnet' },
    { id: 'claude-haiku-3-5-20241022', name: 'Claude 3.5 Haiku' },
  ];

  useEffect(() => {
    const savedKey = localStorage.getItem('anthropic_api_key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveApiKey = () => {
    localStorage.setItem('anthropic_api_key', apiKey);
    setShowSettings(false);
  };

  const handleFileUpload = async (e) => {
    const uploadedFiles = Array.from(e.target.files);
    const filePromises = uploadedFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target.result.split(',')[1];
          resolve({
            name: file.name,
            type: file.type,
            data: base64,
            size: file.size
          });
        };
        reader.readAsDataURL(file);
      });
    });

    const processedFiles = await Promise.all(filePromises);
    setFiles([...files, ...processedFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
    if (!input.trim() && files.length === 0) return;
    if (!apiKey) {
      alert('Please set your API key in settings first!');
      setShowSettings(true);
      return;
    }

    const userMessage = {
      role: 'user',
      content: input,
      files: [...files]
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    // Build content array for API
    const contentArray = [];
    
    // Add files first
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        contentArray.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: file.type,
            data: file.data
          }
        });
      } else if (file.type === 'application/pdf') {
        contentArray.push({
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: file.data
          }
        });
      }
    });

    // Add text
    if (input.trim()) {
      contentArray.push({
        type: 'text',
        text: input
      });
    }

    setFiles([]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({
              role: m.role,
              content: m.content
            })),
            {
              role: 'user',
              content: contentArray
            }
          ],
          model: model,
          apiKey: apiKey
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content
      }]);
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const newChat = () => {
    setMessages([]);
    setFiles([]);
  };

  return (
    <div className="container">
      <Head>
        <title>Claude UI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Settings</h2>
            <div className="settings-group">
              <label>Anthropic API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="api-key-input"
              />
              <small>Get your API key from console.anthropic.com</small>
            </div>
            <div className="modal-buttons">
              <button onClick={saveApiKey} className="save-btn">Save</button>
              <button onClick={() => setShowSettings(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="header">
        <div className="header-left">
          <h1>Claude</h1>
          <select 
            value={model} 
            onChange={(e) => setModel(e.target.value)}
            className="model-selector"
          >
            {models.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div className="header-right">
          <button onClick={newChat} className="new-chat-btn">New Chat</button>
          <button onClick={() => setShowSettings(true)} className="settings-btn">⚙️</button>
        </div>
      </header>

      {/* Chat Area */}
      <div className="chat-container">
        {messages.length === 0 ? (
          <div className="welcome">
            <h2>How can Claude help you today?</h2>
            <p>Upload files, ask questions, or start a conversation</p>
          </div>
        ) : (
          <div className="messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="message-content">
                  {msg.files && msg.files.length > 0 && (
                    <div className="message-files">
                      {msg.files.map((file, i) => (
                        <div key={i} className="file-preview-msg">
                          {file.type.startsWith('image/') ? (
                            <img src={`data:${file.type};base64,${file.data}`} alt={file.name} />
                          ) : (
                            <span>📄 {file.name}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="message-text">{msg.content}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="message assistant">
                <div className="message-content">
                  <div className="typing">Claude is thinking...</div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="input-container">
        {files.length > 0 && (
          <div className="file-previews">
            {files.map((file, idx) => (
              <div key={idx} className="file-preview">
                {file.type.startsWith('image/') ? (
                  <img src={`data:${file.type};base64,${file.data}`} alt={file.name} />
                ) : (
                  <div className="file-icon">📄</div>
                )}
                <span className="file-name">{file.name}</span>
                <button onClick={() => removeFile(idx)} className="remove-file">×</button>
              </div>
            ))}
          </div>
        )}
        
        <div className="input-box">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/*,application/pdf"
            style={{ display: 'none' }}
          />
          <button 
            onClick={() => fileInputRef.current.click()}
            className="attach-btn"
            title="Attach files"
          >
            📎
          </button>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message Claude..."
            rows={1}
            disabled={loading}
          />
          
          <button 
            onClick={sendMessage}
            disabled={loading || (!input.trim() && files.length === 0)}
            className="send-btn"
          >
            ↑
          </button>
        </div>
      </div>

      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #212121;
          color: #ececec;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          border-bottom: 1px solid #2f2f2f;
          background: #171717;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-left h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .model-selector {
          background: #2f2f2f;
          color: #ececec;
          border: 1px solid #404040;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
          cursor: pointer;
        }

        .header-right {
          display: flex;
          gap: 0.5rem;
        }

        .new-chat-btn, .settings-btn {
          background: #2f2f2f;
          color: #ececec;
          border: 1px solid #404040;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background 0.2s;
        }

        .new-chat-btn:hover, .settings-btn:hover {
          background: #404040;
        }

        .chat-container {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
        }

        .welcome {
          text-align: center;
          margin-top: 10rem;
        }

        .welcome h2 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          color: #ececec;
        }

        .welcome p {
          color: #a0a0a0;
        }

        .messages {
          max-width: 800px;
          margin: 0 auto;
        }

        .message {
          margin-bottom: 1.5rem;
          display: flex;
        }

        .message.user {
          justify-content: flex-end;
        }

        .message-content {
          max-width: 80%;
          padding: 1rem 1.5rem;
          border-radius: 18px;
          line-height: 1.5;
        }

        .message.user .message-content {
          background: #2f2f2f;
          color: #ececec;
        }

        .message.assistant .message-content {
          background: #171717;
          color: #ececec;
          border: 1px solid #2f2f2f;
        }

        .message-files {
          margin-bottom: 0.5rem;
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .file-preview-msg img {
          max-width: 200px;
          max-height: 200px;
          border-radius: 8px;
        }

        .file-preview-msg span {
          display: block;
          padding: 0.5rem;
          background: #404040;
          border-radius: 6px;
          font-size: 0.85rem;
        }

        .typing {
          color: #a0a0a0;
          font-style: italic;
        }

        .input-container {
          padding: 1rem 2rem 2rem;
          background: #212121;
          border-top: 1px solid #2f2f2f;
        }

        .file-previews {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .file-preview {
          position: relative;
          background: #2f2f2f;
          border: 1px solid #404040;
          border-radius: 8px;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          max-width: 200px;
        }

        .file-preview img {
          width: 40px;
          height: 40px;
          object-fit: cover;
          border-radius: 4px;
        }

        .file-icon {
          font-size: 1.5rem;
        }

        .file-name {
          font-size: 0.85rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
        }

        .remove-file {
          background: #ff4444;
          color: white;
          border: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1rem;
          line-height: 1;
          padding: 0;
        }

        .input-box {
          display: flex;
          gap: 0.5rem;
          align-items: flex-end;
          background: #2f2f2f;
          border: 1px solid #404040;
          border-radius: 24px;
          padding: 0.5rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .attach-btn {
          background: transparent;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
          color: #a0a0a0;
          transition: color 0.2s;
        }

        .attach-btn:hover {
          color: #ececec;
        }

        .input-box textarea {
          flex: 1;
          background: transparent;
          border: none;
          color: #ececec;
          font-size: 1rem;
          resize: none;
          outline: none;
          max-height: 200px;
          padding: 0.75rem 0.5rem;
          font-family: inherit;
        }

        .send-btn {
          background: #ececec;
          color: #212121;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .send-btn:disabled {
          background: #404040;
          color: #666;
          cursor: not-allowed;
        }

        .send-btn:not(:disabled):hover {
          background: #fff;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: #2f2f2f;
          padding: 2rem;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          border: 1px solid #404040;
        }

        .modal h2 {
          margin-top: 0;
          margin-bottom: 1.5rem;
        }

        .settings-group {
          margin-bottom: 1.5rem;
        }

        .settings-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .settings-group small {
          display: block;
          color: #a0a0a0;
          margin-top: 0.5rem;
          font-size: 0.85rem;
        }

        .api-key-input {
          width: 100%;
          background: #212121;
          border: 1px solid #404040;
          color: #ececec;
          padding: 0.75rem;
          border-radius: 8px;
          font-size: 0.95rem;
          font-family: monospace;
        }

        .modal-buttons {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .save-btn, .cancel-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 0.95rem;
          transition: background 0.2s;
        }

        .save-btn {
          background: #ececec;
          color: #212121;
        }

        .save-btn:hover {
          background: #fff;
        }

        .cancel-btn {
          background: #404040;
          color: #ececec;
        }

        .cancel-btn:hover {
          background: #4f4f4f;
        }
      `}</style>
    </div>
  );
}
