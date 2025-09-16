'use client';

import React from 'react';
import useLanguage from '@/hooks/useLanguage';

interface StructuredDataProps {
  type?: 'person' | 'website' | 'breadcrumb';
  data?: any;
}

const StructuredData: React.FC<StructuredDataProps> = ({ type = 'person', data }) => {
  const { language } = useLanguage();

  const getPersonStructuredData = () => ({
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Marcelo Negrini",
    "jobTitle": language === 'pt' ? "Especialista em Liderança de IA e Tecnologia" : "AI & Technology Leadership Expert",
    "description": language === 'pt' 
      ? "Especialista em liderança de IA e tecnologia com experiência em transformação digital, liderança de equipes e inovação estratégica."
      : "AI & Technology Leadership Expert with experience in digital transformation, team leadership, and strategic innovation.",
    "url": "https://marcelonegrini.com",
    "sameAs": [
      "https://linkedin.com/in/marcelonegrini",
      "https://github.com/marcelonegrini",
      "https://twitter.com/marcelonegrini"
    ],
    "knowsAbout": [
      "Artificial Intelligence",
      "Technology Leadership",
      "Digital Transformation",
      "Team Management",
      "Strategic Innovation",
      "Software Development",
      "Product Management",
      "Agile Methodologies"
    ],
    "alumniOf": [
      {
        "@type": "EducationalOrganization",
        "name": "Universidade Federal do Rio Grande do Sul",
        "alternateName": "UFRGS"
      }
    ],
    "hasOccupation": {
      "@type": "Occupation",
      "name": language === 'pt' ? "Líder de Tecnologia" : "Technology Leader",
      "occupationLocation": {
        "@type": "Place",
        "name": "Brazil"
      },
      "skills": [
        "AI/ML Leadership",
        "Digital Transformation",
        "Team Leadership",
        "Strategic Planning",
        "Product Development",
        "Technology Architecture"
      ]
    },
    "workLocation": {
      "@type": "Place",
      "name": "Remote/Brazil"
    }
  });

  const getWebsiteStructuredData = () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Marcelo Negrini - Professional Resume",
    "alternateName": language === 'pt' ? "Marcelo Negrini - Currículo Profissional" : "Marcelo Negrini - Professional Resume",
    "url": "https://marcelonegrini.com",
    "description": language === 'pt'
      ? "Currículo interativo bilíngue apresentando experiência profissional em liderança de IA, transformação digital e inovação estratégica."
      : "Interactive bilingual resume showcasing professional experience in AI leadership, digital transformation, and strategic innovation.",
    "inLanguage": [
      {
        "@type": "Language",
        "name": "English",
        "alternateName": "en"
      },
      {
        "@type": "Language", 
        "name": "Portuguese",
        "alternateName": "pt"
      }
    ],
    "author": {
      "@type": "Person",
      "name": "Marcelo Negrini"
    },
    "publisher": {
      "@type": "Person",
      "name": "Marcelo Negrini"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://marcelonegrini.com/?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  });

  const getBreadcrumbStructuredData = () => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://marcelonegrini.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": language === 'pt' ? "Resumo" : "Summary",
        "item": "https://marcelonegrini.com#summary"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": language === 'pt' ? "Experiência" : "Experience",
        "item": "https://marcelonegrini.com#experience"
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": language === 'pt' ? "Habilidades" : "Skills",
        "item": "https://marcelonegrini.com#skills"
      },
      {
        "@type": "ListItem",
        "position": 5,
        "name": language === 'pt' ? "Projetos" : "Projects",
        "item": "https://marcelonegrini.com#projects"
      }
    ]
  });

  const getStructuredData = () => {
    switch (type) {
      case 'person':
        return getPersonStructuredData();
      case 'website':
        return getWebsiteStructuredData();
      case 'breadcrumb':
        return getBreadcrumbStructuredData();
      default:
        return data || getPersonStructuredData();
    }
  };

  const structuredData = getStructuredData();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
};

export default StructuredData;