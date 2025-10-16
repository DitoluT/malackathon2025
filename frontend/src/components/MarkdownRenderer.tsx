import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const renderMarkdown = (text: string) => {
    // Split by lines
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let listItems: JSX.Element[] = [];
    let inList = false;
    let listType: 'ul' | 'ol' | null = null;

    lines.forEach((line, index) => {
      line = line.trim();

      // Headers
      if (line.startsWith('### ')) {
        if (inList) {
          elements.push(<ul key={`list-${index}`} className="list-disc list-inside space-y-1 mb-4">{listItems}</ul>);
          listItems = [];
          inList = false;
        }
        elements.push(<h3 key={index} className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2">{processInlineMarkdown(line.slice(4))}</h3>);
      } else if (line.startsWith('## ')) {
        if (inList) {
          elements.push(<ul key={`list-${index}`} className="list-disc list-inside space-y-1 mb-4">{listItems}</ul>);
          listItems = [];
          inList = false;
        }
        elements.push(<h2 key={index} className="text-xl font-bold text-purple-700 dark:text-purple-400 mt-5 mb-3 flex items-center gap-2">{processInlineMarkdown(line.slice(3))}</h2>);
      } else if (line.startsWith('# ')) {
        if (inList) {
          elements.push(<ul key={`list-${index}`} className="list-disc list-inside space-y-1 mb-4">{listItems}</ul>);
          listItems = [];
          inList = false;
        }
        elements.push(<h1 key={index} className="text-2xl font-bold text-purple-800 dark:text-purple-300 mt-6 mb-4">{processInlineMarkdown(line.slice(2))}</h1>);
      }
      // Ordered list
      else if (/^\d+\.\s/.test(line)) {
        if (!inList || listType !== 'ol') {
          if (inList && listType === 'ul') {
            elements.push(<ul key={`list-${index}`} className="list-disc list-inside space-y-1 mb-4">{listItems}</ul>);
            listItems = [];
          }
          inList = true;
          listType = 'ol';
        }
        listItems.push(<li key={index} className="text-gray-800 dark:text-gray-200 ml-4">{processInlineMarkdown(line.replace(/^\d+\.\s/, ''))}</li>);
      }
      // Unordered list
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        if (!inList || listType !== 'ul') {
          if (inList && listType === 'ol') {
            elements.push(<ol key={`list-${index}`} className="list-decimal list-inside space-y-1 mb-4 ml-4">{listItems}</ol>);
            listItems = [];
          }
          inList = true;
          listType = 'ul';
        }
        listItems.push(<li key={index} className="text-gray-800 dark:text-gray-200 ml-4">{processInlineMarkdown(line.slice(2))}</li>);
      }
      // Bold paragraph
      else if (line.startsWith('**') && line.endsWith('**')) {
        if (inList) {
          if (listType === 'ol') {
            elements.push(<ol key={`list-${index}`} className="list-decimal list-inside space-y-1 mb-4 ml-4">{listItems}</ol>);
          } else {
            elements.push(<ul key={`list-${index}`} className="list-disc list-inside space-y-1 mb-4">{listItems}</ul>);
          }
          listItems = [];
          inList = false;
        }
        elements.push(<p key={index} className="font-bold text-gray-900 dark:text-gray-100 mt-3 mb-2">{processInlineMarkdown(line)}</p>);
      }
      // Regular paragraph
      else if (line.length > 0) {
        if (inList) {
          if (listType === 'ol') {
            elements.push(<ol key={`list-${index}`} className="list-decimal list-inside space-y-1 mb-4 ml-4">{listItems}</ol>);
          } else {
            elements.push(<ul key={`list-${index}`} className="list-disc list-inside space-y-1 mb-4">{listItems}</ul>);
          }
          listItems = [];
          inList = false;
        }
        elements.push(<p key={index} className="text-gray-800 dark:text-gray-200 mb-2 leading-relaxed">{processInlineMarkdown(line)}</p>);
      }
    });

    // Close any remaining list
    if (inList) {
      if (listType === 'ol') {
        elements.push(<ol key="final-list" className="list-decimal list-inside space-y-1 mb-4 ml-4">{listItems}</ol>);
      } else {
        elements.push(<ul key="final-list" className="list-disc list-inside space-y-1 mb-4">{listItems}</ul>);
      }
    }

    return elements;
  };

  const processInlineMarkdown = (text: string): React.ReactNode => {
    // Process bold
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      parts.push(<strong key={match.index} className="font-bold text-purple-700 dark:text-purple-400">{match[1]}</strong>);
      lastIndex = boldRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className={`markdown-content space-y-1 ${className}`}>
      {renderMarkdown(content)}
    </div>
  );
};

export default MarkdownRenderer;
