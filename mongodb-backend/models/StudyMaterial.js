const mongoose = require('mongoose');

const StudyMaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  subject: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  file: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'doc', 'ppt', 'xls', 'txt', 'image', 'other'],
    default: 'other'
  },
  cloudinaryPublicId: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StudyMaterial', StudyMaterialSchema);
