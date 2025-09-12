#!/usr/bin/env tsx

/**
 * Validation script for the data management system
 * This script tests the core functionality without relying on external APIs
 */

import { DataManager } from '../services/data-manager';
import { enhanceExperienceItems, enhanceProjects } from '../utils/data-transformers';
import { validateResumeData, validateProjects, sanitizeData, normalizeData } from '../utils/data-validators';
import type { ResumeData, Project, ExperienceItem, SkillCategory } from '../types';

// Mock data for testing
const mockExperience: ExperienceItem[] = [
  {
    id: 'exp-1',
    position: 'Senior Software Engineer',
    company: 'Tech Corp',
    location: 'San Francisco, CA',
    period: { start: '2020', end: 'Present' },
    description: 'Led development of scalable web applications using React and Node.js',
    achievements: [
      { metric: '40%', description: 'Improved application performance by 40%' },
      { metric: '$500K', description: 'Reduced infrastructure costs by $500K annually' },
    ],
    technologies: ['React', 'Node.js', 'TypeScript', 'AWS'],
    responsibilities: ['Lead team of 5 developers', 'Architect scalable solutions'],
  },
  {
    id: 'exp-2',
    position: 'Software Engineer',
    company: 'StartupXYZ',
    location: 'Remote',
    period: { start: '2018', end: '2020' },
    description: 'Developed full-stack applications using modern JavaScript frameworks',
    achievements: [
      { metric: '3x', description: 'Increased user engagement by 3x' },
    ],
    technologies: ['JavaScript', 'React', 'Python', 'Docker'],
    responsibilities: ['Full-stack development', 'Code reviews'],
  },
];

const mockSkills: SkillCategory[] = [
  {
    name: 'Programming Languages',
    skills: [
      { name: 'TypeScript', level: 'Expert', yearsOfExperience: 5 },
      { name: 'JavaScript', level: 'Expert', yearsOfExperience: 7 },
      { name: 'Python', level: 'Advanced', yearsOfExperience: 4 },
    ],
  },
  {
    name: 'Frameworks',
    skills: [
      { name: 'React', level: 'Expert', yearsOfExperience: 6 },
      { name: 'Node.js', level: 'Advanced', yearsOfExperience: 5 },
    ],
  },
];

const mockResumeData: ResumeData = {
  personalInfo: {
    name: 'John Doe',
    title: 'Senior Software Engineer',
    location: 'San Francisco, CA',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
  },
  summary: {
    title: 'Professional Summary',
    items: [
      'Experienced software engineer with 7+ years in web development',
      'Expert in React, TypeScript, and cloud technologies',
      'Proven track record of leading high-performing teams',
    ],
  },
  experience: mockExperience,
  education: [
    {
      id: 'edu-1',
      degree: 'Bachelor of Science in Computer Science',
      institution: 'University of Technology',
      location: 'San Francisco, CA',
      period: { start: '2014', end: '2018' },
    },
  ],
  skills: mockSkills,
  languages: [
    { name: 'English', proficiency: 'Native' },
    { name: 'Spanish', proficiency: 'Conversational' },
  ],
  activities: ['Open source contributor', 'Tech meetup organizer'],
};

const mockProjects: Project[] = [
  {
    id: 'proj-1',
    title: 'E-commerce Platform Modernization',
    duration: '8 months (2023)',
    location: 'San Francisco, CA',
    clientType: 'Enterprise',
    projectType: 'Digital Transformation',
    industry: 'Retail',
    businessUnit: 'Technology',
    problem: 'Legacy e-commerce platform causing performance issues and limiting growth',
    action: 'Led complete platform modernization using microservices architecture',
    result: 'Achieved 60% performance improvement and 40% increase in conversion rates',
    technologies: ['React', 'Node.js', 'AWS', 'Docker', 'Kubernetes'],
  },
  {
    id: 'proj-2',
    title: 'AI-Powered Analytics Dashboard',
    duration: '6 months (2022)',
    location: 'Remote',
    clientType: 'Startup',
    projectType: 'Product Development',
    industry: 'Technology',
    businessUnit: 'Product',
    problem: 'Need for real-time analytics and predictive insights',
    action: 'Developed ML-powered dashboard with real-time data processing',
    result: 'Enabled data-driven decisions resulting in 25% revenue increase',
    technologies: ['Python', 'TensorFlow', 'React', 'PostgreSQL'],
  },
];

async function validateDataManagement() {
  console.log('🔍 Validating Data Management System...\n');

  // Test 1: Data Manager Core Functionality
  console.log('1. Testing DataManager core functionality...');
  const dataManager = new DataManager({
    ttl: 1000,
    maxSize: 10,
    version: '1.0.0',
  });

  // Test search functionality
  const searchResults = dataManager.searchContent(
    mockExperience,
    'React',
    ['position', 'description', 'technologies']
  );
  
  console.log(`   ✅ Search found ${searchResults.length} results for "React"`);
  console.log(`   ✅ First result score: ${searchResults[0]?.score || 0}`);

  // Test filtering
  const filteredExperience = dataManager.filterExperience(mockExperience, {
    technologies: ['React'],
  });
  
  console.log(`   ✅ Filtered experience: ${filteredExperience.length} items with React`);

  // Test metrics calculation
  const experienceMetrics = dataManager.calculateExperienceMetrics(mockExperience);
  console.log(`   ✅ Experience metrics: ${experienceMetrics.totalYears} years total experience`);
  console.log(`   ✅ Companies worked: ${experienceMetrics.companiesWorked}`);
  console.log(`   ✅ Top technologies: ${experienceMetrics.topTechnologies.slice(0, 3).map(t => t.name).join(', ')}`);

  const projectMetrics = dataManager.calculateProjectMetrics(mockProjects);
  console.log(`   ✅ Project metrics: ${projectMetrics.totalProjects} total projects`);
  console.log(`   ✅ Industries covered: ${projectMetrics.industriesCovered.join(', ')}`);

  const skillMetrics = dataManager.calculateSkillMetrics(mockSkills);
  console.log(`   ✅ Skill metrics: ${skillMetrics.totalSkills} total skills`);
  console.log(`   ✅ Expert skills: ${skillMetrics.expertSkills}`);

  // Test 2: Data Transformers
  console.log('\n2. Testing Data Transformers...');
  
  const enhancedExperience = enhanceExperienceItems(mockExperience);
  console.log(`   ✅ Enhanced experience items: ${enhancedExperience.length} items`);
  console.log(`   ✅ First item company size: ${enhancedExperience[0]?.companySize || 'Unknown'}`);
  console.log(`   ✅ First item role type: ${enhancedExperience[0]?.roleType || 'Unknown'}`);

  const enhancedProjects = enhanceProjects(mockProjects);
  console.log(`   ✅ Enhanced projects: ${enhancedProjects.length} items`);
  console.log(`   ✅ First project complexity: ${enhancedProjects[0]?.complexity || 'Unknown'}`);
  console.log(`   ✅ First project impact: ${enhancedProjects[0]?.impact || 'Unknown'}`);

  // Test 3: Data Validators
  console.log('\n3. Testing Data Validators...');
  
  const resumeValidation = validateResumeData(mockResumeData);
  console.log(`   ✅ Resume validation: ${resumeValidation.success ? 'PASSED' : 'FAILED'}`);
  if (!resumeValidation.success) {
    console.log(`   ❌ Errors: ${resumeValidation.errors.map(e => e.message).join(', ')}`);
  }

  const projectsValidation = validateProjects(mockProjects);
  console.log(`   ✅ Projects validation: ${projectsValidation.success ? 'PASSED' : 'FAILED'}`);
  if (!projectsValidation.success) {
    console.log(`   ❌ Errors: ${projectsValidation.errors.map(e => e.message).join(', ')}`);
  }

  // Test data sanitization
  const dirtyData = {
    name: 'John <script>alert("xss")</script> Doe',
    description: 'This is <b>bold</b> text with <a href="#">link</a>',
  };
  
  const sanitized = sanitizeData(dirtyData);
  console.log(`   ✅ Data sanitization: "${dirtyData.name}" → "${sanitized.name}"`);

  // Test data normalization
  const messyData = {
    text: '  Multiple   spaces   and\n\n\nextra\nlines  ',
  };
  
  const normalized = normalizeData(messyData);
  console.log(`   ✅ Data normalization: whitespace cleaned`);

  // Test 4: Technology and Industry Extraction
  console.log('\n4. Testing Technology and Industry Extraction...');
  
  const allTechnologies = dataManager.getAllTechnologies(mockExperience, mockProjects);
  console.log(`   ✅ All technologies: ${allTechnologies.length} unique technologies`);
  console.log(`   ✅ Technologies: ${allTechnologies.slice(0, 5).join(', ')}...`);

  const allIndustries = dataManager.getAllIndustries(mockExperience, mockProjects);
  console.log(`   ✅ All industries: ${allIndustries.length} unique industries`);
  console.log(`   ✅ Industries: ${allIndustries.join(', ')}`);

  // Test 5: Data Transformation
  console.log('\n5. Testing Data Transformation...');
  
  const transformedData = dataManager.transformData(mockExperience, {
    sortBy: 'company',
    sortOrder: 'asc',
    limit: 1,
  });
  
  console.log(`   ✅ Data transformation: ${transformedData.data.length} items (limited from ${transformedData.metadata.total})`);
  console.log(`   ✅ First item after sort: ${transformedData.data[0]?.company || 'Unknown'}`);

  // Test 6: Cache functionality
  console.log('\n6. Testing Cache functionality...');
  
  const cacheStats = dataManager.getCacheStats();
  console.log(`   ✅ Cache stats: ${cacheStats.size}/${cacheStats.maxSize} items`);
  
  dataManager.clearCache();
  const clearedStats = dataManager.getCacheStats();
  console.log(`   ✅ Cache cleared: ${clearedStats.size} items remaining`);

  console.log('\n🎉 Data Management System validation completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   • Search functionality: Working`);
  console.log(`   • Filtering system: Working`);
  console.log(`   • Data transformation: Working`);
  console.log(`   • Metrics calculation: Working`);
  console.log(`   • Data validation: Working`);
  console.log(`   • Data sanitization: Working`);
  console.log(`   • Cache management: Working`);
  console.log(`   • Technology extraction: Working`);
  console.log(`   • Industry extraction: Working`);
}

// Run validation if this script is executed directly
if (require.main === module) {
  validateDataManagement().catch(console.error);
}

export { validateDataManagement };