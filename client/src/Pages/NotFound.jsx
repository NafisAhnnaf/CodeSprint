import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWarning } from "@fortawesome/free-solid-svg-icons";
const NotFound = () => {
  return (
    <div className="h-[75vh] flex flex-col justify-center items-center space-y-8">
      <h1 className="text-yellow-400">
        <FontAwesomeIcon icon={faWarning} />
      </h1>
      <h1>Page Not Found</h1>
    </div>
  );
};

export default NotFound;
