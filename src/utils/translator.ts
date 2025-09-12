import OpenAI from 'openai';

// Initialize OpenAI client only when API key is available
let openai: OpenAI | null = null;

const getOpenAIClient = (): OpenAI => {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
};

// Interface for project data structure
interface Project {
  title: string;
  duration: string;
  location: string;
  clientType: string;
  projectType: string;
  industry: string;
  businessUnit: string;
  problem: string;
  action: string;
  result: string;
}

/**
 * Translates a single text string to Portuguese using OpenAI API
 */
export const translateText = async (
  text: string,
  targetLanguage: string = 'Portuguese'
): Promise<string> => {
  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator specializing in technical and business content. 
          Translate the following text to ${targetLanguage}, maintaining:
          - Technical terminology accuracy
          - Professional tone
          - Industry-specific language
          - Numerical values and metrics exactly as provided
          - Proper names and company names unchanged
          - Currency symbols and amounts unchanged
          
          Provide only the translation without any additional commentary.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    return response.choices[0]?.message?.content?.trim() || text;
  } catch (error) {
    console.error('Translation error:', error);
    // Return original text as fallback
    return text;
  }
};

/**
 * Translates markdown content while preserving structure
 */
export const translateMarkdown = async (
  markdownContent: string,
  targetLanguage: string = 'Portuguese'
): Promise<string> => {
  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator specializing in technical documentation. 
          Translate the following markdown content to ${targetLanguage}, ensuring:
          
          CRITICAL REQUIREMENTS:
          - Preserve ALL markdown formatting (headers, bold, italic, lists, etc.)
          - Keep the exact same structure and hierarchy
          - Maintain technical terminology accuracy
          - Preserve numerical values, metrics, and percentages exactly
          - Keep proper names, company names, and locations unchanged
          - Maintain currency symbols and amounts unchanged
          - Use industry-standard Portuguese technical terms
          - Keep professional business tone
          
          TECHNICAL TERMS GUIDELINES:
          - "E-commerce" → "E-commerce" (keep in English)
          - "DevOps" → "DevOps" (keep in English)
          - "API" → "API" (keep in English)
          - "Dashboard" → "Dashboard" (keep in English)
          - "Cloud" → "Nuvem" or keep "Cloud" based on context
          - "Frontend/Backend" → "Frontend/Backend" (keep in English)
          - "Mobile" → "Mobile" (keep in English)
          - "Startup" → "Startup" (keep in English)
          
          Provide only the translated markdown without any additional commentary.`,
        },
        {
          role: 'user',
          content: markdownContent,
        },
      ],
      temperature: 0.2,
      max_tokens: 4000,
    });

    return response.choices[0]?.message?.content?.trim() || markdownContent;
  } catch (error) {
    console.error('Markdown translation error:', error);
    // Return original content as fallback
    return markdownContent;
  }
};

/**
 * Parses markdown project content into structured data
 */
export const parseProjectsMarkdown = (markdownContent: string): Project[] => {
  const projects: Project[] = [];
  
  // Split content by ## headers (project sections)
  const projectSections = markdownContent.split(/^## /gm).filter(section => section.trim());
  
  for (const section of projectSections) {
    const lines = section.split('\n').filter(line => line.trim());
    if (lines.length === 0) continue;
    
    const project: Partial<Project> = {};
    
    // First line is the title
    project.title = lines[0].trim();
    
    let currentField = '';
    let fieldContent = '';
    
    // Parse metadata from the second line (duration, location, client type)
    if (lines.length > 1) {
      const metadataLine = lines[1];
      const parts = metadataLine.split(' I ');
      if (parts.length >= 3) {
        project.duration = parts[0].trim();
        project.location = parts[1].trim();
        project.clientType = parts[2].trim();
      }
    }
    
    // Parse additional metadata from third line if present
    if (lines.length > 2) {
      const additionalMetadata = lines[2];
      const projectTypeMatch = additionalMetadata.match(/Project Type:\s*([^I]+)/);
      const industryMatch = additionalMetadata.match(/Industry Type:\s*([^I]+)/);
      const businessUnitMatch = additionalMetadata.match(/Business Unit:\s*(.+)/);
      
      if (projectTypeMatch) project.projectType = projectTypeMatch[1].trim();
      if (industryMatch) project.industry = industryMatch[1].trim();
      if (businessUnitMatch) project.businessUnit = businessUnitMatch[1].trim();
    }
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('### Problem:')) {
        if (currentField && fieldContent) {
          (project as any)[currentField] = fieldContent.trim();
        }
        currentField = 'problem';
        fieldContent = '';
      } else if (line.startsWith('### Action:')) {
        if (currentField && fieldContent) {
          (project as any)[currentField] = fieldContent.trim();
        }
        currentField = 'action';
        fieldContent = '';
      } else if (line.startsWith('### Result:')) {
        if (currentField && fieldContent) {
          (project as any)[currentField] = fieldContent.trim();
        }
        currentField = 'result';
        fieldContent = '';
      } else if (currentField && line && !line.startsWith('Project Type:') && !line.startsWith('###')) {
        // Continue building the current field content
        if (fieldContent) fieldContent += ' ';
        fieldContent += line;
      }
    }
    
    // Set the last field
    if (currentField && fieldContent) {
      (project as any)[currentField] = fieldContent.trim();
    }
    
    // Only add project if it has required fields
    if (project.title && project.problem && project.action && project.result) {
      projects.push(project as Project);
    }
  }
  
  return projects;
};

/**
 * Converts structured project data back to markdown format
 */
export const projectsToMarkdown = (projects: Project[]): string => {
  let markdown = '# Portfólio de Projetos\n\n';
  
  for (const project of projects) {
    markdown += `## ${project.title}\n\n`;
    markdown += `**Duração:** ${project.duration}\n`;
    markdown += `**Localização:** ${project.location}\n`;
    markdown += `**Tipo de Cliente:** ${project.clientType}\n`;
    markdown += `**Tipo de Projeto:** ${project.projectType}\n`;
    markdown += `**Indústria:** ${project.industry}\n`;
    markdown += `**Unidade de Negócio:** ${project.businessUnit}\n\n`;
    markdown += `**Problema:** ${project.problem}\n\n`;
    markdown += `**Ação:** ${project.action}\n\n`;
    markdown += `**Resultado:** ${project.result}\n\n`;
  }
  
  return markdown;
};

/**
 * Main function to translate Projects.md to Portuguese and save as JSON
 */
export const translateProjectsToPortuguese = async (
  projectsMarkdownPath: string,
  outputJsonPath: string
): Promise<void> => {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    // Read the original Projects.md file
    const markdownContent = await fs.readFile(projectsMarkdownPath, 'utf-8');
    
    // Parse projects from markdown
    const projects = parseProjectsMarkdown(markdownContent);
    console.log(`Parsed ${projects.length} projects from markdown`);
    
    // Translate each project
    const translatedProjects: Project[] = [];
    
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      console.log(`Translating project ${i + 1}/${projects.length}: ${project.title}`);
      
      const translatedProject: Project = {
        title: await translateText(project.title),
        duration: await translateText(project.duration),
        location: project.location, // Keep location as is
        clientType: await translateText(project.clientType),
        projectType: await translateText(project.projectType),
        industry: await translateText(project.industry),
        businessUnit: await translateText(project.businessUnit),
        problem: await translateText(project.problem),
        action: await translateText(project.action),
        result: await translateText(project.result),
      };
      
      translatedProjects.push(translatedProject);
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Save translated projects as JSON
    await fs.writeFile(outputJsonPath, JSON.stringify(translatedProjects, null, 2), 'utf-8');
    console.log(`Translated projects saved to ${outputJsonPath}`);
    
    // Also save as markdown for reference
    const markdownOutputPath = outputJsonPath.replace('.json', '.md');
    const translatedMarkdown = projectsToMarkdown(translatedProjects);
    await fs.writeFile(markdownOutputPath, translatedMarkdown, 'utf-8');
    console.log(`Translated markdown saved to ${markdownOutputPath}`);
    
  } catch (error) {
    console.error('Error translating projects:', error);
    throw error;
  }
};
