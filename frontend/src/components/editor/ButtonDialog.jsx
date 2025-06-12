import { useState, useEffect } from 'react';
import { isValidUrl, ensureUrlProtocol } from '../../utils/urlUtils';

/**
 * A modal dialog for inserting button links in the rich text editor
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the dialog is open
 * @param {Function} props.onClose - Function to call when the dialog is closed
 * @param {Function} props.onInsert - Function to call when a button is inserted
 * @param {string} props.initialText - Initial text for the button
 * @param {string} props.initialUrl - Initial URL for the button
 * @returns {JSX.Element} - The button dialog component
 */
const ButtonDialog = ({ isOpen, onClose, onInsert, initialText = '', initialUrl = '' }) => {
  const [buttonText, setButtonText] = useState(initialText);
  const [buttonUrl, setButtonUrl] = useState(initialUrl);
  const [buttonStyle, setButtonStyle] = useState('primary'); // primary, secondary, accent
  const [error, setError] = useState('');
  const [isValidLink, setIsValidLink] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setButtonText(initialText);
      setButtonUrl(initialUrl);
      setButtonStyle('primary');
      setError('');
      setIsValidLink(true);
    }
  }, [isOpen, initialText, initialUrl]);

  const validateUrl = (url) => {
    if (!url.trim()) {
      setError('URL cannot be empty');
      setIsValidLink(false);
      return false;
    }

    const formattedUrl = ensureUrlProtocol(url);
    const valid = isValidUrl(formattedUrl);
    
    if (!valid) {
      setError('Please enter a valid URL (e.g., https://example.com)');
      setIsValidLink(false);
      return false;
    }

    setError('');
    setIsValidLink(true);
    return formattedUrl;
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setButtonUrl(url);
    
    // Only validate if there's content
    if (url.trim()) {
      validateUrl(url);
    } else {
      setError('');
      setIsValidLink(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validatedUrl = validateUrl(buttonUrl);
    if (!validatedUrl) return;

    // Create button HTML
    const buttonHtml = `<a href="${validatedUrl}" class="notice-button notice-button-${buttonStyle}" target="_blank" rel="noopener noreferrer">${buttonText}</a>`;
    
    onInsert(buttonHtml);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Modal positioning trick */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Insert Button
                </h3>
                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="mb-4">
                    <label htmlFor="buttonText" className="block text-sm font-medium text-gray-700">
                      Button Text
                    </label>
                    <input
                      type="text"
                      id="buttonText"
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      placeholder="Text to display on button"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="buttonUrl" className="block text-sm font-medium text-gray-700">
                      URL
                    </label>
                    <input
                      type="text"
                      id="buttonUrl"
                      className={`mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                        !isValidLink ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'focus:ring-primary-500 focus:border-primary-500'
                      }`}
                      value={buttonUrl}
                      onChange={handleUrlChange}
                      placeholder="https://example.com"
                      required
                    />
                    {error && (
                      <p className="mt-1 text-sm text-red-600">{error}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Button Style
                    </label>
                    <div className="flex space-x-4">
                      <div className="flex items-center">
                        <input
                          id="primary"
                          name="buttonStyle"
                          type="radio"
                          className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                          checked={buttonStyle === 'primary'}
                          onChange={() => setButtonStyle('primary')}
                        />
                        <label htmlFor="primary" className="ml-2 block text-sm text-gray-700">
                          Primary
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="secondary"
                          name="buttonStyle"
                          type="radio"
                          className="focus:ring-secondary-500 h-4 w-4 text-secondary-600 border-gray-300"
                          checked={buttonStyle === 'secondary'}
                          onChange={() => setButtonStyle('secondary')}
                        />
                        <label htmlFor="secondary" className="ml-2 block text-sm text-gray-700">
                          Secondary
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="accent"
                          name="buttonStyle"
                          type="radio"
                          className="focus:ring-accent-500 h-4 w-4 text-accent-600 border-gray-300"
                          checked={buttonStyle === 'accent'}
                          onChange={() => setButtonStyle('accent')}
                        />
                        <label htmlFor="accent" className="ml-2 block text-sm text-gray-700">
                          Accent
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                      disabled={!isValidLink}
                    >
                      Insert Button
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ButtonDialog;
