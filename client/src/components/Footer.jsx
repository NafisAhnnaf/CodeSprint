import { useState } from "react";

const Footer = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <footer className="relative text-center text-sm text-white py-4">
      <div className="space-y-1">
        <p>© 2025 CodeSprint. All rights reserved.</p>
        <button
          onClick={() => setShowModal(true)}
          className="text-blue-500 underline"
        >
          Privacy Policy
        </button>
        <p>Designed & Developed by Team Dhongorsho © 2025</p>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.4)]">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-2">Privacy Policy</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Unauthorized copying, distribution, or use of this application or
              its components is strictly prohibited. This software is licensed
              to Team Dhongorsho and intended for internal use only.
            </p>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
