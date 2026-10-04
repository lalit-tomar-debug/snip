import mongoose from 'mongoose';

const clickSchema = new mongoose.Schema({
  shortCode: { type: String, required: true, index: true },
  browser: { type: String, default: 'Other' },
  referrer: { type: String, default: 'direct' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Click', clickSchema);
