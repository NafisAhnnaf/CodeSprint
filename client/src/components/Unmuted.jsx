import React from "react";

const Muted = ({ content, style }) => {
  return <div className={`font-medium ${style} text-black`}>{content}</div>;
};

export default Muted;
