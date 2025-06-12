/**
 * A simple HTML sanitizer to prevent XSS attacks
 * This function allows only a limited set of HTML tags and attributes
 * and ensures links are properly formatted and secure
 *
 * @param {string} html - The HTML string to sanitize
 * @returns {string} - The sanitized HTML string
 */
const sanitizeHtml = (html) => {
  if (!html) return '';

  // Convert to string if not already
  const htmlString = String(html);

  // Define allowed tags and attributes
  const allowedTags = ['a', 'b', 'i', 'strong', 'em', 'p', 'br', 'ul', 'ol', 'li', 'span', 'button'];
  const allowedAttributes = {
    'a': ['href', 'target', 'rel', 'class', 'style'],
    'span': ['class', 'style'],
    'button': ['class', 'style', 'type']
  };

  // URL validation regex pattern
  const validUrlPattern = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/i;

  try {
    // Create a temporary DOM element to parse the HTML
    const tempElement = document.createElement('div');
    tempElement.innerHTML = htmlString;

    // Function to clean a node
    const cleanNode = (node) => {
      // If it's not an element node, return as is
      if (node.nodeType !== 1) return;

      // Check if the tag is allowed
      if (!allowedTags.includes(node.tagName.toLowerCase())) {
        // Replace with its text content
        const text = document.createTextNode(node.textContent);
        node.parentNode.replaceChild(text, node);
        return;
      }

      // Remove all attributes except allowed ones
      const attributes = [...node.attributes];
      attributes.forEach(attr => {
        const tagName = node.tagName.toLowerCase();
        const attrName = attr.name.toLowerCase();

        // Check if this attribute is allowed for this tag
        const isAllowed = allowedAttributes[tagName] &&
                          allowedAttributes[tagName].includes(attrName);

        if (!isAllowed) {
          node.removeAttribute(attr.name);
        }
      });

      // If it's an anchor tag, ensure it has safe attributes and proper styling
      if (node.tagName.toLowerCase() === 'a') {
        // Make sure the href attribute exists and is properly formatted
        if (node.hasAttribute('href')) {
          let href = node.getAttribute('href');

          // Ensure href is not empty
          if (!href.trim()) {
            node.setAttribute('href', '#');
          } else {
            // Validate URL format
            if (!href.startsWith('#')) { // Skip validation for anchor links
              // Add protocol if missing
              if (!/^(?:f|ht)tps?:\/\//i.test(href)) {
                href = 'https://' + href;
                node.setAttribute('href', href);
              }

              // Validate URL with regex
              if (!validUrlPattern.test(href)) {
                // If URL is invalid, replace with # to prevent malicious links
                console.warn('Invalid URL detected and sanitized:', href);
                node.setAttribute('href', '#');
                node.setAttribute('title', 'Invalid URL');
                node.classList.add('invalid-link');
              }
            }
          }

          // Add target="_blank" and rel="noopener noreferrer" for external links
          if (href.startsWith('http')) {
            node.setAttribute('target', '_blank');
            node.setAttribute('rel', 'noopener noreferrer');

            // Add class for external links if not already present
            if (!node.classList.contains('external-link')) {
              node.classList.add('external-link');
            }
          }

          // Add important-link class for important links if they contain specific keywords
          const linkText = node.textContent.toLowerCase();
          if (linkText.includes('important') || linkText.includes('urgent') ||
              linkText.includes('required') || linkText.includes('deadline')) {
            node.classList.add('important-link');
          }

          // Ensure links have proper styling inline to override any potential CSS conflicts
          node.style.color = '#0062f5';
          node.style.textDecoration = 'none';
          node.style.fontWeight = '600';
          node.style.backgroundColor = 'rgba(26, 117, 255, 0.1)';
          node.style.borderRadius = '3px';
          node.style.padding = '0 2px';
          node.style.borderBottom = '1px solid #1a75ff';
          node.style.cursor = 'pointer';

          // No need to add onclick attribute as we'll handle clicks with event delegation
        } else {
          // If no href, add a default one
          node.setAttribute('href', '#');
        }
      }

      // Clean all child nodes recursively
      if (node.childNodes && node.childNodes.length > 0) {
        [...node.childNodes].forEach(cleanNode);
      }
    };

    // Clean all nodes in the temporary element
    if (tempElement.childNodes && tempElement.childNodes.length > 0) {
      [...tempElement.childNodes].forEach(cleanNode);
    }

    // Return the sanitized HTML
    return tempElement.innerHTML;
  } catch (error) {
    console.error('Error in sanitizeHtml:', error);
    // Return a safe version of the HTML if an error occurs
    return htmlString.replace(/<[^>]*>/g, '');
  }
};

export default sanitizeHtml;
