import { useState } from 'react';

const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<unknown[]>([]);

  const search = (term: string) => {
    setSearchTerm(term);
    // Placeholder implementation
    setResults([]);
  };

  return { searchTerm, results, search };
};

export default useSearch;
