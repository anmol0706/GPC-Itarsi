import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import sanitizeHtml from '../../utils/sanitizeHtml';
import '../../styles/notice-buttons.css';

/**
 * A component for rendering notice content with properly functioning links
 * This component uses a ref and event delegation to handle link clicks
 *
 * @param {Object} props - Component props
 * @param {string} props.content - The HTML content to render
 * @param {boolean} props.darkTheme - Whether to use dark theme styling
 * @param {number} props.maxLength - Maximum length of content before truncating
 * @param {boolean} props.truncate - Whether to truncate content
 * @returns {JSX.Element} - The rendered component
 */
const NoticeContent = ({
  content,
  darkTheme = false,
  maxLength = 150,
  truncate = false
}) => {
  const contentRef = useRef(null);

  // Process content for display
  const processedContent = truncate && content.length > maxLength
    ? `${content.substring(0, maxLength)}...`
    : content;

  // Sanitize the HTML content
  const sanitizedHtml = sanitizeHtml(processedContent);

  // Set up event delegation for handling link clicks
  useEffect(() => {
    const handleLinkClick = (event) => {
      // Find if the click was on a link or inside a link
      let target = event.target;
      while (target && target !== contentRef.current) {
        if (target.tagName && target.tagName.toLowerCase() === 'a') {
          // This is a link - handle the click
          event.stopPropagation();

          // If it's an external link (has target="_blank"), let the browser handle it
          if (target.getAttribute('target') === '_blank') {
            return true; // Allow default behavior
          }

          // For internal links or links without target, we can add custom handling here
          // For example, you could use React Router for internal navigation

          return true; // Allow default behavior for now
        }
        target = target.parentNode;
      }

      // Not a link click, no special handling needed
      return true;
    };

    // Add event listener to the content container
    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('click', handleLinkClick);
    }

    // Clean up event listener on unmount
    return () => {
      if (contentElement) {
        contentElement.removeEventListener('click', handleLinkClick);
      }
    };
  }, [sanitizedHtml]); // Re-run when sanitized content changes

  return (
    <div
      ref={contentRef}
      className={`notice-content ${darkTheme ? 'dark-theme' : ''}`}
    >
      <div
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        className="break-words"
      />
    </div>
  );
};

NoticeContent.propTypes = {
  content: PropTypes.string.isRequired,
  darkTheme: PropTypes.bool,
  maxLength: PropTypes.number,
  truncate: PropTypes.bool
};

export default NoticeContent;
