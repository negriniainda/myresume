'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContent } from '@/hooks/useContent';
import { useTranslation } from '@/hooks/useTranslation';
import FilteredContent from '@/components/ui/FilteredContent';
import AnimatedSection from '@/components/ui/AnimatedSection';
import AnimatedTimeline from '@/components/ui/AnimatedTimeline';
import { TextSkeleton, ExperienceSkeletonLayout } from '@/components/ui/LoadingSkeleton';
import type { ExperienceItem } from '@/types';

const Experience: React.FC = () => {
  const { resumeData, isLoading } = useContent();
  const { t } = useTranslation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // URL parameter synchronization
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const expandedParam = params.get('expanded');
    if (expandedParam) {
      setExpandedItems(new Set(expandedParam.split(',')));
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (expandedItems.size > 0) {
      params.set('expanded', Array.from(expandedItems).join(','));
    } else {
      params.delete('expanded');
    }
    
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [expandedItems]);

  // Sort options for experience
  const sortOptions = [
    {
      label: t('experience.sortByDate', 'Most Recent'),
      value: 'date',
      sortFn: (a: ExperienceItem, b: ExperienceItem) => {
        const aEnd = a.period.end === 'Present' || a.period.end === 'Atual' ? new Date().getFullYear() : parseInt(a.period.end);
        const bEnd = b.period.end === 'Present' || b.period.end === 'Atual' ? new Date().getFullYear() : parseInt(b.period.end);
        return bEnd - aEnd;
      }
    },
    {
      label: t('experience.sortByCompany', 'Company Name'),
      value: 'company',
      sortFn: (a: ExperienceItem, b: ExperienceItem) => a.company.localeCompare(b.company)
    },
    {
      label: t('experience.sortByRole', 'Role Level'),
      value: 'role',
      sortFn: (a: ExperienceItem, b: ExperienceItem) => {
        const roleOrder = { 'Executive': 5, 'Director': 4, 'Manager': 3, 'Team Lead': 2, 'Individual Contributor': 1 };
        const aLevel = roleOrder[a.roleType as keyof typeof roleOrder] || 0;
        const bLevel = roleOrder[b.roleType as keyof typeof roleOrder] || 0;
        return bLevel - aLevel;
      }
    },
    {
      label: t('experience.sortByDuration', 'Duration'),
      value: 'duration',
      sortFn: (a: ExperienceItem, b: ExperienceItem) => {
        const aDuration = (a.period.end === 'Present' || a.period.end === 'Atual' ? new Date().getFullYear() : parseInt(a.period.end)) - parseInt(a.period.start);
        const bDuration = (b.period.end === 'Present' || b.period.end === 'Atual' ? new Date().getFullYear() : parseInt(b.period.end)) - parseInt(b.period.start);
        return bDuration - aDuration;
      }
    }
  ];

  if (isLoading) {
    return (
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <TextSkeleton width="400px" height="2.5rem" className="mx-auto mb-4" />
              <TextSkeleton width="24px" height="4px" className="mx-auto mb-8" />
              <TextSkeleton width="600px" height="1rem" className="mx-auto" />
            </div>
            <ExperienceSkeletonLayout />
          </div>
        </div>
      </section>
    );
  }

  if (!resumeData?.experience || resumeData.experience.length === 0) {
    return (
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {t('experience.noData', 'No experience information available')}
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
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  const cardVariants = {
    collapsed: { height: 'auto' },
    expanded: { height: 'auto' },
  };

  const contentVariants = {
    collapsed: { opacity: 0, height: 0 },
    expanded: { 
      opacity: 1, 
      height: 'auto',
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <AnimatedSection 
      id="experience" 
      className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900"
      animation="fade-in-up"
      threshold={0.2}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              {t('experience.title', 'Professional Experience')}
            </h2>
            <div className="w-16 sm:w-20 lg:w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full mb-4 sm:mb-6 lg:mb-8"></div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
              {t('experience.subtitle', 'Explore my professional journey and key achievements across different roles and industries')}
            </p>
          </motion.div>

          {/* Filtered Content */}
          <motion.div variants={itemVariants}>
            <AnimatedTimeline
              staggerDelay={200}
              animationDuration={800}
              threshold={0.1}
              showProgressLine={true}
            >
              <FilteredContent
                data={resumeData?.experience || []}
                type="experience"
                renderItem={(item: ExperienceItem, index: number) => (
                  <div data-timeline-item className="relative">
                    <ExperienceCard
                      key={item.id}
                      item={item}
                      index={index}
                      isExpanded={expandedItems.has(item.id)}
                      onToggle={() => toggleExpanded(item.id)}
                      variants={itemVariants}
                    />
                  </div>
                )}
              renderEmpty={() => (
                <div className="text-center py-12">
                  <div className="text-gray-500 dark:text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-lg font-medium mb-2">
                      {t('experience.noResults', 'No positions match your filters')}
                    </p>
                    <p className="text-sm">
                      {t('experience.tryDifferentFilters', 'Try adjusting your filter criteria')}
                    </p>
                  </div>
                </div>
              )}
                sortOptions={sortOptions}
                itemsPerPage={5}
                className="relative"
              />
            </AnimatedTimeline>
          </motion.div>
        </motion.div>
      </div>
    </AnimatedSection>
  );
};

interface ExperienceCardProps {
  item: ExperienceItem;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  variants: any;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({
  item,
  index,
  isExpanded,
  onToggle,
  variants,
}) => {
  const { t } = useTranslation();

  const calculateDuration = (start: string, end: string) => {
    const startYear = parseInt(start);
    const endYear = end === 'Present' || end === 'Atual' ? new Date().getFullYear() : parseInt(end);
    return endYear - startYear;
  };

  const duration = calculateDuration(item.period.start, item.period.end);

  return (
    <motion.div
      variants={variants}
      className="relative flex gap-4 sm:gap-6 lg:gap-8 group"
    >
      {/* Timeline dot - Mobile optimized */}
      <div className="relative z-10 flex-shrink-0 mt-2">
        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 sm:border-4 border-white dark:border-gray-900 shadow-lg group-hover:scale-125 transition-transform duration-200"></div>
        {/* Connecting line to card */}
        <div className="absolute top-1.5 sm:top-2 left-3 sm:left-4 w-4 sm:w-6 lg:w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
      </div>

      {/* Experience card */}
      <motion.div
        layout
        className="flex-1 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow duration-300"
      >
        {/* Card header - always visible */}
        <div 
          className="p-4 sm:p-5 lg:p-6 cursor-pointer touch-manipulation"
          onClick={onToggle}
        >
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="flex-1 min-w-0 pr-2">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 leading-tight">
                {item.position}
              </h3>
              <div className="flex items-center gap-1.5 sm:gap-2 text-blue-600 dark:text-blue-400 font-semibold mb-2">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 104 0 2 2 0 00-4 0zm6 0a2 2 0 104 0 2 2 0 00-4 0z" clipRule="evenodd" />
                </svg>
                <span className="truncate text-sm sm:text-base">{item.company}</span>
              </div>
              <div className="flex flex-col xs:flex-row xs:flex-wrap items-start xs:items-center gap-2 xs:gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span className="whitespace-nowrap">{item.period.start} - {item.period.end}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="truncate">{item.location}</span>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                  {duration} {duration === 1 ? t('experience.year', 'year') : t('experience.years', 'years')}
                </div>
              </div>
            </div>
            
            {/* Expand/collapse button */}
            <motion.button
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors touch-manipulation flex-shrink-0"
              aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.button>
          </div>

          {/* Brief description - always visible */}
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Expandable content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              variants={contentVariants}
              className="border-t border-gray-100 dark:border-gray-700"
            >
              <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 lg:space-y-6">
                {/* Achievements */}
                {item.achievements && item.achievements.length > 0 && (
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t('experience.achievements', 'Key Achievements')}
                    </h4>
                    <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {item.achievements.map((achievement, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow"
                        >
                          <div className="text-center">
                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-400 mb-1 sm:mb-2">
                              {achievement.metric}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 font-medium text-xs sm:text-sm mb-1 sm:mb-2 leading-tight">
                              {achievement.description}
                            </p>
                            {achievement.impact && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                {achievement.impact}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Responsibilities */}
                {item.responsibilities && item.responsibilities.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      {t('experience.responsibilities', 'Key Responsibilities')}
                    </h4>
                    <ul className="space-y-2">
                      {item.responsibilities.map((responsibility, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 dark:text-gray-300">{responsibility}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Technologies */}
                {item.technologies && item.technologies.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      {t('experience.technologies', 'Technologies Used')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {item.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional info */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {item.teamSize && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                        </svg>
                        <span className="font-medium">{item.teamSize}</span> people
                      </div>
                    )}
                    {item.budget && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">{item.budget}</span>
                      </div>
                    )}
                    {item.companySize && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 104 0 2 2 0 00-4 0zm6 0a2 2 0 104 0 2 2 0 00-4 0z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">{item.companySize}</span> company
                      </div>
                    )}
                    {item.industry && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">{item.industry}</span>
                      </div>
                    )}
                  </div>
                  
                  {item.roleType && (
                    <div className="flex justify-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        {item.roleType}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default Experience;
