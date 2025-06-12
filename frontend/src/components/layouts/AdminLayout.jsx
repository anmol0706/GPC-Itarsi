import React from 'react';
import PropTypes from 'prop-types';

/**
 * AdminLayout component provides a consistent layout wrapper for admin pages
 * It simply renders the children components without additional layout elements
 * since the layout is already handled by the Dashboard component
 */
const AdminLayout = ({ children }) => {
  return <>{children}</>;
};

AdminLayout.propTypes = {
  children: PropTypes.node.isRequired
};

export default AdminLayout;
