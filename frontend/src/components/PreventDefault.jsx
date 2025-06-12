import React from 'react';

const PreventDefault = (props) => {
  const handleClick = (e) => {
    e.preventDefault();
    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <div onClick={handleClick}>
      {props.children}
    </div>
  );
};

export default PreventDefault;
