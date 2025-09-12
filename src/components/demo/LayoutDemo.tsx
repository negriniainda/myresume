import React from 'react';
import { Layout } from '@/components/layout';

const LayoutDemo: React.FC = () => {
  return (
    <Layout>
      <div id="hero" className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Marcelo Negrini</h1>
          <p className="text-xl text-gray-600">Technology Leader & AI Expert</p>
        </div>
      </div>
      
      <div id="summary" className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Professional Summary</h2>
          <p className="text-lg text-gray-600">15+ years of experience in technology leadership</p>
        </div>
      </div>
      
      <div id="experience" className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Experience</h2>
          <p className="text-lg text-gray-600">Extensive background in AI and digital transformation</p>
        </div>
      </div>
      
      <div id="education" className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Education</h2>
          <p className="text-lg text-gray-600">Academic background and certifications</p>
        </div>
      </div>
      
      <div id="skills" className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Skills</h2>
          <p className="text-lg text-gray-600">Technical expertise and competencies</p>
        </div>
      </div>
      
      <div id="projects" className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Projects</h2>
          <p className="text-lg text-gray-600">Portfolio of successful implementations</p>
        </div>
      </div>
    </Layout>
  );
};

export default LayoutDemo;