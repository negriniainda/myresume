'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useContent } from '@/hooks/useContent';
import { useTranslation } from '@/hooks/useTranslation';
import AnimatedSection from '@/components/ui/AnimatedSection';

const Summary: React.FC = () => {
  const { resumeData, isLoading } = useContent();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded-md w-64 mx-auto mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded-md w-full"></div>
              <div className="h-4 bg-gray-300 rounded-md w-5/6"></div>
              <div className="h-4 bg-gray-300 rounded-md w-4/5"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!resumeData?.summary) {
    return (
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {t('summary.noData', 'No summary information available')}
          </h2>
        </div>
      </section>
    );
  }

  const { summary, objective } = resumeData;

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

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <AnimatedSection 
      id="summary" 
      className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
      animation="fade-in-up"
      stagger={true}
      staggerDelay={100}
    >
      <div className="container mx-auto px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('summary.title', summary.title || 'Professional Summary')}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
          </motion.div>

          {/* Objective Section */}
          {objective && (
            <motion.div variants={itemVariants} className="mb-12">
              <motion.div
                variants={cardVariants}
                whileHover="hover"
                className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      {t('summary.objective', 'Objective')}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {objective}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Key Qualifications */}
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">
              {t('summary.keyQualifications', 'Key Qualifications')}
            </h3>
            
            <div className="grid gap-6 md:grid-cols-2">
              {summary.items.map((item, index) => (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  whileHover="hover"
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 group"
                  data-stagger-item
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {item}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Achievement Highlights */}
          <motion.div variants={itemVariants} className="mt-16">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-6">
                  {t('summary.highlights', 'Career Highlights')}
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <motion.div
                    variants={itemVariants}
                    className="text-center"
                  >
                    <div className="text-3xl md:text-4xl font-bold mb-2">15+</div>
                    <div className="text-sm md:text-base opacity-90">
                      {t('summary.yearsExperience', 'Years Experience')}
                    </div>
                  </motion.div>
                  
                  <motion.div
                    variants={itemVariants}
                    className="text-center"
                  >
                    <div className="text-3xl md:text-4xl font-bold mb-2">50+</div>
                    <div className="text-sm md:text-base opacity-90">
                      {t('summary.projectsCompleted', 'Projects Completed')}
                    </div>
                  </motion.div>
                  
                  <motion.div
                    variants={itemVariants}
                    className="text-center"
                  >
                    <div className="text-3xl md:text-4xl font-bold mb-2">10+</div>
                    <div className="text-sm md:text-base opacity-90">
                      {t('summary.technologiesMastered', 'Technologies Mastered')}
                    </div>
                  </motion.div>
                  
                  <motion.div
                    variants={itemVariants}
                    className="text-center"
                  >
                    <div className="text-3xl md:text-4xl font-bold mb-2">5+</div>
                    <div className="text-sm md:text-base opacity-90">
                      {t('summary.industriesServed', 'Industries Served')}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </AnimatedSection>
  );
};

export default Summary;
