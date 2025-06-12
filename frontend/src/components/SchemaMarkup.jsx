import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { injectSchemaMarkup } from '../utils/schemaMarkup';

/**
 * Component to inject schema.org structured data into the page
 * 
 * @param {Object} props - Component props
 * @param {Object} props.schema - Schema.org JSON-LD object
 * @param {string} props.id - Unique ID for the script tag
 * @returns {null} - This component doesn't render anything
 */
const SchemaMarkup = ({ schema, id = 'schema-markup' }) => {
  useEffect(() => {
    if (schema) {
      injectSchemaMarkup(schema, id);
    }

    // Cleanup function
    return () => {
      const existingSchema = document.getElementById(id);
      if (existingSchema) {
        existingSchema.remove();
      }
    };
  }, [schema, id]);

  // This component doesn't render anything
  return null;
};

SchemaMarkup.propTypes = {
  schema: PropTypes.object.isRequired,
  id: PropTypes.string
};

export default SchemaMarkup;
