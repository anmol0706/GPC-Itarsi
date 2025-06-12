import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const AdmissionDetails = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    academicYear: '',
    pageTitle: '',
    pageSubtitle: '',
    pageDescription: '',
    applicationPeriod: {
      startDate: '',
      endDate: '',
      status: ''
    },
    entranceExam: {
      startDate: '',
      endDate: '',
      status: ''
    },
    classesBegin: {
      date: '',
      status: ''
    },
    counseling: {
      startDate: '',
      endDate: '',
      status: ''
    },
    results: {
      date: '',
      status: ''
    },
    additionalInfo: '',
    applyButtonText: '',
    learnMoreButtonText: '',
    applicationSteps: [],
    faqSection: {
      title: '',
      items: []
    }
  });

  useEffect(() => {
    fetchAdmissionDetails();
  }, []);

  const fetchAdmissionDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admission-details');
      if (response.data) {
        setFormData(response.data);
      }
    } catch (error) {
      console.error('Error fetching admission details:', error);
      toast.error('Failed to load admission details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle changes to application steps
  const handleStepChange = (index, field, value) => {
    setFormData(prev => {
      const updatedSteps = [...prev.applicationSteps];
      updatedSteps[index] = {
        ...updatedSteps[index],
        [field]: value
      };
      return {
        ...prev,
        applicationSteps: updatedSteps
      };
    });
  };

  // Add a new application step
  const addApplicationStep = () => {
    setFormData(prev => ({
      ...prev,
      applicationSteps: [
        ...prev.applicationSteps,
        { title: '', description: '' }
      ]
    }));
  };

  // Remove an application step
  const removeApplicationStep = (index) => {
    setFormData(prev => ({
      ...prev,
      applicationSteps: prev.applicationSteps.filter((_, i) => i !== index)
    }));
  };

  // Handle changes to FAQ items
  const handleFaqChange = (index, field, value) => {
    setFormData(prev => {
      const updatedItems = [...prev.faqSection.items];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };
      return {
        ...prev,
        faqSection: {
          ...prev.faqSection,
          items: updatedItems
        }
      };
    });
  };

  // Add a new FAQ item
  const addFaqItem = () => {
    setFormData(prev => ({
      ...prev,
      faqSection: {
        ...prev.faqSection,
        items: [
          ...prev.faqSection.items,
          { question: '', answer: '' }
        ]
      }
    }));
  };

  // Remove a FAQ item
  const removeFaqItem = (index) => {
    setFormData(prev => ({
      ...prev,
      faqSection: {
        ...prev.faqSection,
        items: prev.faqSection.items.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await axios.put('/api/admission-details', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        toast.success('Admission details updated successfully');
        setFormData(response.data);
      }
    } catch (error) {
      console.error('Error updating admission details:', error);
      toast.error('Failed to update admission details');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
        <h2 className="text-xl font-bold text-white">Manage Admission Details</h2>
        <p className="text-primary-100 text-sm">Update admission dates and information displayed on the admission page</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Academic Year */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <input
              type="text"
              name="academicYear"
              value={formData.academicYear}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., 2024-25"
              required
            />
          </div>

          {/* Page Content Section */}
          <div className="col-span-1 md:col-span-2 bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800 mb-3">Page Content Customization</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                <input
                  type="text"
                  name="pageTitle"
                  value={formData.pageTitle}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Begin Your Journey at"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Subtitle</label>
                <input
                  type="text"
                  name="pageSubtitle"
                  value={formData.pageSubtitle}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., GPC Itarsi"
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Description</label>
                <textarea
                  name="pageDescription"
                  value={formData.pageDescription}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Description text that appears on the admission page"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Button Text Customization */}
          <div className="col-span-1 md:col-span-2 bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-green-800 mb-3">Button Text Customization</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apply Button Text</label>
                <input
                  type="text"
                  name="applyButtonText"
                  value={formData.applyButtonText}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Apply Now"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Learn More Button Text</label>
                <input
                  type="text"
                  name="learnMoreButtonText"
                  value={formData.learnMoreButtonText}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Learn More"
                />
              </div>
            </div>
          </div>

          {/* Application Period */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Application Period</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  name="applicationPeriod.startDate"
                  value={formData.applicationPeriod.startDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  name="applicationPeriod.endDate"
                  value={formData.applicationPeriod.endDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="applicationPeriod.status"
                  value={formData.applicationPeriod.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Coming Soon">Coming Soon</option>
                  <option value="Currently Active">Currently Active</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Entrance Exam */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Entrance Examination</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  name="entranceExam.startDate"
                  value={formData.entranceExam.startDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  name="entranceExam.endDate"
                  value={formData.entranceExam.endDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="entranceExam.status"
                  value={formData.entranceExam.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Coming Soon">Coming Soon</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="col-span-1">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Results</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="results.date"
                  value={formData.results.date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="results.status"
                  value={formData.results.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Coming Soon">Coming Soon</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Published">Published</option>
                </select>
              </div>
            </div>
          </div>

          {/* Counseling */}
          <div className="col-span-1">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Counseling</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  name="counseling.startDate"
                  value={formData.counseling.startDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  name="counseling.endDate"
                  value={formData.counseling.endDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="counseling.status"
                  value={formData.counseling.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Coming Soon">Coming Soon</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Classes Begin */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Classes Begin</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="classesBegin.date"
                  value={formData.classesBegin.date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="classesBegin.status"
                  value={formData.classesBegin.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Coming Soon">Coming Soon</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Started">Started</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
            <textarea
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Additional information about the admission process"
            ></textarea>
          </div>

          {/* Application Steps */}
          <div className="col-span-1 md:col-span-2 bg-purple-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium text-purple-800">Application Steps</h3>
              <button
                type="button"
                onClick={addApplicationStep}
                className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                Add Step
              </button>
            </div>

            {formData.applicationSteps.map((step, index) => (
              <div key={index} className="mb-4 p-3 border border-purple-200 rounded-md bg-white">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-purple-700">Step {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeApplicationStep(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Step title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={step.description}
                      onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Step description"
                    />
                  </div>
                </div>
              </div>
            ))}
            {formData.applicationSteps.length === 0 && (
              <p className="text-sm text-gray-500 italic">No application steps added yet. Click "Add Step" to create steps.</p>
            )}
          </div>

          {/* FAQ Section */}
          <div className="col-span-1 md:col-span-2 bg-yellow-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium text-yellow-800">Frequently Asked Questions</h3>
              <button
                type="button"
                onClick={addFaqItem}
                className="px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                Add FAQ
              </button>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">FAQ Section Title</label>
              <input
                type="text"
                name="faqSection.title"
                value={formData.faqSection.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Frequently Asked Questions"
              />
            </div>

            {formData.faqSection.items.map((faq, index) => (
              <div key={index} className="mb-4 p-3 border border-yellow-200 rounded-md bg-white">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-yellow-700">FAQ {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeFaqItem(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="FAQ question"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                    <textarea
                      value={faq.answer}
                      onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="FAQ answer"
                    ></textarea>
                  </div>
                </div>
              </div>
            ))}
            {formData.faqSection.items.length === 0 && (
              <p className="text-sm text-gray-500 italic">No FAQs added yet. Click "Add FAQ" to create questions and answers.</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={fetchAdmissionDetails}
            className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            disabled={saving}
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdmissionDetails;
