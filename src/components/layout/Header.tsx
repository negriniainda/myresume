import React, { useState, useEffect } from 'react';
import LanguageSelector from '@/components/ui/LanguageSelector';
import ScrollProgress from '@/components/ui/ScrollProgress';
import useScrollProgress from '@/hooks/useScrollProgress';
import { useTranslation } from '@/hooks/useTranslation';

interface HeaderProps {
  currentSection?: string;
  onSectionChange?: (section: string) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  currentSection = 'hero', 
  onSectionChange 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useTranslation();

  const sections = [
    { id: 'hero', label: t('navigation.home', 'Home') },
    { id: 'summary', label: t('navigation.summary', 'Summary') },
    { id: 'experience', label: t('navigation.experience', 'Experience') },
    { id: 'education', label: t('navigation.education', 'Education') },
    { id: 'skills', label: t('navigation.skills', 'Skills') },
    { id: 'projects', label: t('navigation.projects', 'Projects') }
  ];

  const sectionIds = sections.map(s => s.id);
  const { currentSection: detectedSection } = useScrollProgress({
    sections: sectionIds,
    offset: 100,
  });

  // Use detected section if no explicit currentSection is provided
  const activeSection = currentSection || detectedSection || 'hero';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      onSectionChange?.(sectionId);
    }
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
          : 'bg-transparent'
      }`}
    >
      {/* Progress Bar */}
      <ScrollProgress 
        sections={sectionIds}
        className="absolute bottom-0 left-0 right-0"
        height="2px"
        progressColor="linear-gradient(90deg, #3b82f6, #8b5cf6)"
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo/Brand - Mobile optimized */}
          <div className="flex-shrink-0 min-w-0">
            <button
              onClick={() => scrollToSection('hero')}
              className="text-lg sm:text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200 truncate"
            >
              Marcelo Negrini
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md whitespace-nowrap ${
                  activeSection === section.id
                    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                data-section={section.id}
              >
                {section.label}
              </button>
            ))}
          </nav>

          {/* Tablet Navigation - Compact */}
          <nav className="hidden md:flex lg:hidden items-center space-x-2">
            {sections.slice(0, 4).map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`px-2 py-1 text-xs font-medium transition-all duration-200 rounded ${
                  activeSection === section.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                data-section={section.id}
              >
                {section.label}
              </button>
            ))}
            <button
              onClick={toggleMenu}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </button>
          </nav>

          {/* Language Selector and Mobile Menu Button */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="scale-90 sm:scale-100">
              <LanguageSelector />
            </div>
            
            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200 touch-manipulation"
              aria-expanded={isMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <span className="sr-only">Open main menu</span>
              <div className="w-5 h-5 sm:w-6 sm:h-6 relative">
                <span
                  className={`absolute block h-0.5 w-full bg-current transform transition duration-300 ease-in-out ${
                    isMenuOpen ? 'rotate-45 translate-y-1.5' : '-translate-y-1'
                  }`}
                />
                <span
                  className={`absolute block h-0.5 w-full bg-current transform transition duration-300 ease-in-out ${
                    isMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`absolute block h-0.5 w-full bg-current transform transition duration-300 ease-in-out ${
                    isMenuOpen ? '-rotate-45 -translate-y-1.5' : 'translate-y-1'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:lg:hidden transition-all duration-300 ease-in-out ${
            isMenuOpen 
              ? 'max-h-96 opacity-100 visible' 
              : 'max-h-0 opacity-0 invisible overflow-hidden'
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-md rounded-lg mt-2 shadow-lg border border-gray-200">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`block w-full text-left px-4 py-3 text-base font-medium transition-all duration-200 rounded-md touch-manipulation ${
                  activeSection === section.id
                    ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50 active:bg-gray-100'
                }`}
                data-section={section.id}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
