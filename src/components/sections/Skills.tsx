'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContent } from '@/hooks/useContent';
import { useTranslation } from '@/hooks/useTranslation';
import FilteredContent from '@/components/ui/FilteredContent';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { TextSkeleton, SkillsSkeletonLayout } from '@/components/ui/LoadingSkeleton';
import useStaggeredAnimation from '@/hooks/useStaggeredAnimation';
import type { Skill, SkillCategory } from '@/types';

const Skills: React.FC = () => {
  const { resumeData, isLoading } = useContent();
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'grid' | 'chart' | 'list'>('grid');

  // URL parameter synchronization for view mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('skillsView');
    if (viewParam && ['grid', 'chart', 'list'].includes(viewParam)) {
      setViewMode(viewParam as 'grid' | 'chart' | 'list');
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (viewMode !== 'grid') {
      params.set('skillsView', viewMode);
    } else {
      params.delete('skillsView');
    }
    
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [viewMode]);

  // Flatten skills for filtering
  const allSkills = useMemo(() => {
    if (!resumeData?.skills) return [];
    
    return resumeData.skills.flatMap(category => 
      category.skills.map(skill => ({
        ...skill,
        category: category.name
      }))
    );
  }, [resumeData?.skills]);

  // Sort options for skills
  const sortOptions = [
    {
      label: t('skills.sortByLevel', 'Proficiency Level'),
      value: 'level',
      sortFn: (a: Skill & { category: string }, b: Skill & { category: string }) => {
        const levelOrder = { 'Expert': 4, 'Advanced': 3, 'Intermediate': 2, 'Beginner': 1 };
        const aLevel = levelOrder[a.level as keyof typeof levelOrder] || 0;
        const bLevel = levelOrder[b.level as keyof typeof levelOrder] || 0;
        return bLevel - aLevel;
      }
    },
    {
      label: t('skills.sortByExperience', 'Years of Experience'),
      value: 'experience',
      sortFn: (a: Skill & { category: string }, b: Skill & { category: string }) => {
        return (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0);
      }
    },
    {
      label: t('skills.sortByName', 'Skill Name'),
      value: 'name',
      sortFn: (a: Skill & { category: string }, b: Skill & { category: string }) => {
        return a.name.localeCompare(b.name);
      }
    },
    {
      label: t('skills.sortByCategory', 'Category'),
      value: 'category',
      sortFn: (a: Skill & { category: string }, b: Skill & { category: string }) => {
        return a.category.localeCompare(b.category);
      }
    }
  ];

  if (isLoading) {
    return (
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <TextSkeleton width="300px" height="2rem" className="mx-auto mb-4" />
              <TextSkeleton width="24px" height="4px" className="mx-auto mb-6" />
              <TextSkeleton width="500px" height="1rem" className="mx-auto" />
            </div>
            <SkillsSkeletonLayout />
          </div>
        </div>
      </section>
    );
  }

  if (!resumeData?.skills || resumeData.skills.length === 0) {
    return (
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {t('skills.noData', 'No skills information available')}
          </h2>
        </div>
      </section>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  const skillVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2,
      },
    },
  };

  const { containerRef, getItemStyle } = useStaggeredAnimation({
    staggerDelay: 100,
    threshold: 0.1,
  });

  return (
    <AnimatedSection 
      id="skills" 
      className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-800"
      animation="fade-in-up"
      stagger={true}
      staggerDelay={150}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              {t('skills.title', 'Technical Skills')}
            </h2>
            <div className="w-16 sm:w-20 lg:w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full mb-4 sm:mb-6"></div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
              {t('skills.subtitle', 'Expertise and proficiency levels across various technologies and domains')}
            </p>
          </motion.div>

          {/* View Mode Toggle */}
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <div className="flex justify-center">
              <div className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl p-1.5 sm:p-2 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex rounded-md sm:rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 touch-manipulation ${
                      viewMode === 'grid'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span className="hidden xs:inline">{t('skills.gridView', 'Grid')}</span>
                  </button>
                  <button
                    onClick={() => setViewMode('chart')}
                    className={`px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 touch-manipulation ${
                      viewMode === 'chart'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    <span className="hidden xs:inline">{t('skills.chartView', 'Chart')}</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 touch-manipulation ${
                      viewMode === 'list'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="hidden xs:inline">{t('skills.listView', 'List')}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Skills Display */}
          <motion.div variants={itemVariants}>
            <AnimatePresence mode="wait">
              {viewMode === 'grid' && (
                <motion.div
                  key="skills-grid"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={containerVariants}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {resumeData?.skills?.map((category) => (
                      <SkillCategoryCard
                        key={category.name}
                        category={category}
                        variants={skillVariants}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              
              {viewMode === 'chart' && (
                <motion.div
                  key="skills-chart"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={containerVariants}
                >
                  <SkillsChart 
                    categories={resumeData?.skills || []}
                    variants={skillVariants}
                  />
                </motion.div>
              )}
              
              {viewMode === 'list' && (
                <motion.div
                  key="skills-list"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={containerVariants}
                >
                  <FilteredContent
                    data={allSkills}
                    type="skills"
                    renderItem={(skill: Skill & { category: string }, index: number) => (
                      <SkillListItem key={`${skill.category}-${skill.name}`} skill={skill} />
                    )}
                    renderEmpty={() => (
                      <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.1-5.291-2.709M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          {t('skills.noResults', 'No skills found')}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-500">
                          {t('skills.noResultsDesc', 'Try adjusting your filters or search term')}
                        </p>
                      </div>
                    )}
                    sortOptions={sortOptions}
                    itemsPerPage={20}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Skills Summary */}
          <motion.div variants={itemVariants} className="mt-16">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-6">
                  {t('skills.summary', 'Skills Overview')}
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold mb-2">
                      {resumeData?.skills?.reduce((total, cat) => total + cat.skills.length, 0) || 0}
                    </div>
                    <div className="text-sm md:text-base opacity-90">
                      {t('skills.totalSkills', 'Total Skills')}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold mb-2">
                      {resumeData?.skills?.length || 0}
                    </div>
                    <div className="text-sm md:text-base opacity-90">
                      {t('skills.categories', 'Categories')}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold mb-2">
                      {resumeData?.skills?.reduce((total, cat) => 
                        total + cat.skills.filter(skill => skill.level === 'Expert').length, 0
                      ) || 0}
                    </div>
                    <div className="text-sm md:text-base opacity-90">
                      {t('skills.expertLevel', 'Expert Level')}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold mb-2">
                      {resumeData?.skills ? Math.round(
                        resumeData.skills.reduce((total, cat) => 
                          total + cat.skills.reduce((sum, skill) => 
                            sum + (skill.yearsOfExperience || 0), 0
                          ), 0
                        ) / resumeData.skills.reduce((total, cat) => total + cat.skills.length, 0)
                      ) : 0}
                    </div>
                    <div className="text-sm md:text-base opacity-90">
                      {t('skills.avgExperience', 'Avg. Years')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </AnimatedSection>
  );
};

interface SkillCategoryCardProps {
  category: SkillCategory;
  variants: any;
}

const SkillCategoryCard: React.FC<SkillCategoryCardProps> = ({ category, variants }) => {
  const { t } = useTranslation();

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Expert':
        return 'bg-green-500';
      case 'Advanced':
        return 'bg-blue-500';
      case 'Intermediate':
        return 'bg-yellow-500';
      case 'Beginner':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getLevelWidth = (level: string) => {
    switch (level) {
      case 'Expert':
        return 'w-full';
      case 'Advanced':
        return 'w-3/4';
      case 'Intermediate':
        return 'w-1/2';
      case 'Beginner':
        return 'w-1/4';
      default:
        return 'w-1/4';
    }
  };

  return (
    <motion.div
      variants={variants}
      className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 lg:mb-6">
        <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
          {category.name}
        </h3>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {category.skills.map((skill, index) => (
          <SkillItem key={`${skill.name}-${index}`} skill={skill} />
        ))}
      </div>
    </motion.div>
  );
};

interface SkillItemProps {
  skill: Skill;
}

const SkillItem: React.FC<SkillItemProps> = ({ skill }) => {
  const { t } = useTranslation();

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Expert':
        return 'from-green-500 to-green-600';
      case 'Advanced':
        return 'from-blue-500 to-blue-600';
      case 'Intermediate':
        return 'from-yellow-500 to-yellow-600';
      case 'Beginner':
        return 'from-gray-500 to-gray-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getLevelWidth = (level: string) => {
    switch (level) {
      case 'Expert':
        return '100%';
      case 'Advanced':
        return '75%';
      case 'Intermediate':
        return '50%';
      case 'Beginner':
        return '25%';
      default:
        return '25%';
    }
  };

  const getLevelScore = (level: string) => {
    switch (level) {
      case 'Expert':
        return 100;
      case 'Advanced':
        return 75;
      case 'Intermediate':
        return 50;
      case 'Beginner':
        return 25;
      default:
        return 25;
    }
  };

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white leading-tight">
          {skill.name}
        </span>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <span className="text-xs text-gray-500 dark:text-gray-400 hidden xs:inline">
            {t(`skills.levels.${skill.level.toLowerCase()}`, skill.level)}
          </span>
          {skill.yearsOfExperience && (
            <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
              {skill.yearsOfExperience}y
            </span>
          )}
        </div>
      </div>
      
      <div className="relative">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
          <motion.div
            className={`h-1.5 sm:h-2 bg-gradient-to-r ${getLevelColor(skill.level)} rounded-full`}
            initial={{ width: 0 }}
            whileInView={{ width: getLevelWidth(skill.level) }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
};

// Skills Chart View Component
interface SkillsChartProps {
  categories: SkillCategory[];
  variants: any;
}

const SkillsChart: React.FC<SkillsChartProps> = ({ categories, variants }) => {
  const { t } = useTranslation();

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Expert':
        return 'bg-green-500';
      case 'Advanced':
        return 'bg-blue-500';
      case 'Intermediate':
        return 'bg-yellow-500';
      case 'Beginner':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getLevelHeight = (level: string) => {
    switch (level) {
      case 'Expert':
        return 'h-20';
      case 'Advanced':
        return 'h-16';
      case 'Intermediate':
        return 'h-12';
      case 'Beginner':
        return 'h-8';
      default:
        return 'h-8';
    }
  };

  // Flatten all skills for chart view
  const allSkills = categories.flatMap(cat => 
    cat.skills.map(skill => ({ ...skill, category: cat.name }))
  );

  return (
    <motion.div variants={variants} className="space-y-8">
      {categories.map((category) => (
        <div key={category.name} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            {category.name}
          </h3>
          
          <div className="flex items-end justify-center gap-4 h-32">
            {category.skills.map((skill, index) => (
              <motion.div
                key={skill.name}
                className="flex flex-col items-center gap-2 group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="relative">
                  <motion.div
                    className={`w-12 ${getLevelHeight(skill.level)} ${getLevelColor(skill.level)} rounded-t-lg relative overflow-hidden`}
                    initial={{ height: 0 }}
                    whileInView={{ height: 'auto' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </motion.div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                      <div className="font-medium">{skill.name}</div>
                      <div className="text-gray-300">{skill.level}</div>
                      {skill.yearsOfExperience && (
                        <div className="text-gray-300">{skill.yearsOfExperience} years</div>
                      )}
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
                  </div>
                </div>
                
                <div className="text-xs text-center text-gray-600 dark:text-gray-400 max-w-16 leading-tight">
                  {skill.name.length > 8 ? `${skill.name.substring(0, 8)}...` : skill.name}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
};

// Skill List Item Component
interface SkillListItemProps {
  skill: Skill & { category: string };
}

const SkillListItem: React.FC<SkillListItemProps> = ({ skill }) => {
  const { t } = useTranslation();

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Expert':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'Advanced':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'Intermediate':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'Beginner':
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Expert':
        return '🏆';
      case 'Advanced':
        return '⭐';
      case 'Intermediate':
        return '📈';
      case 'Beginner':
        return '🌱';
      default:
        return '🌱';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-2xl">{getLevelIcon(skill.level)}</div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {skill.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {skill.category}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {skill.yearsOfExperience && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">{skill.yearsOfExperience}</span> years
            </div>
          )}
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(skill.level)}`}>
            {t(`skills.levels.${skill.level.toLowerCase()}`, skill.level)}
          </span>
        </div>
      </div>
    </div>
  );
};

// Skills List View Component
interface SkillsListProps {
  categories: SkillCategory[];
  variants: any;
}

const SkillsList: React.FC<SkillsListProps> = ({ categories, variants }) => {
  const { t } = useTranslation();

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Expert':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'Advanced':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'Intermediate':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'Beginner':
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Expert':
        return '🏆';
      case 'Advanced':
        return '⭐';
      case 'Intermediate':
        return '📈';
      case 'Beginner':
        return '🌱';
      default:
        return '🌱';
    }
  };

  // Flatten all skills and sort by level and experience
  const allSkills = categories.flatMap(cat => 
    cat.skills.map(skill => ({ ...skill, category: cat.name }))
  ).sort((a, b) => {
    const levelOrder = { 'Expert': 4, 'Advanced': 3, 'Intermediate': 2, 'Beginner': 1 };
    const levelDiff = (levelOrder[b.level as keyof typeof levelOrder] || 0) - (levelOrder[a.level as keyof typeof levelOrder] || 0);
    if (levelDiff !== 0) return levelDiff;
    return (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0);
  });

  return (
    <motion.div variants={variants} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {t('skills.allSkillsList', 'All Skills')} ({allSkills.length})
        </h3>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {allSkills.map((skill, index) => (
          <motion.div
            key={`${skill.category}-${skill.name}`}
            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-2xl">{getLevelIcon(skill.level)}</div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {skill.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {skill.category}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {skill.yearsOfExperience && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{skill.yearsOfExperience}</span> years
                  </div>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(skill.level)}`}>
                  {t(`skills.levels.${skill.level.toLowerCase()}`, skill.level)}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Skills;
