import React from 'react';
import Head from 'next/head';
import useLanguage from '@/hooks/useLanguage';
import StructuredData from './StructuredData';

interface SEOOptimizedProps {
    title?: string;
    description?: string;
    canonical?: string;
    noindex?: boolean;
    children?: React.ReactNode;
}

const SEOOptimized: React.FC<SEOOptimizedProps> = ({
    title,
    description,
    canonical,
    noindex = false,
    children
}) => {
    const { language } = useLanguage();

    const defaultTitle = language === 'pt'
        ? 'Marcelo Negrini - Currículo Profissional'
        : 'Marcelo Negrini - Professional Resume';

    const defaultDescription = language === 'pt'
        ? 'Especialista em liderança de IA e tecnologia - Currículo interativo bilíngue apresentando experiência profissional em transformação digital, liderança de equipes e inovação estratégica.'
        : 'AI & Technology Leadership Expert - Interactive bilingual resume showcasing professional experience in digital transformation, team leadership, and strategic innovation.';

    const pageTitle = title || defaultTitle;
    const pageDescription = description || defaultDescription;
    const pageCanonical = canonical || `https://marcelonegrini.com${language === 'pt' ? '/pt' : ''}`;

    return (
        <>
            <Head>
                {/* Basic SEO */}
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={pageCanonical} />

                {/* Language alternates */}
                <link rel="alternate" hrefLang="en" href="https://marcelonegrini.com/en" />
                <link rel="alternate" hrefLang="pt" href="https://marcelonegrini.com/pt" />
                <link rel="alternate" hrefLang="x-default" href="https://marcelonegrini.com/" />

                {/* Robots */}
                {noindex && <meta name="robots" content="noindex,nofollow" />}

                {/* Open Graph */}
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:url" content={pageCanonical} />
                <meta property="og:locale" content={language === 'pt' ? 'pt_BR' : 'en_US'} />
                <meta property="og:locale:alternate" content={language === 'pt' ? 'en_US' : 'pt_BR'} />

                {/* Twitter */}
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />

                {/* Additional SEO meta tags */}
                <meta name="author" content="Marcelo Negrini" />
                <meta name="creator" content="Marcelo Negrini" />
                <meta name="publisher" content="Marcelo Negrini" />

                {/* Professional keywords */}
                <meta name="keywords" content={
                    language === 'pt'
                        ? 'Liderança em IA, Executivo de Tecnologia, Transformação Digital, Liderança de Equipes, Inovação Estratégica, Profissional Bilíngue, Currículo, Portfólio'
                        : 'AI Leadership, Technology Executive, Digital Transformation, Team Leadership, Strategic Innovation, Bilingual Professional, Resume, Portfolio'
                } />

                {/* Geo tags */}
                <meta name="geo.region" content="BR" />
                <meta name="geo.country" content="Brazil" />

                {/* Professional classification */}
                <meta name="classification" content="Professional Resume" />
                <meta name="category" content="Technology Leadership" />
                <meta name="coverage" content="Worldwide" />
                <meta name="distribution" content="Global" />
                <meta name="rating" content="General" />
            </Head>

            {/* Structured Data */}
            <StructuredData type="person" />
            <StructuredData type="website" />
            <StructuredData type="breadcrumb" />

            {/* Content with proper semantic structure */}
            <div className="seo-optimized-content">
                {children}
            </div>
        </>
    );
};

export default SEOOptimized;