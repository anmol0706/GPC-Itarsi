import React from 'react';
import PropTypes from 'prop-types';
import sanitizeHtml from '../../utils/sanitizeHtml';
import withClickableLinks from './withClickableLinks';

/**
 * A simple component for rendering notice content
 * 
 * @param {Object} props - Component props
 * @param {string} props.content - The HTML content to render
 * @param {boolean} props.darkTheme - Whether to use dark theme styling
 * @param {number} props.maxLength - Maximum length of content before truncating
 * @param {boolean} props.truncate - Whether to truncate content
 * @returns {JSX.Element} - The rendered component
 */
const NoticeContentBase = ({ 
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
    <div className={`notice-content ${darkTheme ? 'dark-theme' : ''}`}>
      <div 
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        className="break-words"
      />
    </div>
  );
};

NoticeContentBase.propTypes = {
  content: PropTypes.string.isRequired,
  darkTheme: PropTypes.bool,
  maxLength: PropTypes.number,
  truncate: PropTypes.bool
};

// Enhance the component with clickable links
const EnhancedNoticeContent = withClickableLinks(NoticeContentBase);

export default EnhancedNoticeContent;
