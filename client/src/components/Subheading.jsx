import React from "react";

const Subheading = ({ content, style }) => {
  return <h1 className={`text-xl font-medium  ${style}`}>{content}</h1>;
};

export default Subheading;
