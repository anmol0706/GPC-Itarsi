import React from 'react';

const StructuredData = () => {
  const collegeData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Government Polytechnic College, Itarsi",
    "alternateName": "GPC Itarsi",
    "url": "https://gpc-itarsi.onrender.com",
    "logo": "https://gpc-itarsi-backend.onrender.com/uploads/college-logo.png",
    "sameAs": [
      "https://www.facebook.com/gpitarsi",
      "https://twitter.com/gpitarsi"
    ],
    "description": "Government Polytechnic College, Itarsi (GPC Itarsi) is a premier technical institution located in Itarsi, Madhya Pradesh. Established in 1960, the college has been at the forefront of technical education in the region for over six decades.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Hoshangabad Road",
      "addressLocality": "Itarsi",
      "addressRegion": "Madhya Pradesh",
      "postalCode": "461111",
      "addressCountry": "IN"
    },
    "telephone": "+91-07572-222034",
    "email": "info@gpitarsi.ac.in",
    "foundingDate": "1960",
    "numberOfEmployees": "60+",
    "alumni": "1000+",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Academic Programs",
      "itemListElement": [
        {
          "@type": "Course",
          "name": "Computer Science Engineering",
          "description": "Diploma in Computer Science Engineering",
          "provider": {
            "@type": "Organization",
            "name": "Government Polytechnic College, Itarsi"
          }
        },
        {
          "@type": "Course",
          "name": "Mechanical Engineering",
          "description": "Diploma in Mechanical Engineering",
          "provider": {
            "@type": "Organization",
            "name": "Government Polytechnic College, Itarsi"
          }
        },
        {
          "@type": "Course",
          "name": "Electrical Engineering",
          "description": "Diploma in Electrical Engineering",
          "provider": {
            "@type": "Organization",
            "name": "Government Polytechnic College, Itarsi"
          }
        },
        {
          "@type": "Course",
          "name": "Civil Engineering",
          "description": "Diploma in Civil Engineering",
          "provider": {
            "@type": "Organization",
            "name": "Government Polytechnic College, Itarsi"
          }
        }
      ]
    }
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(collegeData)}
    </script>
  );
};

export default StructuredData;
