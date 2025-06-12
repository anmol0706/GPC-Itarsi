import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';

/**
 * SEO component for managing meta tags across the website
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Page title (will be appended with site name)
 * @param {string} props.description - Meta description
 * @param {string} props.keywords - Meta keywords
 * @param {string} props.ogImage - Open Graph image URL
 * @param {string} props.ogType - Open Graph type
 * @param {boolean} props.noIndex - Whether to add noindex meta tag
 * @returns {null} - This component doesn't render anything
 */
const SEO = ({ 
  title, 
  description, 
  keywords,
  ogImage,
  ogType = 'website',
  noIndex = false
}) => {
  const location = useLocation();
  const siteName = 'Government Polytechnic College Itarsi';
  const defaultDescription = 'Official website of Government Polytechnic College Itarsi offering diploma courses in engineering and technology.';
  const defaultKeywords = 'Government Polytechnic College Itarsi, GPC Itarsi, GPCI, Polytechnic College Itarsi, GPC, Polytechnic, Government Polytechnic';
  const defaultOgImage = '/images/college-og-image.jpg'; // Default OG image
  
  // Base URL for canonical and OG URLs
  const baseUrl = 'https://gpc-itarsi-9cl7.onrender.com';
  const canonicalUrl = `${baseUrl}${location.pathname}`;

  useEffect(() => {
    // Set page title with site name
    const pageTitle = title ? `${title} | ${siteName}` : siteName;
    document.title = pageTitle;

    // Set meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = description || defaultDescription;

    // Set meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = keywords || defaultKeywords;

    // Set canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;

    // Set Open Graph tags
    const ogTags = {
      'og:title': pageTitle,
      'og:description': description || defaultDescription,
      'og:url': canonicalUrl,
      'og:type': ogType,
      'og:image': ogImage ? `${baseUrl}${ogImage}` : `${baseUrl}${defaultOgImage}`,
      'og:site_name': siteName
    };

    // Set Twitter Card tags
    const twitterTags = {
      'twitter:card': 'summary_large_image',
      'twitter:title': pageTitle,
      'twitter:description': description || defaultDescription,
      'twitter:image': ogImage ? `${baseUrl}${ogImage}` : `${baseUrl}${defaultOgImage}`
    };

    // Apply OG tags
    Object.entries(ogTags).forEach(([property, content]) => {
      let metaTag = document.querySelector(`meta[property="${property}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('property', property);
        document.head.appendChild(metaTag);
      }
      metaTag.content = content;
    });

    // Apply Twitter tags
    Object.entries(twitterTags).forEach(([name, content]) => {
      let metaTag = document.querySelector(`meta[name="${name}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('name', name);
        document.head.appendChild(metaTag);
      }
      metaTag.content = content;
    });

    // Handle noindex if needed
    let robotsTag = document.querySelector('meta[name="robots"]');
    if (noIndex) {
      if (!robotsTag) {
        robotsTag = document.createElement('meta');
        robotsTag.name = 'robots';
        document.head.appendChild(robotsTag);
      }
      robotsTag.content = 'noindex, nofollow';
    } else if (robotsTag) {
      // Remove noindex if it was previously set
      robotsTag.content = 'index, follow';
    }

    // Cleanup function to remove tags when component unmounts
    return () => {
      // We don't actually remove the tags on unmount as they should persist
      // between page navigations in a SPA
    };
  }, [title, description, keywords, ogImage, ogType, noIndex, canonicalUrl]);

  // This component doesn't render anything
  return null;
};

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  ogImage: PropTypes.string,
  ogType: PropTypes.string,
  noIndex: PropTypes.bool
};

export default SEO;
