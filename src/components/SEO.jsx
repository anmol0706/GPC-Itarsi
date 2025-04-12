import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * SEO component for dynamically updating page titles and meta tags
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description
 * @param {string} props.keywords - Page keywords
 * @param {string} props.canonicalUrl - Canonical URL
 * @param {string} props.ogImage - Open Graph image URL
 */
const SEO = ({ 
  title, 
  description, 
  keywords, 
  canonicalUrl = "https://gpc-itarsi.onrender.com", 
  ogImage = "https://gpc-itarsi-backend.onrender.com/uploads/college-logo.png" 
}) => {
  useEffect(() => {
    // Update document title
    document.title = title ? `${title} | GPC Itarsi` : 'Government Polytechnic College, Itarsi | GPC Itarsi';
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      metaDescription.setAttribute('content', description);
      document.head.appendChild(metaDescription);
    }
    
    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords);
    } else if (keywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      metaKeywords.setAttribute('content', keywords);
      document.head.appendChild(metaKeywords);
    }
    
    // Update Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', title);
    }
    
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', description);
    }
    
    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', canonicalUrl);
    }
    
    // Update OG image
    let ogImageTag = document.querySelector('meta[property="og:image"]');
    if (ogImageTag) {
      ogImageTag.setAttribute('content', ogImage);
    }
    
    // Clean up function
    return () => {
      document.title = 'Government Polytechnic College, Itarsi | GPC Itarsi';
    };
  }, [title, description, keywords, canonicalUrl, ogImage]);
  
  return null; // This component doesn't render anything
};

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  canonicalUrl: PropTypes.string,
  ogImage: PropTypes.string
};

SEO.defaultProps = {
  title: 'Government Polytechnic College, Itarsi',
  description: 'Government Polytechnic College, Itarsi (GPC Itarsi) is a premier technical institution offering quality education in engineering and technology.',
  keywords: 'GPC Itarsi, Government Polytechnic College, Itarsi, engineering college, polytechnic, technical education, Madhya Pradesh, RGPV',
  canonicalUrl: 'https://gpc-itarsi.onrender.com',
  ogImage: 'https://gpc-itarsi-backend.onrender.com/uploads/college-logo.png'
};

export default SEO;
