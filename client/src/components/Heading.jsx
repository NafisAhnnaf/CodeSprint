import React from "react";

const Heading = ({ content, style }) => {
  return <h1 className={`font-bold text-3xl ${style}`}>{content}</h1>;
};

export default Heading;
