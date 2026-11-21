import { useCallback, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  Bot,
  Send,
  User,
  FileText,
  AlertCircle,
  LoaderCircle,
  Upload,
  Trash2,
  Plus,
  MessageSquare,
  Pencil,
  Check,
  X,
  History,
} from 'lucide-react'
import api from '../services/api'
import './AIAssistant.css'

function AIAssistant({ user }) {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [conversations, setConversations] = useState([])
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [editingConversationId, setEditingConversationId] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')

  const [documents, setDocuments] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [documentError, setDocumentError] = useState('')
  const [documentMessage, setDocumentMessage] = useState('')

  const role = user?.role?.replace('ROLE_', '').toUpperCase()
  const canManageDocuments = ['HR', 'ADMIN'].includes(role)

  const loadConversations = useCallback(async () => {
    setHistoryLoading(true)

    try {
      const response = await api.get('/api/ai/conversations', {
        params: {
          page: 0,
          size: 100,
          sortBy: 'updatedAt',
          direction: 'desc',
        },
      })

      setConversations(response.data.content || [])
    } catch {
      setError('Unable to load conversation history.')
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  const loadDocuments = async () => {
    try {
      const response = await api.get('/api/ai/hr-policies')
      setDocuments(response.data)
      setDocumentError('')
    } catch (err) {
      setDocumentError(
        err.response?.data?.message || 'Unable to load policy documents.'
      )
    }
  }

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  useEffect(() => {
    if (canManageDocuments) {
      loadDocuments()
    }
  }, [canManageDocuments])

  const handleNewConversation = () => {
    if (loading) return

    setActiveConversationId(null)
    setMessages([])
    setQuestion('')
    setError('')
    setEditingConversationId(null)
  }

  const handleSelectConversation = async (conversationId) => {
    if (loading || historyLoading) return

    setError('')
    setHistoryLoading(true)

    try {
      const response = await api.get(
        `/api/ai/conversations/${conversationId}/messages`
      )

      setMessages(
        response.data.map((message) => ({
          id: message.id,
          role: String(message.role).toLowerCase(),
          content: message.content,
        }))
      )

      setActiveConversationId(conversationId)
      setQuestion('')
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to load this conversation.'
      )
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleRenameConversation = async (conversationId) => {
    const title = editingTitle.trim()

    if (!title) return

    try {
      await api.patch(
        `/api/ai/conversations/${conversationId}/title`,
        { title }
      )

      setEditingConversationId(null)
      setEditingTitle('')
      await loadConversations()
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to rename conversation.'
      )
    }
  }

  const handleDeleteConversation = async (conversationId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this conversation and its messages?'
    )

    if (!confirmed) return

    try {
      await api.delete(`/api/ai/conversations/${conversationId}`)

      setConversations((previous) =>
        previous.filter((item) => item.id !== conversationId)
      )

      if (activeConversationId === conversationId) {
        setActiveConversationId(null)
        setMessages([])
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to delete conversation.'
      )
    }
  }

  const handleUpload = async (event) => {
    event.preventDefault()

    if (!selectedFile || uploading) return

    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setDocumentError('Please select a PDF file.')
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile)

    setUploading(true)
    setDocumentError('')
    setDocumentMessage('')

    try {
      const response = await api.post(
        '/api/ai/hr-policies/upload',
        formData
      )

      setDocumentMessage(
        response.data.message || 'Policy uploaded successfully.'
      )
      setSelectedFile(null)
      event.target.reset()
      await loadDocuments()
    } catch (err) {
      setDocumentError(
        err.response?.data?.message || 'Unable to upload the policy document.'
      )
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteDocument = async (documentId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this policy document?'
    )

    if (!confirmed) return

    setDocumentError('')
    setDocumentMessage('')

    try {
      await api.delete(`/api/ai/hr-policies/${documentId}`)
      setDocumentMessage('Policy document deleted successfully.')
      await loadDocuments()
    } catch (err) {
      setDocumentError(
        err.response?.data?.message || 'Unable to delete the document.'
      )
    }
  }

  const handleAsk = async (event) => {
    event.preventDefault()

    const trimmedQuestion = question.trim()

    if (!trimmedQuestion || loading) return

    setError('')
    setQuestion('')
    setLoading(true)

    const temporaryMessageId = `temp-${Date.now()}`

    setMessages((previous) => [
      ...previous,
      {
        id: temporaryMessageId,
        role: 'user',
        content: trimmedQuestion,
      },
    ])

    try {
      const response = await api.post('/api/ai/hr-policies/ask', {
        question: trimmedQuestion,
        conversationId: activeConversationId,
      })

      const savedConversationId = response.data.conversationId

      if (savedConversationId) {
        setActiveConversationId(savedConversationId)
      }

      setMessages((previous) => [
        ...previous,
        {
          role: 'assistant',
          content: response.data.answer,
          sourceReferences: response.data.sourceReferences || [],
        },
      ])

      await loadConversations()
    } catch (err) {
      setMessages((previous) =>
        previous.filter((message) => message.id !== temporaryMessageId)
      )

      setError(
        err.response?.data?.message ||
        'Unable to get a response right now. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ai-assistant-page">
      <div className="ai-assistant-header">
        <div className="ai-assistant-heading">
          <div className="ai-assistant-icon">
            <Bot size={24} />
          </div>

          <div>
            <h1>AI HR Assistant</h1>
            <p>Ask questions about HR policies and workplace guidelines.</p>
          </div>
        </div>

        <span className="ai-assistant-status">
          <span className="ai-status-dot" />
          AI Assistant
        </span>
      </div>

      {canManageDocuments && (
        <section className="ai-policy-panel">
          <div className="ai-policy-heading">
            <div>
              <h2>HR Policy Documents</h2>
              <p>Upload PDF policies for the AI Assistant.</p>
            </div>
            <FileText size={23} />
          </div>

          <form className="ai-upload-form" onSubmit={handleUpload}>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(event) => {
                setSelectedFile(event.target.files?.[0] || null)
                setDocumentError('')
                setDocumentMessage('')
              }}
            />

            <button type="submit" disabled={!selectedFile || uploading}>
              {uploading ? (
                <LoaderCircle size={17} className="ai-spinner" />
              ) : (
                <Upload size={17} />
              )}
              {uploading ? 'Uploading...' : 'Upload PDF'}
            </button>
          </form>

          {documentError && (
            <p className="ai-document-error">
              <AlertCircle size={15} />
              {documentError}
            </p>
          )}

          {documentMessage && (
            <p className="ai-document-success">{documentMessage}</p>
          )}

          <div className="ai-document-list">
            <h3>Uploaded Documents</h3>

            {documents.length === 0 ? (
              <p className="ai-empty-documents">
                No policy documents uploaded yet.
              </p>
            ) : (
              documents.map((document) => (
                <div className="ai-document-item" key={document.documentId}>
                  <div className="ai-document-info">
                    <FileText size={19} />
                    <div>
                      <strong>{document.fileName}</strong>
                      <small>{document.totalChunks} sections</small>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="ai-delete-document"
                    onClick={() => handleDeleteDocument(document.documentId)}
                    aria-label={`Delete ${document.fileName}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      <div className="ai-workspace">
        <aside className="ai-history-panel">
          <div className="ai-history-heading">
            <div>
              <History size={18} />
              <h2>History</h2>
            </div>

            <button
              type="button"
              onClick={handleNewConversation}
              disabled={loading}
              title="New conversation"
            >
              <Plus size={17} />
              New
            </button>
          </div>

          <div className="ai-history-list">
            {historyLoading && conversations.length === 0 ? (
              <p className="ai-history-empty">Loading conversations...</p>
            ) : conversations.length === 0 ? (
              <p className="ai-history-empty">
                No conversations yet. Start a new chat.
              </p>
            ) : (
              conversations.map((conversation) => (
                <div
                  className={`ai-history-item ${
                    activeConversationId === conversation.id ? 'active' : ''
                  }`}
                  key={conversation.id}
                >
                  {editingConversationId === conversation.id ? (
                    <div className="ai-history-edit">
                      <input
                        value={editingTitle}
                        maxLength={200}
                        onChange={(event) =>
                          setEditingTitle(event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            handleRenameConversation(conversation.id)
                          }
                          if (event.key === 'Escape') {
                            setEditingConversationId(null)
                          }
                        }}
                        autoFocus
                      />

                      <button
                        type="button"
                        onClick={() =>
                          handleRenameConversation(conversation.id)
                        }
                        aria-label="Save title"
                      >
                        <Check size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingConversationId(null)}
                        aria-label="Cancel rename"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="ai-history-select"
                        onClick={() =>
                          handleSelectConversation(conversation.id)
                        }
                        disabled={loading || historyLoading}
                      >
                        <MessageSquare size={16} />
                        <span>{conversation.title}</span>
                      </button>

                      <div className="ai-history-actions">
                        <button
                          type="button"
                          title="Rename conversation"
                          aria-label="Rename conversation"
                          onClick={() => {
                            setEditingConversationId(conversation.id)
                            setEditingTitle(conversation.title)
                          }}
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          type="button"
                          title="Delete conversation"
                          aria-label="Delete conversation"
                          onClick={() =>
                            handleDeleteConversation(conversation.id)
                          }
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </aside>

        <section className="ai-chat-section">
          <div className="ai-chat-container">
            {messages.length === 0 ? (
              <div className="ai-welcome">
                <div className="ai-welcome-icon">
                  <Bot size={34} />
                </div>

                <h2>How can I help you?</h2>

                <p>
                  Ask me questions about company HR policies, leave rules,
                  attendance guidelines, and workplace procedures.
                </p>

                <div className="ai-suggestions">
                  {[
                    'What is the leave policy?',
                    'How does the attendance policy work?',
                    'What are the working hours?',
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setQuestion(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="ai-message-list">
                {messages.map((message, index) => (
                  <div
                    className={`ai-message ${
                      message.role === 'user'
                        ? 'user-message'
                        : 'assistant-message'
                    }`}
                    key={message.id || index}
                  >
                    <div className="ai-message-avatar">
                      {message.role === 'user' ? (
                        <User size={18} />
                      ) : (
                        <Bot size={18} />
                      )}
                    </div>

                    <div className="ai-message-content">
                      <span className="ai-message-role">
                        {message.role === 'user' ? 'You' : 'AI Assistant'}
                      </span>

                      {message.role === 'assistant' ? (
                        <div className="ai-markdown">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p>{message.content}</p>
                      )}

                      {message.sourceReferences?.length > 0 && (
                        <div className="ai-sources">
                          <strong>
                            <FileText size={15} />
                            Policy sources
                          </strong>

                          {message.sourceReferences.map((source, sourceIndex) => (
                            <div className="ai-source-item" key={sourceIndex}>
                              <FileText size={14} />
                              <span>{source.fileName}</span>
                              {source.chunkIndexes?.length > 0 && (
                                <small>
                                  Sections: {source.chunkIndexes.join(', ')}
                                </small>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {loading && (
              <div className="ai-loading">
                <LoaderCircle size={18} className="ai-spinner" />
                <span>Generating an answer...</span>
              </div>
            )}

            {error && (
              <div className="ai-error">
                <AlertCircle size={17} />
                <span>{error}</span>
              </div>
            )}
          </div>

          <form className="ai-chat-form" onSubmit={handleAsk}>
            <div className="ai-input-wrapper">
              <input
                type="text"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask a question about HR policies..."
                maxLength={2000}
                disabled={loading}
              />

              <button
                type="submit"
                disabled={!question.trim() || loading}
                aria-label="Send question"
              >
                <Send size={18} />
              </button>
            </div>

            <p className="ai-input-note">
              AI-generated answers may need verification against official HR policies.
            </p>
          </form>
        </section>
      </div>
    </div>
  )
}

export default AIAssistant