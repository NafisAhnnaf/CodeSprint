import React from "react";

const Muted = ({ content, style }) => {
  return <div className={`text-gray-600 ${style}`}>{content}</div>;
};

export default Muted;
