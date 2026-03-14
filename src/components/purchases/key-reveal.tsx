'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Copy, CheckCircle2, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface KeyRevealProps {
  orderId: string;
  gameTitle: string;
}

export function KeyReveal({ orderId, gameTitle }: KeyRevealProps) {
  const [revealed, setRevealed] = useState(false);
  const [keyCode, setKeyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleReveal = async () => {
    if (revealed) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/keys/reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      setKeyCode(result.keyCode);
      setRevealed(true);
      toast.success('Chave revelada com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao revelar chave: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(keyCode);
    setCopied(true);
    toast.success('Chave copiada!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3">
      {revealed ? (
        <div className="flex items-center gap-2">
          <code className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-md font-mono text-lg font-bold border border-gray-200 dark:border-gray-700 select-all flex-grow">
            {keyCode}
          </code>
          <Button variant="outline" size="icon" onClick={copyToClipboard}>
            {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      ) : (
        <Button 
          onClick={handleReveal} 
          disabled={loading}
          variant="secondary"
          className="w-full gap-2 h-12 font-bold"
        >
          {loading ? 'Revelando...' : (
            <>
              <Eye className="h-5 w-5" /> Revelar Chave
            </>
          )}
        </Button>
      )}
      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
        <Lock className="h-3 w-3" /> A revelação desta chave será registrada no seu histórico de segurança.
      </p>
    </div>
  );
}
