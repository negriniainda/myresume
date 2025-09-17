'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useContent } from '@/hooks/useContent';
import { useTranslation } from '@/hooks/useTranslation';

const Hero: React.FC = () => {
  const { resumeData, isLoading } = useContent();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-300 rounded-md w-64 mb-4"></div>
          <div className="h-6 bg-gray-300 rounded-md w-48 mb-2"></div>
          <div className="h-6 bg-gray-300 rounded-md w-56"></div>
        </div>
      </section>
    );
  }

  if (!resumeData?.personalInfo) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {t('hero.noData', 'No personal information available')}
          </h1>
        </div>
      </section>
    );
  }

  const { personalInfo } = resumeData;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <section 
      id="hero" 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          variants={floatingVariants}
          animate="animate"
          className="absolute top-20 left-10 w-72 h-72 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-30"
        />
        <motion.div
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '2s' }}
          className="absolute top-40 right-10 w-72 h-72 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-30"
        />
        <motion.div
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '4s' }}
          className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-30"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-6 lg:px-8 text-center relative z-10"
      >
        {/* Profile Image */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="relative inline-block">
            <motion.div
              className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 mx-auto mb-6 rounded-full overflow-hidden shadow-2xl ring-4 ring-white dark:ring-gray-700"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src="/negrini.jpg"
                alt={`${personalInfo.name} - Profile Photo`}
                width={192}
                height={192}
                className="w-full h-full object-cover"
                priority
              />
            </motion.div>
            {/* Decorative ring */}
            <div className="absolute inset-0 w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 mx-auto rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-20"></div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {personalInfo.name}
            </span>
          </h1>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-medium text-gray-700 dark:text-gray-300 mb-6 max-w-4xl mx-auto leading-relaxed">
            {personalInfo.title}
          </h2>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-12">
          <div className="flex flex-wrap justify-center items-center gap-6 text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm md:text-base">{personalInfo.location}</span>
            </div>
            
            {personalInfo.email && (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <a 
                  href={`mailto:${personalInfo.email}`}
                  className="text-sm md:text-base hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {personalInfo.email}
                </a>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4">
          {personalInfo.linkedin && (
            <motion.a
              href={personalInfo.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
              </svg>
              LinkedIn
            </motion.a>
          )}

          {personalInfo.github && (
            <motion.a
              href={personalInfo.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
              </svg>
              GitHub
            </motion.a>
          )}

          {personalInfo.website && (
            <motion.a
              href={personalInfo.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
              </svg>
              {t('hero.website', 'Website')}
            </motion.a>
          )}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          variants={itemVariants}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center text-gray-500 dark:text-gray-400"
          >
            <span className="text-sm mb-2">{t('hero.scrollDown', 'Scroll down')}</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
