#!/usr/bin/env tsx

import { parseProjectsMarkdown, projectsToMarkdown } from '../src/utils/translator';
import path from 'path';
import fs from 'fs/promises';

async function demoTranslation() {
  try {
    console.log('🎯 Translation Service Demo');
    console.log('==========================\n');
    
    // Read the original Projects.md file
    const projectsPath = path.join(process.cwd(), '..', 'Projects.md');
    const markdownContent = await fs.readFile(projectsPath, 'utf-8');
    
    // Parse projects from markdown
    const projects = parseProjectsMarkdown(markdownContent);
    console.log(`📊 Parsed ${projects.length} projects from Projects.md\n`);
    
    // Show first project as example
    if (projects.length > 0) {
      const firstProject = projects[0];
      console.log('📋 Example Project Structure:');
      console.log('-----------------------------');
      console.log(`Title: ${firstProject.title}`);
      console.log(`Duration: ${firstProject.duration}`);
      console.log(`Location: ${firstProject.location}`);
      console.log(`Client Type: ${firstProject.clientType}`);
      console.log(`Project Type: ${firstProject.projectType}`);
      console.log(`Industry: ${firstProject.industry}`);
      console.log(`Business Unit: ${firstProject.businessUnit}`);
      console.log(`\nProblem: ${firstProject.problem.substring(0, 100)}...`);
      console.log(`Action: ${firstProject.action.substring(0, 100)}...`);
      console.log(`Result: ${firstProject.result.substring(0, 100)}...\n`);
    }
    
    // Create mock translated project for demonstration
    const mockTranslatedProject = {
      title: 'Gestão de Projeto de Implementação de Tecnologia - CRM Salesforce para Operações de Empréstimo',
      duration: '6-12 meses',
      location: 'Los Angeles, CA',
      clientType: 'Capital de Risco ou Private Equity',
      projectType: 'Gestão de Projeto de Implementação de Tecnologia',
      industry: 'Entretenimento e Mídia',
      businessUnit: 'Gestão de Produtos',
      problem: 'A unidade de empréstimos pessoais do meu empregador sofria com dados fragmentados de clientes, processos manuais de originação de empréstimos, aprovações lentas e supervisão regulatória inconsistente - tudo limitando a escalabilidade, experiência do cliente e eficiência operacional.',
      action: 'Gerenciei a implementação do Salesforce Financial Services Cloud, desde coleta de requisitos e análise de processos até gestão de fornecedores, migração de dados, integração, testes e treinamento. Coordenei equipes de TI, compliance e operações. Orquestrei a automação de captação e aprovações de empréstimos, estabeleci pipelines de transações, incorporei pontuação de crédito por IA e personalizei dashboards.',
      result: 'Reduziu os tempos de aprovação de empréstimos de horas para menos de cinco minutos para mais de 90% das aplicações. Aumentou o volume de originação em 30%+ pós-implementação, alcançou 99,8% de precisão de dados na análise de risco e melhorou a confiabilidade da trilha de auditoria.'
    };
    
    console.log('🌍 Example Translation Output:');
    console.log('------------------------------');
    console.log(`Título: ${mockTranslatedProject.title}`);
    console.log(`Duração: ${mockTranslatedProject.duration}`);
    console.log(`Localização: ${mockTranslatedProject.location}`);
    console.log(`Tipo de Cliente: ${mockTranslatedProject.clientType}`);
    console.log(`Tipo de Projeto: ${mockTranslatedProject.projectType}`);
    console.log(`Indústria: ${mockTranslatedProject.industry}`);
    console.log(`Unidade de Negócio: ${mockTranslatedProject.businessUnit}`);
    console.log(`\nProblema: ${mockTranslatedProject.problem.substring(0, 150)}...`);
    console.log(`Ação: ${mockTranslatedProject.action.substring(0, 150)}...`);
    console.log(`Resultado: ${mockTranslatedProject.result.substring(0, 150)}...\n`);
    
    // Show what the output files would look like
    console.log('📁 Output Files:');
    console.log('----------------');
    console.log('✅ src/data/projects-pt.json - Structured JSON data in Portuguese');
    console.log('✅ src/data/projects-pt.md - Markdown format in Portuguese\n');
    
    console.log('🚀 To run actual translation:');
    console.log('-----------------------------');
    console.log('1. Set OPENAI_API_KEY environment variable');
    console.log('2. Run: npm run translate-projects');
    console.log('3. Wait ~3-5 minutes for translation to complete');
    console.log('4. Check output files in src/data/\n');
    
    console.log('💡 Translation Features:');
    console.log('------------------------');
    console.log('• Preserves technical terminology accuracy');
    console.log('• Maintains numerical values and metrics');
    console.log('• Uses industry-standard Portuguese terms');
    console.log('• Keeps proper names and locations unchanged');
    console.log('• Graceful error handling with fallbacks');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Run demo
demoTranslation();