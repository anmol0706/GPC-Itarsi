import { useState } from 'react';

/**
 * A modal component that provides help and documentation for adding links to notices
 * 
 * @param {Object} props - Component props
 * @returns {JSX.Element} - The link help modal component
 */
const LinkHelpModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center text-xs text-primary-600 hover:text-primary-800 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        How to add links?
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm"
              aria-hidden="true"
              onClick={() => setIsOpen(false)}
            ></div>

            {/* Modal positioning trick */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Adding Links to Notices
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Step 1: Select Text</h4>
                        <p className="text-sm text-gray-500">
                          Select the text you want to turn into a link. If you don't select any text, you'll be able to enter both the link text and URL.
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Step 2: Click the Link Button</h4>
                        <p className="text-sm text-gray-500">
                          Click the link button <span className="inline-block px-1 py-0.5 bg-gray-100 rounded">🔗</span> in the toolbar.
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Step 3: Enter Link Details</h4>
                        <p className="text-sm text-gray-500">
                          In the dialog that appears, enter the link text (if not already selected) and the URL. The URL must be properly formatted (e.g., https://example.com).
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Step 4: Insert the Link</h4>
                        <p className="text-sm text-gray-500">
                          Click the "Insert" button to add the link to your notice.
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Removing Links</h4>
                        <p className="text-sm text-gray-500">
                          To remove a link, select the linked text and click the link button again, then click the "Remove Link" option.
                        </p>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100">
                        <h4 className="text-sm font-medium text-yellow-800">Important Notes</h4>
                        <ul className="mt-1 text-sm text-yellow-700 list-disc pl-5 space-y-1">
                          <li>All links are validated to ensure they are properly formatted.</li>
                          <li>External links will automatically open in a new tab.</li>
                          <li>Links are styled to be visually distinct from regular text.</li>
                          <li>Avoid linking to potentially harmful or inappropriate websites.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LinkHelpModal;
