import { useState, useCallback, useMemo } from 'react';
import { ResumeData, Project, SearchResult, SearchMatch } from '../types';

export interface GlobalSearchResult {
  type: 'experience' | 'education' | 'skills' | 'projects' | 'summary' | 'activities';
  id: string;
  title: string;
  content: string;
  matches: SearchMatch[];
  score: number;
  section?: string;
}

export interface SearchSuggestion {
  text: string;
  type: 'skill' | 'company' | 'technology' | 'industry' | 'position';
  count: number;
}

const useSearch = (resumeData?: ResumeData, projectsData?: Project[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);

  // Create searchable content index
  const searchIndex = useMemo(() => {
    if (!resumeData && !projectsData) return [];

    const index: Array<{
      id: string;
      type: GlobalSearchResult['type'];
      title: string;
      content: string;
      keywords: string[];
      section?: string;
    }> = [];

    // Index resume data
    if (resumeData) {
      // Index summary
      index.push({
        id: 'summary',
        type: 'summary',
        title: resumeData.summary.title,
        content: resumeData.summary.items.join(' '),
        keywords: resumeData.summary.items.flatMap(item => item.toLowerCase().split(/\s+/)),
        section: 'Summary'
      });

      // Index experience
      resumeData.experience.forEach(exp => {
        const content = [
          exp.position,
          exp.company,
          exp.description,
          ...exp.achievements.map(a => `${a.metric} ${a.description} ${a.impact || ''}`),
          ...exp.technologies,
          ...(exp.responsibilities || [])
        ].join(' ');

        index.push({
          id: exp.id,
          type: 'experience',
          title: `${exp.position} at ${exp.company}`,
          content,
          keywords: [
            ...exp.technologies.map(t => t.toLowerCase()),
            exp.company.toLowerCase(),
            exp.position.toLowerCase(),
            ...(exp.industry ? [exp.industry.toLowerCase()] : []),
            ...(exp.roleType ? [exp.roleType.toLowerCase()] : [])
          ],
          section: 'Experience'
        });
      });

      // Index education
      resumeData.education.forEach(edu => {
        const content = [
          edu.degree,
          edu.institution,
          edu.description || '',
          ...(edu.honors || []),
          ...(edu.certifications || [])
        ].join(' ');

        index.push({
          id: edu.id,
          type: 'education',
          title: `${edu.degree} - ${edu.institution}`,
          content,
          keywords: [
            edu.degree.toLowerCase(),
            edu.institution.toLowerCase(),
            ...(edu.honors || []).map(h => h.toLowerCase()),
            ...(edu.certifications || []).map(c => c.toLowerCase())
          ],
          section: 'Education'
        });
      });

      // Index skills
      resumeData.skills.forEach(category => {
        category.skills.forEach(skill => {
          index.push({
            id: `skill-${skill.name}`,
            type: 'skills',
            title: skill.name,
            content: `${skill.name} ${skill.level} ${category.name}`,
            keywords: [
              skill.name.toLowerCase(),
              skill.level.toLowerCase(),
              category.name.toLowerCase()
            ],
            section: 'Skills'
          });
        });
      });

      // Index activities
      resumeData.activities.forEach((activity, idx) => {
        index.push({
          id: `activity-${idx}`,
          type: 'activities',
          title: activity.substring(0, 50) + (activity.length > 50 ? '...' : ''),
          content: activity,
          keywords: activity.toLowerCase().split(/\s+/),
          section: 'Activities'
        });
      });
    }

    // Index projects data
    if (projectsData) {
      projectsData.forEach(project => {
        const content = [
          project.title,
          project.problem,
          project.action,
          project.result,
          project.industry,
          project.clientType,
          project.projectType,
          ...(project.technologies || [])
        ].join(' ');

        index.push({
          id: project.id,
          type: 'projects',
          title: project.title,
          content,
          keywords: [
            ...(project.technologies || []).map(t => t.toLowerCase()),
            project.industry.toLowerCase(),
            project.clientType.toLowerCase(),
            project.projectType.toLowerCase()
          ],
          section: 'Projects'
        });
      });
    }

    return index;
  }, [resumeData, projectsData]);

  // Generate search suggestions
  const generateSuggestions = useCallback((term: string): SearchSuggestion[] => {
    if (!term || term.length < 2) return [];

    const suggestions: Map<string, SearchSuggestion> = new Map();
    const termLower = term.toLowerCase();

    searchIndex.forEach(item => {
      // Check keywords for matches
      item.keywords.forEach(keyword => {
        if (keyword.includes(termLower) && keyword !== termLower) {
          const existing = suggestions.get(keyword);
          if (existing) {
            existing.count++;
          } else {
            // Determine suggestion type based on context
            let type: SearchSuggestion['type'] = 'skill';
            if (item.type === 'experience') {
              if (keyword === item.title.split(' at ')[1]?.toLowerCase()) {
                type = 'company';
              } else if (keyword === item.title.split(' at ')[0]?.toLowerCase()) {
                type = 'position';
              }
            } else if (item.type === 'projects') {
              type = 'industry';
            }

            suggestions.set(keyword, {
              text: keyword,
              type,
              count: 1
            });
          }
        }
      });
    });

    return Array.from(suggestions.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [searchIndex]);

  // Perform search with highlighting
  const performSearch = useCallback((term: string): GlobalSearchResult[] => {
    if (!term || term.trim().length === 0) return [];

    const termLower = term.toLowerCase();
    const searchResults: GlobalSearchResult[] = [];

    searchIndex.forEach(item => {
      const matches: SearchMatch[] = [];
      let score = 0;

      // Search in title (higher weight)
      const titleMatches = findMatches(item.title, termLower);
      if (titleMatches.length > 0) {
        matches.push({
          field: 'title',
          value: item.title,
          indices: titleMatches
        });
        score += titleMatches.length * 3;
      }

      // Search in content
      const contentMatches = findMatches(item.content, termLower);
      if (contentMatches.length > 0) {
        matches.push({
          field: 'content',
          value: item.content,
          indices: contentMatches
        });
        score += contentMatches.length;
      }

      // Search in keywords (medium weight)
      const keywordMatches = item.keywords.filter(keyword => 
        keyword.includes(termLower)
      );
      if (keywordMatches.length > 0) {
        score += keywordMatches.length * 2;
      }

      if (matches.length > 0 || keywordMatches.length > 0) {
        searchResults.push({
          type: item.type,
          id: item.id,
          title: item.title,
          content: truncateContent(item.content, 200),
          matches,
          score,
          section: item.section
        });
      }
    });

    // Sort by score (relevance)
    return searchResults.sort((a, b) => b.score - a.score);
  }, [searchIndex]);

  // Find match indices for highlighting
  const findMatches = (text: string, searchTerm: string): [number, number][] => {
    const matches: [number, number][] = [];
    const textLower = text.toLowerCase();
    let startIndex = 0;

    while (true) {
      const index = textLower.indexOf(searchTerm, startIndex);
      if (index === -1) break;
      
      matches.push([index, index + searchTerm.length]);
      startIndex = index + 1;
    }

    return matches;
  };

  // Truncate content for display
  const truncateContent = (content: string, maxLength: number): string => {
    if (content.length <= maxLength) return content;
    
    const truncated = content.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return lastSpace > 0 
      ? truncated.substring(0, lastSpace) + '...'
      : truncated + '...';
  };

  // Main search function
  const search = useCallback((term: string) => {
    setSearchTerm(term);
    setIsSearching(true);

    // Debounce search for performance
    const timeoutId = setTimeout(() => {
      const searchResults = performSearch(term);
      const searchSuggestions = generateSuggestions(term);
      
      setResults(searchResults);
      setSuggestions(searchSuggestions);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [performSearch, generateSuggestions]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setResults([]);
    setSuggestions([]);
    setIsSearching(false);
  }, []);

  // Highlight text helper
  const highlightText = useCallback((text: string, matches: SearchMatch[]): string => {
    if (!matches.length) return text;

    const contentMatch = matches.find(m => m.field === 'content' || m.field === 'title');
    if (!contentMatch) return text;

    let highlightedText = text;
    const sortedIndices = contentMatch.indices.sort((a, b) => b[0] - a[0]);

    sortedIndices.forEach(([start, end]) => {
      const before = highlightedText.substring(0, start);
      const match = highlightedText.substring(start, end);
      const after = highlightedText.substring(end);
      
      highlightedText = `${before}<mark class="bg-yellow-200 px-1 rounded">${match}</mark>${after}`;
    });

    return highlightedText;
  }, []);

  return {
    searchTerm,
    results,
    suggestions,
    isSearching,
    search,
    clearSearch,
    highlightText,
    hasResults: results.length > 0,
    resultCount: results.length
  };
};

export default useSearch;
