'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useContent } from '@/hooks/useContent';
import { useTranslation } from '@/hooks/useTranslation';
import AnimatedSection from '@/components/ui/AnimatedSection';
import type { EducationItem } from '@/types';

const Education: React.FC = () => {
  const { resumeData, isLoading } = useContent();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded-md w-64 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Education skeleton */}
              <div>
                <div className="h-6 bg-gray-300 rounded-md w-32 mb-6"></div>
                <div className="space-y-6">
                  {[1, 2].map(i => (
                    <div key={i} className="flex gap-4">
                      <div className="w-4 h-4 bg-gray-300 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-300 rounded-md w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded-md w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded-md w-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Activities skeleton */}
              <div>
                <div className="h-6 bg-gray-300 rounded-md w-32 mb-6"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-4 bg-gray-300 rounded-md w-full"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!resumeData?.education && !resumeData?.activities) {
    return (
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {t('education.noData', 'No education or activities information available')}
          </h2>
        </div>
      </section>
    );
  }

  const { education = [], activities = [] } = resumeData;

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

  return (
    <AnimatedSection 
      id="education" 
      className="py-20 bg-white dark:bg-gray-900"
      animation="fade-in-up"
      stagger={true}
      staggerDelay={150}
    >
      <div className="container mx-auto px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="max-w-6xl mx-auto"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('education.title', 'Education & Activities')}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full mb-6"></div>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('education.subtitle', 'Academic background and professional development')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Education Section */}
            {education.length > 0 && (
              <motion.div variants={itemVariants}>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                  </div>
                  {t('education.educationTitle', 'Education')}
                </h3>

                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>

                  <div className="space-y-8">
                    {education.map((item, index) => (
                      <EducationCard key={item.id} item={item} index={index} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Activities Section */}
            {activities.length > 0 && (
              <motion.div variants={itemVariants}>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                      <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                    </svg>
                  </div>
                  {t('education.activitiesTitle', 'Activities & Achievements')}
                </h3>

                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <ActivityCard key={index} activity={activity} index={index} />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatedSection>
  );
};

interface EducationCardProps {
  item: EducationItem;
  index: number;
}

const EducationCard: React.FC<EducationCardProps> = ({ item, index }) => {
  const { t } = useTranslation();

  const cardVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="relative flex gap-6 group"
    >
      {/* Timeline dot */}
      <div className="relative z-10 flex-shrink-0">
        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-4 border-white dark:border-gray-900 shadow-lg group-hover:scale-125 transition-transform duration-200"></div>
      </div>

      {/* Education card */}
      <div className={`flex-1 rounded-xl p-6 shadow-lg border hover:shadow-xl transition-shadow duration-300 ${
        item.type === 'certification' 
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' 
          : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                {item.degree}
              </h4>
              {item.type === 'certification' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {t('education.certification', 'Certification')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold mb-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                {item.type === 'certification' ? (
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                ) : (
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                )}
              </svg>
              {item.institution}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                {item.period.start} - {item.period.end}
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {item.location}
              </div>
            </div>
          </div>
        </div>

        {item.description && (
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            {item.description}
          </p>
        )}

        <div className="flex flex-wrap gap-4 text-sm">
          {item.gpa && (
            <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              GPA: {item.gpa}
            </div>
          )}
          
          {item.honors && item.honors.length > 0 && (
            <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-full">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {item.honors.join(', ')}
            </div>
          )}

          {item.certifications && item.certifications.length > 0 && (
            <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {item.certifications.join(', ')}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

interface ActivityCardProps {
  activity: string;
  index: number;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, index }) => {
  const cardVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4 border-l-4 border-green-500 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {activity}
        </p>
      </div>
    </motion.div>
  );
};

export default Education;
