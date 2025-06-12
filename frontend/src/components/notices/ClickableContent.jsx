import React from 'react';
import PropTypes from 'prop-types';
import sanitizeHtml from '../../utils/sanitizeHtml';
import '../../styles/clickable-links.css';

/**
 * A component for rendering content with clickable links using CSS-only approach
 * This component doesn't rely on event.stopPropagation() and uses CSS to ensure links are clickable
 * 
 * @param {Object} props - Component props
 * @param {string} props.content - The HTML content to render
 * @param {boolean} props.darkTheme - Whether to use dark theme styling
 * @param {number} props.maxLength - Maximum length of content before truncating
 * @param {boolean} props.truncate - Whether to truncate content
 * @returns {JSX.Element} - The rendered component
 */
const ClickableContent = ({ 
  content, 
  darkTheme = false, 
  maxLength = 150,
  truncate = false
}) => {
  // Process content for display
  const processedContent = truncate && content.length > maxLength
    ? `${content.substring(0, maxLength)}...`
    : content;

  // Sanitize the HTML content
  const sanitizedHtml = sanitizeHtml(processedContent);

  return (
    <div className={`clickable-content-container ${darkTheme ? 'dark-theme' : ''}`}>
      <div 
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        className="break-words"
      />
    </div>
  );
};

ClickableContent.propTypes = {
  content: PropTypes.string.isRequired,
  darkTheme: PropTypes.bool,
  maxLength: PropTypes.number,
  truncate: PropTypes.bool
};

export default ClickableContent;
