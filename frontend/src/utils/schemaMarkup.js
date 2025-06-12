/**
 * Generates schema.org structured data markup for the website
 * 
 * @param {Object} options - Schema options
 * @returns {Object} - Schema.org JSON-LD object
 */
export const generateCollegeSchema = (options = {}) => {
  const {
    name = 'Government Polytechnic College Itarsi',
    description = 'Official website of Government Polytechnic College Itarsi offering diploma courses in engineering and technology.',
    url = 'https://gpc-itarsi-9cl7.onrender.com',
    logo = 'https://gpc-itarsi-9cl7.onrender.com/src/assets/college-logo.png',
    telephone = '+91 1234567890',
    email = 'contact@gpcitarsi.edu.in',
    address = 'Government Polytechnic College, Itarsi, Madhya Pradesh, India',
    foundingDate = '2011',
    sameAs = [
      'https://facebook.com/gpcitarsi',
      'https://twitter.com/gpcitarsi',
      'https://instagram.com/gpcitarsi',
      'https://youtube.com/gpcitarsi'
    ]
  } = options;

  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': url,
    name,
    description,
    url,
    logo,
    telephone,
    email,
    foundingDate,
    sameAs,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address,
      addressLocality: 'Itarsi',
      addressRegion: 'Madhya Pradesh',
      postalCode: '461111',
      addressCountry: 'IN'
    }
  };
};

/**
 * Generates schema.org structured data markup for a course
 * 
 * @param {Object} course - Course data
 * @returns {Object} - Schema.org JSON-LD object
 */
export const generateCourseSchema = (course) => {
  const {
    name,
    description,
    provider = 'Government Polytechnic College Itarsi',
    url = `https://gpc-itarsi-9cl7.onrender.com/courses`,
    courseCode,
    duration,
    startDate,
    endDate,
    image
  } = course;

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    provider: {
      '@type': 'EducationalOrganization',
      name: provider,
      sameAs: 'https://gpc-itarsi-9cl7.onrender.com'
    },
    url,
    courseCode,
    timeRequired: duration,
    startDate,
    endDate,
    image
  };
};

/**
 * Generates schema.org structured data markup for a faculty member
 * 
 * @param {Object} person - Person data
 * @returns {Object} - Schema.org JSON-LD object
 */
export const generatePersonSchema = (person) => {
  const {
    name,
    jobTitle,
    description,
    image,
    url = `https://gpc-itarsi-9cl7.onrender.com/faculty`,
    email,
    telephone,
    worksFor = 'Government Polytechnic College Itarsi'
  } = person;

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    jobTitle,
    description,
    image,
    url,
    email,
    telephone,
    worksFor: {
      '@type': 'EducationalOrganization',
      name: worksFor,
      sameAs: 'https://gpc-itarsi-9cl7.onrender.com'
    }
  };
};

/**
 * Generates schema.org structured data markup for a breadcrumb
 * 
 * @param {Array} items - Breadcrumb items
 * @returns {Object} - Schema.org JSON-LD object
 */
export const generateBreadcrumbSchema = (items) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
};

/**
 * Injects schema.org JSON-LD into the document head
 * 
 * @param {Object} schema - Schema.org JSON-LD object
 * @param {string} id - Unique ID for the script tag
 */
export const injectSchemaMarkup = (schema, id) => {
  // Remove existing schema with the same ID if it exists
  const existingSchema = document.getElementById(id);
  if (existingSchema) {
    existingSchema.remove();
  }

  // Create and inject new schema
  const script = document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  script.innerHTML = JSON.stringify(schema);
  document.head.appendChild(script);
};
