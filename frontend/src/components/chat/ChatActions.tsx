'use client';

import * as React from 'react';
import { orusGreenWhiteTheme } from '../../lib/theme-orus';

interface ChatActionsProps {
  messageId: string;
  content: string;
  onCopy?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
}

export const ChatActions: React.FC<ChatActionsProps> = ({
  messageId,
  content,
  onCopy,
  onDelete,
  onShare,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    onCopy?.();
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-1 rounded hover:bg-gray-200"
        style={{
          color:
            typeof orusGreenWhiteTheme.secondary === 'string'
              ? orusGreenWhiteTheme.secondary
              : (orusGreenWhiteTheme.secondary as any)[500],
        }}
      >
        ⋮
      </button>

      {showMenu && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-10"
          style={{
            backgroundColor:
              typeof orusGreenWhiteTheme.secondary === 'string'
                ? orusGreenWhiteTheme.secondary
                : (orusGreenWhiteTheme.secondary as any)[500],
            borderColor:
              typeof orusGreenWhiteTheme.secondary === 'string'
                ? orusGreenWhiteTheme.secondary
                : (orusGreenWhiteTheme.secondary as any)[500],
          }}
        >
          <button
            onClick={handleCopy}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm"
          >
            📋 Copiar
          </button>
          {onShare && (
            <button
              onClick={onShare}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm"
            >
              🔗 Compartilhar
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm text-red-600"
            >
              🗑️ Deletar
            </button>
          )}
        </div>
      )}
    </div>
  );
};
function useState(arg0: boolean): [any, any] {
    throw new Error('Function not implemented.');
}

