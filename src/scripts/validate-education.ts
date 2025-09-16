#!/usr/bin/env node

/**
 * Validation script for Education and Activities section
 * This script validates that the Education component meets all task requirements
 */

import fs from 'fs';
import path from 'path';

interface ValidationResult {
  passed: boolean;
  message: string;
}

class EducationValidator {
  private resumeEnPath = path.join(process.cwd(), 'src/data/resume-en.json');
  private resumePtPath = path.join(process.cwd(), 'src/data/resume-pt.json');
  private educationComponentPath = path.join(process.cwd(), 'src/components/sections/Education.tsx');
  private typesPath = path.join(process.cwd(), 'src/types/index.ts');

  async validate(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Check if education data exists and has proper structure
    results.push(await this.validateEducationData());
    
    // Check if activities data exists
    results.push(await this.validateActivitiesData());
    
    // Check if Education component exists and has proper structure
    results.push(await this.validateEducationComponent());
    
    // Check if TypeScript interfaces support certifications
    results.push(await this.validateTypeDefinitions());
    
    // Check responsive design implementation
    results.push(await this.validateResponsiveDesign());
    
    // Check visual hierarchy implementation
    results.push(await this.validateVisualHierarchy());

    return results;
  }

  private async validateEducationData(): Promise<ValidationResult> {
    try {
      const enData = JSON.parse(fs.readFileSync(this.resumeEnPath, 'utf8'));
      const ptData = JSON.parse(fs.readFileSync(this.resumePtPath, 'utf8'));

      // Check if education array exists and has entries
      if (!enData.education || !Array.isArray(enData.education) || enData.education.length === 0) {
        return { passed: false, message: 'English education data is missing or empty' };
      }

      if (!ptData.education || !Array.isArray(ptData.education) || ptData.education.length === 0) {
        return { passed: false, message: 'Portuguese education data is missing or empty' };
      }

      // Check if education entries have required fields
      const requiredFields = ['id', 'degree', 'institution', 'location', 'period'];
      for (const item of enData.education) {
        for (const field of requiredFields) {
          if (!item[field]) {
            return { passed: false, message: `Education item missing required field: ${field}` };
          }
        }
      }

      // Check if at least one item has certifications or is a certification type
      const hasCertifications = enData.education.some((item: any) => 
        item.certifications || item.type === 'certification'
      );

      if (!hasCertifications) {
        return { passed: false, message: 'No certification data found in education entries' };
      }

      return { passed: true, message: 'Education data structure is valid with institutions and certifications' };
    } catch (error) {
      return { passed: false, message: `Error validating education data: ${error}` };
    }
  }

  private async validateActivitiesData(): Promise<ValidationResult> {
    try {
      const enData = JSON.parse(fs.readFileSync(this.resumeEnPath, 'utf8'));
      const ptData = JSON.parse(fs.readFileSync(this.resumePtPath, 'utf8'));

      if (!enData.activities || !Array.isArray(enData.activities) || enData.activities.length === 0) {
        return { passed: false, message: 'English activities data is missing or empty' };
      }

      if (!ptData.activities || !Array.isArray(ptData.activities) || ptData.activities.length === 0) {
        return { passed: false, message: 'Portuguese activities data is missing or empty' };
      }

      // Check if activities contain meaningful content
      const hasVolunteerWork = enData.activities.some((activity: string) => 
        activity.toLowerCase().includes('mentor') || 
        activity.toLowerCase().includes('speaker') ||
        activity.toLowerCase().includes('contributor')
      );

      if (!hasVolunteerWork) {
        return { passed: false, message: 'Activities should include volunteer work and achievements' };
      }

      return { passed: true, message: 'Activities data includes volunteer work and achievements' };
    } catch (error) {
      return { passed: false, message: `Error validating activities data: ${error}` };
    }
  }

  private async validateEducationComponent(): Promise<ValidationResult> {
    try {
      const componentContent = fs.readFileSync(this.educationComponentPath, 'utf8');

      // Check for timeline implementation
      if (!componentContent.includes('timeline') && !componentContent.includes('Timeline')) {
        return { passed: false, message: 'Education component missing timeline implementation' };
      }

      // Check for education and activities sections
      if (!componentContent.includes('educationTitle') || !componentContent.includes('activitiesTitle')) {
        return { passed: false, message: 'Education component missing separate education and activities sections' };
      }

      // Check for certification support
      if (!componentContent.includes('certification') && !componentContent.includes('Certification')) {
        return { passed: false, message: 'Education component missing certification support' };
      }

      // Check for proper animation implementation
      if (!componentContent.includes('framer-motion') && !componentContent.includes('motion.')) {
        return { passed: false, message: 'Education component missing animation implementation' };
      }

      return { passed: true, message: 'Education component has timeline, sections, and certification support' };
    } catch (error) {
      return { passed: false, message: `Error validating Education component: ${error}` };
    }
  }

  private async validateTypeDefinitions(): Promise<ValidationResult> {
    try {
      const typesContent = fs.readFileSync(this.typesPath, 'utf8');

      // Check if EducationItem interface supports certifications
      if (!typesContent.includes('certifications?:')) {
        return { passed: false, message: 'EducationItem interface missing certifications field' };
      }

      // Check if type field exists for distinguishing degrees vs certifications
      if (!typesContent.includes('type?:')) {
        return { passed: false, message: 'EducationItem interface missing type field' };
      }

      return { passed: true, message: 'TypeScript interfaces support certifications and education types' };
    } catch (error) {
      return { passed: false, message: `Error validating type definitions: ${error}` };
    }
  }

  private async validateResponsiveDesign(): Promise<ValidationResult> {
    try {
      const componentContent = fs.readFileSync(this.educationComponentPath, 'utf8');

      // Check for responsive grid layout
      if (!componentContent.includes('grid-cols-1') || !componentContent.includes('lg:grid-cols-2')) {
        return { passed: false, message: 'Education component missing responsive grid layout' };
      }

      // Check for responsive padding and spacing
      if (!componentContent.includes('px-6') || !componentContent.includes('lg:px-8')) {
        return { passed: false, message: 'Education component missing responsive padding' };
      }

      // Check for responsive typography
      if (!componentContent.includes('text-3xl') || !componentContent.includes('md:text-4xl')) {
        return { passed: false, message: 'Education component missing responsive typography' };
      }

      return { passed: true, message: 'Education component implements responsive design' };
    } catch (error) {
      return { passed: false, message: `Error validating responsive design: ${error}` };
    }
  }

  private async validateVisualHierarchy(): Promise<ValidationResult> {
    try {
      const componentContent = fs.readFileSync(this.educationComponentPath, 'utf8');

      // Check for gradient backgrounds and visual elements
      if (!componentContent.includes('bg-gradient-to-r')) {
        return { passed: false, message: 'Education component missing gradient visual elements' };
      }

      // Check for proper card styling with shadows
      if (!componentContent.includes('shadow-lg') || !componentContent.includes('rounded-xl')) {
        return { passed: false, message: 'Education component missing proper card styling' };
      }

      // Check for timeline visual elements (dots, lines)
      if (!componentContent.includes('rounded-full') || !componentContent.includes('absolute')) {
        return { passed: false, message: 'Education component missing timeline visual elements' };
      }

      // Check for hover effects
      if (!componentContent.includes('hover:')) {
        return { passed: false, message: 'Education component missing interactive hover effects' };
      }

      return { passed: true, message: 'Education component implements proper visual hierarchy' };
    } catch (error) {
      return { passed: false, message: `Error validating visual hierarchy: ${error}` };
    }
  }
}

async function main() {
  console.log('🎓 Validating Education and Activities Section Implementation...\n');

  const validator = new EducationValidator();
  const results = await validator.validate();

  let allPassed = true;
  results.forEach((result, index) => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} Test ${index + 1}: ${result.message}`);
    if (!result.passed) {
      allPassed = false;
    }
  });

  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('🎉 All validation tests passed! Education and Activities section is complete.');
    console.log('\n✨ Task 5.4 Requirements Met:');
    console.log('   • Education timeline with institutions and certifications');
    console.log('   • Activities section with volunteer work and achievements');
    console.log('   • Responsive formatting and visual hierarchy');
    console.log('   • Proper TypeScript interfaces and component structure');
  } else {
    console.log('❌ Some validation tests failed. Please review the issues above.');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { EducationValidator };