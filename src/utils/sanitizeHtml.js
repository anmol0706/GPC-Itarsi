/**
 * A simple HTML sanitizer to prevent XSS attacks
 * This function allows only a limited set of HTML tags and attributes
 * 
 * @param {string} html - The HTML string to sanitize
 * @returns {string} - The sanitized HTML string
 */
const sanitizeHtml = (html) => {
  if (!html) return '';
  
  // Convert to string if not already
  const htmlString = String(html);
  
  // Define allowed tags and attributes
  const allowedTags = ['a', 'b', 'i', 'strong', 'em', 'p', 'br', 'ul', 'ol', 'li'];
  const allowedAttributes = {
    'a': ['href', 'target', 'rel']
  };
  
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
    
    // If it's an anchor tag, ensure it has safe attributes
    if (node.tagName.toLowerCase() === 'a') {
      // Add target="_blank" and rel="noopener noreferrer" for external links
      if (node.hasAttribute('href')) {
        const href = node.getAttribute('href');
        if (href.startsWith('http')) {
          node.setAttribute('target', '_blank');
          node.setAttribute('rel', 'noopener noreferrer');
        }
      }
    }
    
    // Clean all child nodes recursively
    [...node.childNodes].forEach(cleanNode);
  };
  
  // Clean all nodes in the temporary element
  [...tempElement.childNodes].forEach(cleanNode);
  
  // Return the sanitized HTML
  return tempElement.innerHTML;
};

export default sanitizeHtml;
