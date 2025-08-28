import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { ScrollArea } from './ui/scroll-area'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Send, MessageSquare, Search } from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface MessagingPanelProps {
  userId: string
  userType: 'buyer' | 'service_provider'
}

export function MessagingPanel({ userId, userType }: MessagingPanelProps) {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation)
    }
  }, [selectedConversation])

  const loadConversations = async () => {
    try {
      // For now, we'll create mock conversations
      // In a real app, you'd fetch actual conversation data
      const mockConversations = [
        {
          id: 'conv_1',
          participantName: userType === 'buyer' ? 'John Photography' : 'Sarah Wedding',
          participantType: userType === 'buyer' ? 'provider' : 'buyer',
          lastMessage: 'Thank you for your inquiry about our wedding photography package.',
          timestamp: new Date().toISOString(),
          unread: true
        },
        {
          id: 'conv_2',
          participantName: userType === 'buyer' ? 'Elite Catering' : 'Mike Anniversary',
          participantType: userType === 'buyer' ? 'provider' : 'buyer',
          lastMessage: 'I can provide catering for 150 guests within your budget.',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          unread: false
        }
      ]
      
      setConversations(mockConversations)
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6f7307d7/messages/${conversationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      } else {
        // For demo purposes, use mock messages
        const mockMessages = [
          {
            id: 'msg_1',
            sender_id: userType === 'buyer' ? 'provider_1' : 'buyer_1',
            message: 'Hello! I saw your inquiry about wedding photography. I would be happy to help with your special day.',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            is_read: true
          },
          {
            id: 'msg_2',
            sender_id: userId,
            message: 'That\'s great! Could you please share your package details and pricing?',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            is_read: true
          },
          {
            id: 'msg_3',
            sender_id: userType === 'buyer' ? 'provider_1' : 'buyer_1',
            message: 'Of course! Our basic wedding package includes 8 hours of coverage, edited photos, and an online gallery. The price is LKR 150,000.',
            timestamp: new Date(Date.now() - 900000).toISOString(),
            is_read: false
          }
        ]
        setMessages(mockMessages)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const token = localStorage.getItem('access_token')
      if (!token) return

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6f7307d7/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            recipient_id: 'other_user_id', // This would be determined from the conversation
            message: newMessage,
            conversation_id: selectedConversation
          })
        }
      )

      if (response.ok) {
        const data = await response.json()
        setMessages([...messages, data.message])
        setNewMessage('')
      } else {
        // For demo purposes, add message locally
        const newMsg = {
          id: `msg_${Date.now()}`,
          sender_id: userId,
          message: newMessage,
          timestamp: new Date().toISOString(),
          is_read: false
        }
        setMessages([...messages, newMsg])
        setNewMessage('')
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-lg mb-4">Loading messages...</h3>
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6 h-96">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-80">
            {conversations.length === 0 ? (
              <div className="p-4 text-center">
                <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No conversations yet</p>
              </div>
            ) : (
              conversations.map((conv: any) => (
                <div
                  key={conv.id}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedConversation === conv.id ? 'bg-rose-50 border-rose-200' : ''
                  }`}
                  onClick={() => setSelectedConversation(conv.id)}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar>
                      <AvatarFallback>{conv.participantName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conv.participantName}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {conv.participantType}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {conv.lastMessage}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                          {new Date(conv.timestamp).toLocaleDateString()}
                        </p>
                        {conv.unread && (
                          <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="lg:col-span-2">
        {selectedConversation ? (
          <>
            <CardHeader>
              <CardTitle>
                {conversations.find(c => c.id === selectedConversation)?.participantName}
              </CardTitle>
              <CardDescription>
                Remember: Keep conversations professional and avoid sharing personal contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-64 p-4">
                <div className="space-y-4">
                  {messages.map((message: any) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === userId ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender_id === userId
                            ? 'bg-rose-500 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_id === userId ? 'text-rose-100' : 'text-gray-500'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <form onSubmit={sendMessage} className="border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: Keep it professional and avoid sharing personal contact details
                </p>
              </form>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg text-gray-900 mb-2">Select a Conversation</h3>
              <p className="text-gray-600">Choose a conversation to start messaging</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}