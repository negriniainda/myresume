import React from 'react';
import useLanguage from '@/hooks/useLanguage';

const Footer: React.FC = () => {
  const { language } = useLanguage();

  const content = {
    en: {
      copyright: '© 2024 Marcelo Negrini. All rights reserved.',
      builtWith: 'Built with',
      and: 'and',
      contact: 'Get in touch',
      email: 'Email',
      linkedin: 'LinkedIn',
      github: 'GitHub',
      location: 'São Paulo, Brazil'
    },
    pt: {
      copyright: '© 2024 Marcelo Negrini. Todos os direitos reservados.',
      builtWith: 'Desenvolvido com',
      and: 'e',
      contact: 'Entre em contato',
      email: 'Email',
      linkedin: 'LinkedIn',
      github: 'GitHub',
      location: 'São Paulo, Brasil'
    }
  };

  const t = content[language];

  const socialLinks = [
    {
      name: t.email,
      href: 'mailto:marcelo.negrini@example.com',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
        </svg>
      )
    },
    {
      name: t.linkedin,
      href: 'https://linkedin.com/in/marcelonegrini',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: t.github,
      href: 'https://github.com/marcelonegrini',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
        </svg>
      )
    }
  ];

  const techStack = [
    { name: 'Next.js', href: 'https://nextjs.org' },
    { name: 'React', href: 'https://reactjs.org' },
    { name: 'TypeScript', href: 'https://typescriptlang.org' },
    { name: 'Tailwind CSS', href: 'https://tailwindcss.com' }
  ];

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t.contact}
            </h3>
            <div className="space-y-2">
              <p className="text-gray-600 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {t.location}
              </p>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                  aria-label={link.name}
                  title={link.name}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Navigation
            </h3>
            <nav className="space-y-2">
              {[
                { id: 'summary', label: language === 'en' ? 'Summary' : 'Resumo' },
                { id: 'experience', label: language === 'en' ? 'Experience' : 'Experiência' },
                { id: 'skills', label: language === 'en' ? 'Skills' : 'Habilidades' },
                { id: 'projects', label: language === 'en' ? 'Projects' : 'Projetos' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    const element = document.getElementById(item.id);
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="block text-gray-600 hover:text-blue-600 transition-colors duration-200 text-left"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tech Stack */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t.builtWith}
            </h3>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech, index) => (
                <span key={tech.name} className="inline-flex items-center">
                  <a
                    href={tech.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                  >
                    {tech.name}
                  </a>
                  {index < techStack.length - 1 && (
                    <span className="text-gray-400 mx-1">•</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-gray-500 text-sm">
              {t.copyright}
            </p>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{t.builtWith}</span>
              <span className="text-red-500">❤️</span>
              <span>{t.and}</span>
              <span className="text-blue-600 font-medium">Next.js</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
