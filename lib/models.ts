import mongoose, { Schema, Document, Model } from "mongoose";
import {
  AppNotification as IAppNotification,
  AppUser as IAppUser,
  APP_PERMISSIONS,
  FormSchema as IFormSchema,
  FormSubmission as IFormSubmission,
} from "@/types";

// ── Form Schema Model ──────────────────────────────────────────────────────────

const FieldSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "email", "number", "url", "textarea", "select", "checkbox", "date", "logo"],
      required: true,
    },
    placeholder: { type: String },
    required: { type: Boolean, default: false },
    options: [{ type: String }],
    order: { type: Number, required: true },
  },
  { _id: false }
);

interface FormSchemaDocument extends Omit<IFormSchema, "_id">, Document {}

const FormSchemaSchema = new Schema<FormSchemaDocument>(
  {
    ownerId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    fields: [FieldSchema],
  },
  { timestamps: true }
);

export const FormSchemaModel: Model<FormSchemaDocument> =
  mongoose.models.FormSchema || mongoose.model<FormSchemaDocument>("FormSchema", FormSchemaSchema);

// ── Form Submission Model ──────────────────────────────────────────────────────

interface FormSubmissionDocument extends Omit<IFormSubmission, "_id">, Document {}

const FormSubmissionSchema = new Schema<FormSubmissionDocument>(
  {
    ownerId: { type: String, required: true, index: true },
    formId: { type: String, required: true, index: true },
    formName: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: { createdAt: "submittedAt", updatedAt: false } }
);

export const FormSubmissionModel: Model<FormSubmissionDocument> =
  mongoose.models.FormSubmission ||
  mongoose.model<FormSubmissionDocument>("FormSubmission", FormSubmissionSchema);

interface UserDocument extends Omit<IAppUser, "_id">, Document {}

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["super_admin", "admin", "user"], required: true, default: "user" },
    permissions: [{ type: String, enum: APP_PERMISSIONS, default: [] }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: String },
  },
  { timestamps: true }
);

export const UserModel: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema);

interface NotificationDocument extends Omit<IAppNotification, "_id">, Document {}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const NotificationModel: Model<NotificationDocument> =
  mongoose.models.Notification ||
  mongoose.model<NotificationDocument>("Notification", NotificationSchema);
