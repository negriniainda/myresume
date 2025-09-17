'use client';

import { useMemo } from 'react';
// import { useLanguage } from '@/contexts/LanguageContext';
import { useDataManager } from '@/hooks/useDataManager';
import type { ResumeData, Project } from '@/types';

/**
 * Custom hook for managing bilingual content access
 * Provides seamless switching between English and Portuguese content
 */
export function useContent() {
  const language = 'en'; // Temporary fallback
  // Real resume data based on Resume.md
  const resumeData = {
    personalInfo: {
      name: "Marcelo Negrini",
      title: "CTO / CPO / CAIO for Digital Transformation & Enterprise AI",
      location: "São Paulo, Brazil",
      email: "mnegrini@hotmail.com",
      phone: "+55 (11) 9-9636-5230",
      linkedin: "http://www.linkedin.com/in/marcelonegrini"
    },
    summary: {
      title: "Professional Summary",
      objective: "CTO / CPO / CAIO for companies undergoing digital transformation, specializing in the implementation of enterprise-grade AI with measurable ROI.",
      items: [
        "I lead the Artificial Intelligence revolution in the C-Suite, transforming organizations through AI strategies that generate measurable business impact.",
        "Architected AI systems that processed $2B+ in financial transactions",
        "Reduced operational costs by 35% for an American fintech through multimodal AI",
        "Increased student retention by 42% with adaptive AI educational platforms",
        "Led digital transformation of educational group (15k+ students, 14 campuses)",
        "Expert in RAG solution architecture, LLMs, agents, and multimodal systems, integrating conversational AI with vector databases in critical environments",
        "20+ years building and leading global teams of 150+ specialists in technology, product, and AI",
        "Pioneer in implementing AI compliance frameworks (LGPD/BACEN), ensuring 100% regulatory conformity",
        "International experience (USA, Europe, Asia) leading projects for Fortune 500 (Microsoft, IBM, eBay)"
      ]
    },
    experience: [
      {
        id: "1",
        position: "Chief Artificial Intelligence Officer (CAIO)",
        company: "Ainda AI",
        location: "São Paulo, Brazil",
        period: { start: "07/2024", end: "Current" },
        description: "I lead AI-based transformation for a portfolio of startups and scale-ups, focusing on enterprise-grade implementations with measurable ROI.",
        achievements: [
          { metric: "35%", description: "Reduced operational costs for American fintech ($2B in assets)", impact: "High" },
          { metric: "42%", description: "Increased user retention with educational RAG solution", impact: "High" },
          { metric: "78%", description: "Reduced response time", impact: "Medium" },
          { metric: "500k+", description: "Daily interactions processed with 97% accuracy", impact: "High" }
        ],
        technologies: ["PyTorch", "TensorFlow", "LangChain", "OpenAI APIs", "Llama", "Pinecone", "Weaviate", "Kubernetes", "AWS", "Azure"],
        responsibilities: [
          "Architect multimodal systems (RAG + LLMs) integrated with vector databases",
          "Develop agentic frameworks for conversational AI (voice, text, VR, video)",
          "Lead cross-functional teams with specialists in AI, ML, and product",
          "Establish technical standards and AI Ethics frameworks"
        ]
      },
      {
        id: "2",
        position: "Chief Technology Officer (CTO) and Chief Product Officer (CPO)",
        company: "Inspirali",
        location: "São Paulo, Brazil",
        period: { start: "07/2022", end: "06/2024" },
        description: "Complete digital transformation of medical education group (14 campuses, 15k+ students), building IT, AI, and Digital Products areas from scratch.",
        achievements: [
          { metric: "32%", description: "Increased student retention through adaptive AI", impact: "High" },
          { metric: "45%", description: "Increased student satisfaction", impact: "High" },
          { metric: "28%", description: "Reduced acquisition costs", impact: "Medium" },
          { metric: "41%", description: "Increased candidate conversion", impact: "Medium" },
          { metric: "R$ 8.2M/year", description: "Generated operational savings through intelligent automation", impact: "High" },
          { metric: "65%", description: "Reduced time-to-market with AI in Discovery/Delivery", impact: "High" }
        ],
        technologies: ["Python", "TensorFlow", "Salesforce", "AWS", "Azure", "Kubernetes", "OpenAI", "Claude", "Google Gemini", "Llama"],
        responsibilities: [
          "Built and led a team of 102 professionals (technology + product)",
          "Modernized infrastructure across 14 campuses with 99.9% uptime",
          "Implemented DevOps integrated with AI for process optimization"
        ]
      },
      {
        id: "3",
        position: "Chief Technology Officer (CTO) and Chief Product Officer (CPO)",
        company: "Provu",
        location: "São Paulo, Brazil",
        period: { start: "06/2020", end: "05/2022" },
        description: "CTO of regulated fintech (Central Bank), scaling credit operations through AI and ML innovations.",
        achievements: [
          { metric: "3 days to 4 minutes", description: "Reduced credit approval time", impact: "High" },
          { metric: "R$ 500M+", description: "Processed with 99.8% accuracy", impact: "High" },
          { metric: "99.99%", description: "Cloud-native architecture uptime", impact: "High" },
          { metric: "0", description: "Critical incidents in 12 months", impact: "High" },
          { metric: "40→120", description: "Tripled technical team maintaining <12% turnover", impact: "Medium" }
        ],
        technologies: ["Python", "Node.js", "Kubernetes", "Kafka", "AWS", "Azure", "Terraform", "Databricks", "Snowflake"],
        responsibilities: [
          "Architected an AI-based credit engine",
          "Implemented predictive risk analysis",
          "Established DevSecOps framework",
          "Participated in the Open Banking working group at the Central Bank"
        ]
      }
    ],
    education: [
      {
        id: "1",
        degree: "Certificate Degree in Information Architecture",
        institution: "New York Institute of Technology",
        location: "New York, NY, USA",
        period: { start: "1995", end: "1995" },
        description: "Certificate Degree in Information Architecture"
      },
      {
        id: "2",
        degree: "Bachelor in Social Communication",
        institution: "Cásper Líbero Foundation",
        location: "São Paulo, Brazil",
        period: { start: "1992", end: "1992" },
        description: "Bachelor in Social Communication"
      },
      {
        id: "3",
        degree: "Computer Science Technician",
        institution: "Federal Technical School",
        location: "São Paulo, Brazil",
        period: { start: "1987", end: "1987" },
        description: "Computer Science Technician"
      }
    ],
    skills: [
      {
        name: "Artificial Intelligence & Machine Learning",
        skills: [
          { name: "PyTorch", level: "Expert", yearsOfExperience: 5 },
          { name: "TensorFlow", level: "Expert", yearsOfExperience: 6 },
          { name: "LangChain", level: "Expert", yearsOfExperience: 2 },
          { name: "OpenAI APIs", level: "Expert", yearsOfExperience: 3 },
          { name: "RAG Architecture", level: "Expert", yearsOfExperience: 3 },
          { name: "LLMs", level: "Expert", yearsOfExperience: 3 }
        ]
      },
      {
        name: "Programming Languages",
        skills: [
          { name: "Python", level: "Expert", yearsOfExperience: 15 },
          { name: "Node.js", level: "Advanced", yearsOfExperience: 10 },
          { name: "Java", level: "Advanced", yearsOfExperience: 12 },
          { name: "C#", level: "Advanced", yearsOfExperience: 8 },
          { name: "Swift", level: "Intermediate", yearsOfExperience: 6 }
        ]
      },
      {
        name: "Cloud & Infrastructure",
        skills: [
          { name: "AWS", level: "Expert", yearsOfExperience: 12 },
          { name: "Azure", level: "Expert", yearsOfExperience: 8 },
          { name: "Kubernetes", level: "Expert", yearsOfExperience: 6 },
          { name: "Docker", level: "Advanced", yearsOfExperience: 8 },
          { name: "Terraform", level: "Advanced", yearsOfExperience: 5 }
        ]
      }
    ],
    languages: [
      { name: "Portuguese", proficiency: "Native" },
      { name: "English", proficiency: "Fluent" },
      { name: "Spanish", proficiency: "Intermediate" }
    ],
    activities: [
      "Professor of Digital Marketing – MBA – ESPM School of Advertising and Marketing",
      "Startup Mentor at Endeavor Brasil",
      "Volunteer – Digital Marketing Consultancy for AACD – Association for the Support of Disabled Children",
      "Participant in the Open Banking and Open Finance Working Group at the Central Bank of Brazil",
      "Participant in the Digital Payments Working Group (PIX) at the Central Bank of Brazil"
    ]
  };
  
  // Real projects data based on Projects.md (first few projects)
  const projectsData = [
    {
      id: "1",
      title: "Technology Implementation Project Management - Salesforce CRM for Lending Operations",
      duration: "6-12 months",
      location: "Los Angeles, CA",
      clientType: "Venture Capital or Private Equity",
      projectType: "Technology Implementation Project Management",
      industry: "Entertainment & Media",
      businessUnit: "Product Management",
      problem: "My employer's personal lending unit suffered from fragmented customer data, manual loan origination processes, slow approvals, and inconsistent regulatory oversight-all limiting scalability, customer experience, and operational efficiency.",
      action: "Managed the Salesforce Financial Services Cloud implementation, from requirements gathering and process analysis to vendor management, data migration, integration, testing, and training. Coordinated teams across IT, compliance, and operations. Orchestrated the automation of loan intake and approvals, established transaction pipelines, embedded Al credit scoring, and customized dashboards.",
      result: "Reduced loan approval times from hours to less than five minutes for over 90% of applications. Boosted origination volume by 30%+ post-implementation, achieved 99.8% data accuracy in risk analysis, and improved audit trail reliability. Enhanced project ROI and employee adoption rates, with digital CRM workflows supporting rapid scaling and a 25% increase in customer satisfaction scores.",
      technologies: ["Salesforce", "Financial Services Cloud", "AI Credit Scoring", "CRM Integration"]
    },
    {
      id: "2",
      title: "Technology Assessment & Architecture for Al Customer Service Agent Implementation",
      duration: "0-6 months",
      location: "San Diego, CA",
      clientType: "Large Enterprise",
      projectType: "Technology Assessment",
      industry: "Financial Services",
      businessUnit: "Consulting & Advisory",
      problem: "My client, a leading real estate private equity firm, sought to deploy an AI-powered Customer Service Agent to revolutionize luxury real estate lead management. Ensuring system effectiveness and alignment with operational excellence required a rigorous technology assessment of available solutions for voice recognition, AI conversation, CRM integration, and compliance in a high-touch, data-driven environment.",
      action: "Led evaluation and selection of a technology stack, including Deepgram (speech-to-text), OpenAI Whisper, ElevenLabs (voice cloning), PipeCat (real-time orchestration), Pinecone (vector DB), Anthropic Claude (LLM), LangChain (agent framework), and Twilio/Soul Machines (chat interfaces). Benchmarked performance, reliability, security, and integration for each.",
      result: "Delivered an enterprise-grade architecture enabling natural language lead qualification, automated information dissemination, and appointment scheduling with real-time CRM integration. Established KPIs for lead accuracy, latency, uptime, and conversion improvement. Enabled scalable deployment and institutional compliance, positioning it at the forefront of luxury real estate innovation.",
      technologies: ["Deepgram", "OpenAI Whisper", "ElevenLabs", "PipeCat", "Pinecone", "Anthropic Claude", "LangChain", "Twilio"]
    },
    {
      id: "3",
      title: "Salesforce Implementation for Personal Lending Process Optimization",
      duration: "12-24 months",
      location: "Sao Paulo, SP",
      clientType: "Venture Capital or Private Equity",
      projectType: "Software Implementation",
      industry: "Financial Services",
      businessUnit: "Information Technology",
      problem: "My employer required a scalable CRM to streamline its personal lending operation, unify borrower data, automate workflows, and ensure fast, compliant credit decisions. Existing fragmented systems led to slow loan origination, high error rates, and limited customer visibility.",
      action: "Led the end-to-end deployment of Salesforce Financial Services Cloud, integrating APIs to connect loan origination, underwriting, and customer service. Automated borrower intake, credit verification, and approval workflows; established a centralized data repository for 1M+ monthly transactions. Embedded compliance tools, intelligent risk analytics, and dashboards to enhance regulatory oversight and performance measurement.",
      result: "Reduced loan approval turnaround from hours to under 5 minutes for 90%+ of applications, increased origination volume by over 30%, and improved risk analysis accuracy to 99.8%. Enhanced customer engagement through personalized communication and self-service portals, achieving a 25% lift in satisfaction scores.",
      technologies: ["Salesforce Financial Services Cloud", "API Integration", "Risk Analytics", "Compliance Tools"]
    }
  ];
  
  const isLoading = false;
  const error = null;

  /**
   * Get resume data for current language
   */
  const currentResumeData = useMemo((): ResumeData | null => {
    if (!resumeData) return null;
    
    // Return static data directly (not language-keyed for now)
    return resumeData;
  }, [resumeData, language]);

  /**
   * Get projects data for current language
   */
  const currentProjectsData = useMemo((): Project[] => {
    if (!projectsData) return [];
    
    // Return static data directly (not language-keyed for now)
    return projectsData;
  }, [projectsData, language]);

  /**
   * Get content with fallback mechanism
   */
  const getContentWithFallback = <T>(
    content: Record<string, T> | undefined,
    fallbackLanguage: 'en' | 'pt' = 'en'
  ): T | null => {
    if (!content) return null;
    
    // Try current language first
    if (content[language]) {
      return content[language];
    }
    
    // Fallback to specified language
    if (content[fallbackLanguage]) {
      return content[fallbackLanguage];
    }
    
    // Last resort: return any available content
    const availableKeys = Object.keys(content);
    if (availableKeys.length > 0) {
      return content[availableKeys[0]];
    }
    
    return null;
  };

  /**
   * Check if content is available in current language
   */
  const hasContentInCurrentLanguage = (content: Record<string, any> | undefined): boolean => {
    return !!(content && content[language]);
  };

  /**
   * Get available languages for content
   */
  const getAvailableLanguages = (content: Record<string, any> | undefined): string[] => {
    if (!content) return [];
    return Object.keys(content);
  };

  /**
   * Get localized text with fallback
   */
  const getLocalizedText = (
    text: string | Record<string, string> | undefined,
    fallback?: string
  ): string => {
    if (!text) return fallback || '';
    
    if (typeof text === 'string') {
      return text;
    }
    
    // Handle object with language keys
    if (typeof text === 'object') {
      return text[language] || text.en || text.pt || fallback || '';
    }
    
    return fallback || '';
  };

  /**
   * Format content for display (handles arrays, objects, etc.)
   */
  const formatContent = (content: any): string => {
    if (!content) return '';
    
    if (typeof content === 'string') {
      return content;
    }
    
    if (Array.isArray(content)) {
      return content.join(', ');
    }
    
    if (typeof content === 'object') {
      return getLocalizedText(content);
    }
    
    return String(content);
  };

  /**
   * Get content statistics
   */
  const getContentStats = () => {
    return {
      hasResumeData: !!currentResumeData,
      hasProjectsData: currentProjectsData.length > 0,
      resumeLanguages: resumeData ? Object.keys(resumeData) : [],
      projectsLanguages: projectsData ? Object.keys(projectsData) : [],
      currentLanguage: language,
      isContentComplete: !!currentResumeData && currentProjectsData.length > 0,
    };
  };

  return {
    // Current language content
    resumeData: currentResumeData,
    projectsData: currentProjectsData,
    
    // Loading and error states
    isLoading,
    error,
    
    // Utility functions
    getContentWithFallback,
    hasContentInCurrentLanguage,
    getAvailableLanguages,
    getLocalizedText,
    formatContent,
    getContentStats,
    
    // Current language
    language,
  };
}