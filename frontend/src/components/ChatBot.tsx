import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Trash2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from './ChatMessage';
import { generateResponseWithGemini } from '@/lib/chatbot-charts';

export interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  chartData?: any; // Para almacenar datos de gráficas
}

interface ConversationHistory {
  role: 'user' | 'model';
  parts: { text: string }[];
}

const ChatBot: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: '¡Hola! 👋 Soy tu asistente inteligente de análisis de datos de salud mental. Puedo responderte con texto o generar visualizaciones cuando lo considere útil. Recuerdo toda nuestra conversación, así que puedes hacer preguntas de seguimiento. ¡Pregúntame lo que quieras!',
      timestamp: new Date(),
    }
  ]);
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Focus en el input cuando se abre el chat
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    const currentInput = inputValue;
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Procesar respuesta con Gemini (con memoria)
      const botResponse = await processBotResponse(currentInput);
      setMessages(prev => [...prev, botResponse]);
      
      // Actualizar historial conversacional
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', parts: [{ text: currentInput }] },
        { 
          role: 'model', 
          parts: [{ 
            text: botResponse.chartData 
              ? `[Gráfica generada: ${botResponse.chartData.title}]` 
              : botResponse.content 
          }] 
        }
      ]);
      
    } catch (error) {
      console.error('Error en handleSendMessage:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: '❌ Hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const processBotResponse = async (userInput: string): Promise<Message> => {
    try {
      console.log('🤖 Llamando a Gemini con historial de', conversationHistory.length, 'mensajes');
      
      // Gemini decide si generar gráfica o texto (CON MEMORIA)
      const response = await generateResponseWithGemini(userInput, conversationHistory);
      
      if (response.type === 'chart') {
        console.log('📊 Gemini generó una gráfica');
        return {
          id: Date.now().toString(),
          type: 'bot',
          content: '📊 He generado esta visualización para ti:',
          timestamp: new Date(),
          chartData: response.content,
        };
      } else {
        console.log('💬 Gemini respondió con texto');
        return {
          id: Date.now().toString(),
          type: 'bot',
          content: response.content as string,
          timestamp: new Date(),
        };
      }
    } catch (error) {
      console.error('❌ Error procesando respuesta:', error);
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: '❌ Hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
        timestamp: new Date(),
      };
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearConversation = () => {
    setMessages([
      {
        id: '1',
        type: 'bot',
        content: '¡Hola! 👋 Soy tu asistente inteligente de análisis de datos de salud mental. Puedo responderte con texto o generar visualizaciones cuando lo considere útil. Recuerdo toda nuestra conversación, así que puedes hacer preguntas de seguimiento. ¡Pregúntame lo que quieras!',
        timestamp: new Date(),
      }
    ]);
    setConversationHistory([]);
    console.log('🗑️ Conversación y memoria limpiadas');
  };

  // Ocultar el chatbot en la página de login
  if (location.pathname === '/login') {
    return null;
  }

  return (
    <>
      {/* Botón flotante */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 group"
          >
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </Button>
        )}
      </div>

      {/* Ventana del chat */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] shadow-2xl flex flex-col overflow-hidden border-2 animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Asistente IA</h3>
                <p className="text-xs text-white/80">
                  {conversationHistory.length > 0 
                    ? `${Math.floor(conversationHistory.length / 2)} interacciones en memoria` 
                    : 'Análisis de Salud Mental'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearConversation}
                className="hover:bg-white/20 text-white"
                title="Limpiar conversación"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Mensajes */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isTyping && (
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-muted p-3 rounded-lg rounded-tl-none">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t bg-background">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Pregúntame sobre los datos..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                size="icon"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default ChatBot;
