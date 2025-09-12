import { 
  parseProjectsMarkdown, 
  projectsToMarkdown
} from '../utils/translator';

// Mock OpenAI to avoid API calls during testing
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: 'Texto traduzido para português'
              }
            }]
          })
        }
      }
    }))
  };
});

describe('Translator Utils', () => {
  const sampleMarkdown = `# Projects Portfolio

## E-commerce Platform Modernization

8 months I São Paulo, SP I Large Enterprise

Project Type: Digital Transformation I Industry Type: Retail I Business Unit: Technology

### Problem:

Legacy e-commerce platform couldn't handle peak traffic during Black Friday, experiencing frequent crashes and poor user experience with 15-second page load times.

### Action:

Led complete platform modernization using microservices architecture, implemented React frontend with server-side rendering, migrated to AWS cloud infrastructure with auto-scaling capabilities, and established CI/CD pipelines.

### Result:

Achieved 99.9% uptime during peak seasons, reduced page load times by 70% (from 15s to 4.5s), increased conversion rates by 25%, and handled 10x traffic increase without performance degradation.

## AI-Powered Analytics Dashboard

6 months I Remote I Mid-size Company

Project Type: Product Development I Industry Type: Healthcare I Business Unit: Data Science

### Problem:

Healthcare providers needed real-time insights from patient data but lacked analytical capabilities, relying on manual reports that took days to generate and often contained outdated information.

### Action:

Developed machine learning models for predictive analytics using Python and TensorFlow, created intuitive dashboard using React and D3.js, implemented real-time data processing with Apache Kafka, and established automated alerting system.

### Result:

Enabled early detection of health risks improving patient outcomes by 30%, reduced report generation time from days to minutes, decreased operational costs by $500K annually, and increased patient satisfaction scores by 40%.`;

  describe('parseProjectsMarkdown', () => {
    it('should parse markdown content into structured project data', () => {
      const projects = parseProjectsMarkdown(sampleMarkdown);
      
      expect(projects).toHaveLength(2);
      
      // Test first project
      expect(projects[0]).toEqual({
        title: 'E-commerce Platform Modernization',
        duration: '8 months',
        location: 'São Paulo, SP',
        clientType: 'Large Enterprise',
        projectType: 'Digital Transformation',
        industry: 'Retail',
        businessUnit: 'Technology',
        problem: 'Legacy e-commerce platform couldn\'t handle peak traffic during Black Friday, experiencing frequent crashes and poor user experience with 15-second page load times.',
        action: 'Led complete platform modernization using microservices architecture, implemented React frontend with server-side rendering, migrated to AWS cloud infrastructure with auto-scaling capabilities, and established CI/CD pipelines.',
        result: 'Achieved 99.9% uptime during peak seasons, reduced page load times by 70% (from 15s to 4.5s), increased conversion rates by 25%, and handled 10x traffic increase without performance degradation.'
      });
      
      // Test second project
      expect(projects[1]).toEqual({
        title: 'AI-Powered Analytics Dashboard',
        duration: '6 months',
        location: 'Remote',
        clientType: 'Mid-size Company',
        projectType: 'Product Development',
        industry: 'Healthcare',
        businessUnit: 'Data Science',
        problem: 'Healthcare providers needed real-time insights from patient data but lacked analytical capabilities, relying on manual reports that took days to generate and often contained outdated information.',
        action: 'Developed machine learning models for predictive analytics using Python and TensorFlow, created intuitive dashboard using React and D3.js, implemented real-time data processing with Apache Kafka, and established automated alerting system.',
        result: 'Enabled early detection of health risks improving patient outcomes by 30%, reduced report generation time from days to minutes, decreased operational costs by $500K annually, and increased patient satisfaction scores by 40%.'
      });
    });

    it('should handle empty or invalid markdown', () => {
      expect(parseProjectsMarkdown('')).toEqual([]);
      expect(parseProjectsMarkdown('# Just a title')).toEqual([]);
      expect(parseProjectsMarkdown('## Incomplete project\n**Duration:** 6 months')).toEqual([]);
    });
  });

  describe('projectsToMarkdown', () => {
    it('should convert project data back to markdown format', () => {
      const projects = [
        {
          title: 'Projeto de Teste',
          duration: '6 meses',
          location: 'São Paulo, SP',
          clientType: 'Grande Empresa',
          projectType: 'Transformação Digital',
          industry: 'Varejo',
          businessUnit: 'Tecnologia',
          problem: 'Problema de teste',
          action: 'Ação de teste',
          result: 'Resultado de teste'
        }
      ];

      const markdown = projectsToMarkdown(projects);
      
      expect(markdown).toContain('# Portfólio de Projetos');
      expect(markdown).toContain('## Projeto de Teste');
      expect(markdown).toContain('**Duração:** 6 meses');
      expect(markdown).toContain('**Localização:** São Paulo, SP');
      expect(markdown).toContain('**Tipo de Cliente:** Grande Empresa');
      expect(markdown).toContain('**Tipo de Projeto:** Transformação Digital');
      expect(markdown).toContain('**Indústria:** Varejo');
      expect(markdown).toContain('**Unidade de Negócio:** Tecnologia');
      expect(markdown).toContain('**Problema:** Problema de teste');
      expect(markdown).toContain('**Ação:** Ação de teste');
      expect(markdown).toContain('**Resultado:** Resultado de teste');
    });
  });

  // Note: translateText tests are skipped in unit tests to avoid API calls
  // Integration tests should be used to test the actual translation functionality
});