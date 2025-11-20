import mongoose, { Schema, model, models } from 'mongoose';

export interface ISettings {
  _id: string;
  heroBannerUrl?: string;
  heroBannerPublicId?: string;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>({
  heroBannerUrl: {
    type: String,
    default: '',
  },
  heroBannerPublicId: {
    type: String,
    default: '',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default models.Settings || model<ISettings>('Settings', SettingsSchema);
