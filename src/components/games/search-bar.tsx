'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = "Buscar jogos..." }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-2xl mx-auto mb-10">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      <Input
        type="text"
        placeholder={placeholder}
        className="pl-10 h-12 text-lg rounded-full border-gray-200 dark:border-gray-800 focus:ring-primary focus:border-primary shadow-sm"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
}
