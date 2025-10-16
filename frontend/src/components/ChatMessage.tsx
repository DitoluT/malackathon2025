import React, { useState, useEffect } from 'react';
import { MessageCircle, User } from 'lucide-react';
import { Message } from './ChatBot';
import InteractiveChart from './InteractiveChart';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean; // Para saber si es el último mensaje en streaming
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isStreaming = false }) => {
  const isBot = message.type === 'bot';
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(!isBot); // Los mensajes de usuario se muestran completos

  // Efecto typing solo para mensajes del bot
  useEffect(() => {
    if (!isBot || !isStreaming) {
      setDisplayedText(message.content);
      setIsTypingComplete(true);
      return;
    }

    let currentIndex = 0;
    const text = message.content;
    const typingSpeed = 15; // ms por carácter (ajustable)

    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTypingComplete(true);
        clearInterval(interval);
      }
    }, typingSpeed);

    return () => clearInterval(interval);
  }, [message.content, isBot, isStreaming]);

  // Función para renderizar tabla
  const renderTable = (tableData: any) => {
    if (!tableData || !tableData.data || tableData.data.length === 0) {
      return <p className="text-sm text-muted-foreground">No hay datos para mostrar</p>;
    }

    const columns = tableData.columns || Object.keys(tableData.data[0]);
    const maxRows = 50; // Limitar filas para rendimiento
    const dataToShow = tableData.data.slice(0, maxRows);
    const hasMore = tableData.data.length > maxRows;

    return (
      <div className="w-full overflow-auto max-h-96 rounded-lg border">
        <Table>
          <TableCaption>
            {tableData.title}
            {hasMore && (
              <span className="text-xs text-muted-foreground ml-2">
                (Mostrando {maxRows} de {tableData.data.length} filas)
              </span>
            )}
          </TableCaption>
          <TableHeader>
            <TableRow>
              {columns.map((col: string, idx: number) => (
                <TableHead key={idx} className="font-semibold">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataToShow.map((row: any, rowIdx: number) => (
              <TableRow key={rowIdx}>
                {columns.map((col: string, colIdx: number) => (
                  <TableCell key={colIdx}>
                    {row[col] !== null && row[col] !== undefined 
                      ? String(row[col]) 
                      : '-'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className={`flex items-start gap-2 ${isBot ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isBot
            ? 'bg-gradient-to-r from-blue-500 to-purple-500'
            : 'bg-gradient-to-r from-green-500 to-teal-500'
        }`}
      >
        {isBot ? (
          <MessageCircle className="w-4 h-4 text-white" />
        ) : (
          <User className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Contenido del mensaje */}
      <div className={`flex-1 max-w-[80%] ${isBot ? '' : 'flex flex-col items-end'}`}>
        <div
          className={`p-3 rounded-lg ${
            isBot
              ? 'bg-muted rounded-tl-none'
              : 'bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-tr-none'
          }`}
        >
          {isBot ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  // Estilos personalizados para elementos Markdown
                  h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-1" {...props} />,
                  p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                  code: ({node, inline, ...props}: any) => 
                    inline ? (
                      <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono" {...props} />
                    ) : (
                      <code className="block bg-muted p-2 rounded text-xs font-mono overflow-x-auto" {...props} />
                    ),
                  strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                  em: ({node, ...props}) => <em className="italic" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary pl-3 italic" {...props} />,
                }}
              >
                {displayedText}
              </ReactMarkdown>
              {!isTypingComplete && <span className="inline-block w-1 h-4 bg-primary animate-pulse ml-1">|</span>}
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>

        {/* Gráfica si existe (solo mostrar cuando typing esté completo) */}
        {message.chartData && message.chartData.type !== 'table' && isTypingComplete && (
          <div className="mt-3 w-full">
            <InteractiveChart data={message.chartData} />
          </div>
        )}

        {/* Tabla si existe (solo mostrar cuando typing esté completo) */}
        {message.chartData && message.chartData.type === 'table' && isTypingComplete && (
          <div className="mt-3 w-full">
            {renderTable(message.chartData)}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground mt-1 px-1">
          {message.timestamp.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
