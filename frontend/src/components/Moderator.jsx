import React from 'react';

const Moderator = (props) => {
  return <div className={`moderator-component ${props.className || ''}`}>{props.children}</div>;
};

export default Moderator;
