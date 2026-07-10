import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    destination: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    normalizedDestination: {
      type: String,
      required: true,
      trim: true
    },
    normalizedName: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

projectSchema.index({ normalizedDestination: 1, normalizedName: 1 }, { unique: true });

projectSchema.pre('validate', function normalizeProjectName(next) {
  const safeDestination = String(this.destination || '').trim();
  const safeName = String(this.name || '').trim();
  this.destination = safeDestination;
  this.name = safeName;
  this.normalizedDestination = safeDestination.toLowerCase();
  this.normalizedName = safeName.toLowerCase();
  next();
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
