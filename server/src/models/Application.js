import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  applicationId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    match: [/^[A-Z0-9]{4}$/, 'Application ID must be a unique 4-character alphanumeric string (XXXX)']
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  cvUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Shortlisted', 'Rejected'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000
  }
}, {
  timestamps: true,
  id: false
});

const Application = mongoose.model('Application', applicationSchema);
export default Application;
