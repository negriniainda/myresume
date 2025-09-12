import { DataManager } from '@/services/data-manager';
import { DataService } from '@/services/data-service';
import { 
  enhanceExperienceItems, 
  enhanceProjects, 
  transformResumeForContext,
  groupProjects,
  createExperienceTimeline 
} from '@/utils/data-transformers';
import { 
  validateResumeData, 
  validateProjects, 
  validateDataConsistency,
  sanitizeData,
  normalizeData 
} from '@/utils/data-validators';
import type { 
  ResumeData, 
  Project, 
  ExperienceItem, 
  SkillCategory,
  PersonalInfo 
} from '@/types';

// Mock data for testing
const mockPersonalInfo: PersonalInfo = {
  name: 'John Doe',
  title: 'Senior Software Engineer',
  location: 'San Francisco, CA',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  linkedin: 'https://linkedin.com/in/johndoe',
  github: 'https://github.com/johndoe',
};

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
  personalInfo: mockPersonalInfo,
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

describe('DataManager', () => {
  let dataManager: DataManager;

  beforeEach(() => {
    dataManager = new DataManager({
      ttl: 1000, // 1 second for testing
      maxSize: 10,
      version: '1.0.0',
    });
  });

  describe('Search functionality', () => {
    it('should search content and return scored results', () => {
      const results = dataManager.searchContent(
        mockExperience,
        'React',
        ['position', 'description', 'technologies']
      );

      expect(results).toHaveLength(2);
      expect(results[0].score).toBeGreaterThan(0);
      expect(results[0].matches).toHaveLength(1);
      expect(results[0].matches[0].field).toBe('technologies');
    });

    it('should handle empty search terms', () => {
      const results = dataManager.searchContent(
        mockExperience,
        '',
        ['position', 'description']
      );

      expect(results).toHaveLength(2);
      results.forEach(result => {
        expect(result.score).toBe(1);
        expect(result.matches).toHaveLength(0);
      });
    });

    it('should score exact matches higher than partial matches', () => {
      const testData = [
        { title: 'React Developer' },
        { title: 'React Native Development' },
        { title: 'Full Stack with React' },
      ];

      const results = dataManager.searchContent(testData, 'React', ['title']);
      
      // Exact match should score highest
      expect(results[0].item.title).toBe('React Developer');
      expect(results[0].score).toBeGreaterThan(results[1].score);
    });
  });

  describe('Filtering functionality', () => {
    it('should filter experience by technologies', () => {
      const filtered = dataManager.filterExperience(mockExperience, {
        technologies: ['React'],
      });

      expect(filtered).toHaveLength(2);
      filtered.forEach(exp => {
        expect(exp.technologies).toContain('React');
      });
    });

    it('should filter experience by date range', () => {
      const filtered = dataManager.filterExperience(mockExperience, {
        dateRange: { start: '2019', end: '2021' },
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].company).toBe('Tech Corp');
    });

    it('should filter projects by industry', () => {
      const filtered = dataManager.filterProjects(mockProjects, {
        industries: ['Technology'],
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].industry).toBe('Technology');
    });

    it('should combine multiple filters', () => {
      const filtered = dataManager.filterExperience(mockExperience, {
        technologies: ['React'],
        companies: ['Tech Corp'],
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].company).toBe('Tech Corp');
      expect(filtered[0].technologies).toContain('React');
    });
  });

  describe('Data transformation', () => {
    it('should transform data with sorting', () => {
      const transformed = dataManager.transformData(mockExperience, {
        sortBy: 'company',
        sortOrder: 'asc',
      });

      expect(transformed.data).toHaveLength(2);
      expect(transformed.data[0].company).toBe('StartupXYZ');
      expect(transformed.data[1].company).toBe('Tech Corp');
      expect(transformed.metadata.total).toBe(2);
    });

    it('should apply limit to transformed data', () => {
      const transformed = dataManager.transformData(mockExperience, {
        limit: 1,
      });

      expect(transformed.data).toHaveLength(1);
      expect(transformed.metadata.total).toBe(2);
      expect(transformed.metadata.filtered).toBe(1);
    });
  });

  describe('Metrics calculation', () => {
    it('should calculate experience metrics correctly', () => {
      const metrics = dataManager.calculateExperienceMetrics(mockExperience);

      expect(metrics.totalYears).toBeGreaterThan(0);
      expect(metrics.companiesWorked).toBe(2);
      expect(metrics.rolesHeld).toBe(2);
      expect(metrics.topTechnologies).toHaveLength(4);
      expect(metrics.careerProgression).toHaveLength(2);
    });

    it('should calculate project metrics correctly', () => {
      const metrics = dataManager.calculateProjectMetrics(mockProjects);

      expect(metrics.totalProjects).toBe(2);
      expect(metrics.industriesCovered).toContain('Technology');
      expect(metrics.industriesCovered).toContain('Retail');
      expect(metrics.successRate).toBe(100);
      expect(metrics.topTechnologies.length).toBeGreaterThan(0);
    });

    it('should calculate skill metrics correctly', () => {
      const metrics = dataManager.calculateSkillMetrics(mockSkills);

      expect(metrics.totalSkills).toBe(5);
      expect(metrics.expertSkills).toBe(3);
      expect(metrics.advancedSkills).toBe(2);
      expect(metrics.skillsByCategory).toHaveLength(2);
    });
  });

  describe('Technology and industry extraction', () => {
    it('should extract all unique technologies', () => {
      const technologies = dataManager.getAllTechnologies(mockExperience, mockProjects);

      expect(technologies).toContain('React');
      expect(technologies).toContain('TypeScript');
      expect(technologies).toContain('Python');
      expect(technologies).toContain('TensorFlow');
      expect(new Set(technologies).size).toBe(technologies.length); // No duplicates
    });

    it('should extract all unique industries', () => {
      const industries = dataManager.getAllIndustries(mockExperience, mockProjects);

      expect(industries).toContain('Technology');
      expect(industries).toContain('Retail');
      expect(industries.length).toBeGreaterThan(0);
    });
  });
});

describe('Data Transformers', () => {
  describe('enhanceExperienceItems', () => {
    it('should enhance experience items with metadata', () => {
      const enhanced = enhanceExperienceItems(mockExperience);

      expect(enhanced).toHaveLength(2);
      enhanced.forEach(exp => {
        expect(exp).toHaveProperty('companySize');
        expect(exp).toHaveProperty('industry');
        expect(exp).toHaveProperty('roleType');
        expect(exp).toHaveProperty('remote');
        expect(exp).toHaveProperty('highlights');
      });
    });

    it('should infer remote work correctly', () => {
      const enhanced = enhanceExperienceItems(mockExperience);
      const remoteExp = enhanced.find(exp => exp.location === 'Remote');
      
      expect(remoteExp?.remote).toBe(true);
    });
  });

  describe('enhanceProjects', () => {
    it('should enhance projects with metadata', () => {
      const enhanced = enhanceProjects(mockProjects);

      expect(enhanced).toHaveLength(2);
      enhanced.forEach(project => {
        expect(project).toHaveProperty('status');
        expect(project).toHaveProperty('complexity');
        expect(project).toHaveProperty('impact');
        expect(project).toHaveProperty('clientSatisfaction');
        expect(project).toHaveProperty('tags');
      });
    });

    it('should infer project complexity correctly', () => {
      const enhanced = enhanceProjects(mockProjects);
      const complexProject = enhanced.find(p => p.title.includes('Modernization'));
      
      expect(complexProject?.complexity).toBe('High');
    });
  });

  describe('transformResumeForContext', () => {
    it('should transform resume for summary context', () => {
      const transformed = transformResumeForContext(mockResumeData, 'summary');

      expect(transformed.personalInfo).toBeDefined();
      expect(transformed.summary).toBeDefined();
      expect(transformed.experience).toHaveLength(3); // Limited to top 3
      expect(transformed.skills).toHaveLength(2); // Limited to top 2 categories
    });

    it('should transform resume for technical context', () => {
      const transformed = transformResumeForContext(mockResumeData, 'technical');

      expect(transformed.personalInfo).toBeDefined();
      expect(transformed.skills).toBeDefined();
      expect(transformed.experience).toBeDefined();
      // Should filter to technical experiences only
      transformed.experience?.forEach(exp => {
        expect(exp.technologies.length).toBeGreaterThan(0);
      });
    });
  });

  describe('groupProjects', () => {
    it('should group projects by industry', () => {
      const grouped = groupProjects(mockProjects, 'industry');

      expect(grouped).toHaveProperty('Technology');
      expect(grouped).toHaveProperty('Retail');
      expect(grouped.Technology).toHaveLength(1);
      expect(grouped.Retail).toHaveLength(1);
    });

    it('should group projects by client type', () => {
      const grouped = groupProjects(mockProjects, 'clientType');

      expect(grouped).toHaveProperty('Enterprise');
      expect(grouped).toHaveProperty('Startup');
    });
  });

  describe('createExperienceTimeline', () => {
    it('should create timeline with start and end events', () => {
      const timeline = createExperienceTimeline(mockExperience);

      expect(timeline.length).toBeGreaterThan(0);
      
      // Should have start events
      const startEvents = timeline.flatMap(t => t.events.filter(e => e.type === 'start'));
      expect(startEvents).toHaveLength(2);

      // Should have end events (excluding current positions)
      const endEvents = timeline.flatMap(t => t.events.filter(e => e.type === 'end'));
      expect(endEvents).toHaveLength(1); // Only one non-current position
    });

    it('should sort timeline by year', () => {
      const timeline = createExperienceTimeline(mockExperience);

      for (let i = 1; i < timeline.length; i++) {
        expect(timeline[i].year).toBeGreaterThanOrEqual(timeline[i - 1].year);
      }
    });
  });
});

describe('Data Validators', () => {
  describe('validateResumeData', () => {
    it('should validate correct resume data', () => {
      const result = validateResumeData(mockResumeData);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toBeDefined();
    });

    it('should detect missing required fields', () => {
      const invalidResume = {
        ...mockResumeData,
        personalInfo: {
          ...mockPersonalInfo,
          name: '', // Invalid empty name
          email: 'invalid-email', // Invalid email format
        },
      };

      const result = validateResumeData(invalidResume);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      
      const nameError = result.errors.find(e => e.field === 'personalInfo.name');
      const emailError = result.errors.find(e => e.field === 'personalInfo.email');
      
      expect(nameError).toBeDefined();
      expect(emailError).toBeDefined();
    });

    it('should validate date logic in experience', () => {
      const invalidResume = {
        ...mockResumeData,
        experience: [{
          ...mockExperience[0],
          period: { start: '2020', end: '2019' }, // End before start
        }],
      };

      const result = validateResumeData(invalidResume);

      expect(result.success).toBe(false);
      const dateError = result.errors.find(e => e.field.includes('period'));
      expect(dateError).toBeDefined();
    });
  });

  describe('validateProjects', () => {
    it('should validate correct projects data', () => {
      const result = validateProjects(mockProjects);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toBeDefined();
    });

    it('should detect missing required project fields', () => {
      const invalidProjects = [{
        ...mockProjects[0],
        title: '', // Invalid empty title
        problem: '', // Invalid empty problem
      }];

      const result = validateProjects(invalidProjects);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateDataConsistency', () => {
    it('should validate consistent data', () => {
      const errors = validateDataConsistency(mockResumeData, mockProjects);

      // Should have minimal consistency errors for well-structured mock data
      expect(errors.length).toBeLessThan(5);
    });

    it('should detect technology inconsistencies', () => {
      const inconsistentProjects = [{
        ...mockProjects[0],
        technologies: ['UnknownTech', 'AnotherUnknownTech'],
      }];

      const errors = validateDataConsistency(mockResumeData, inconsistentProjects);

      const techError = errors.find(e => e.field === 'consistency.technologies');
      expect(techError).toBeDefined();
    });
  });

  describe('sanitizeData', () => {
    it('should remove HTML tags from strings', () => {
      const dirtyData = {
        name: 'John <script>alert("xss")</script> Doe',
        description: 'This is <b>bold</b> text with <a href="#">link</a>',
      };

      const sanitized = sanitizeData(dirtyData);

      expect(sanitized.name).toBe('John  Doe');
      expect(sanitized.description).toBe('This is bold text with link');
    });

    it('should handle nested objects and arrays', () => {
      const dirtyData = {
        items: [
          { text: 'Clean <script>bad</script> text' },
          { text: 'Another <b>item</b>' },
        ],
        nested: {
          value: 'Nested <i>content</i>',
        },
      };

      const sanitized = sanitizeData(dirtyData);

      expect(sanitized.items[0].text).toBe('Clean  text');
      expect(sanitized.items[1].text).toBe('Another item');
      expect(sanitized.nested.value).toBe('Nested content');
    });
  });

  describe('normalizeData', () => {
    it('should normalize whitespace in strings', () => {
      const messyData = {
        text: '  Multiple   spaces   and\n\n\nextra\nlines  ',
        description: 'Normal text with   extra spaces',
      };

      const normalized = normalizeData(messyData);

      expect(normalized.text).toBe('Multiple spaces and\nextra\nlines');
      expect(normalized.description).toBe('Normal text with extra spaces');
    });
  });
});

describe('DataService Integration', () => {
  let dataService: DataService;

  beforeEach(() => {
    dataService = new DataService();
    
    // Mock the fetch calls
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should handle successful data loading', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResumeData),
      });

    const result = await dataService.loadResumeData('en');

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.errors).toHaveLength(0);
  });

  it('should handle network errors gracefully', async () => {
    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'));

    const result = await dataService.loadResumeData('en');

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].message).toContain('Network error');
  });

  it('should validate and sanitize loaded data', async () => {
    const dirtyData = {
      ...mockResumeData,
      personalInfo: {
        ...mockPersonalInfo,
        name: 'John <script>alert("xss")</script> Doe',
      },
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(dirtyData),
      });

    const result = await dataService.loadResumeData('en');

    expect(result.success).toBe(true);
    expect(result.data?.personalInfo.name).toBe('John  Doe');
  });
});