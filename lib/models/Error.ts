import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IError extends Document {
    rawError: string;
    normalizedError: string;
    hash: string;
    language?: string;
    aiSolution?: {
        explanation: string;
        rootCause: string;
        steps: string[];
        fixedCode: string;
        prevention: string;
        title: string;
    };
    status: 'UNPUBLISHED' | 'PUBLISHED' | 'REJECTED';
    formattedSlug?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ErrorSchema = new Schema<IError>(
    {
        rawError: { type: String, required: true },
        normalizedError: { type: String, required: true },
        hash: { type: String, required: true, unique: true },
        language: { type: String },
        aiSolution: {
            title: String,
            explanation: String,
            rootCause: String,
            steps: [String],
            fixedCode: String,
            prevention: String,
        },
        status: {
            type: String,
            enum: ['UNPUBLISHED', 'PUBLISHED', 'REJECTED'],
            default: 'UNPUBLISHED',
        },
        formattedSlug: { type: String },
    },
    { timestamps: true }
);

// Prevent overwrite on HMR
const ErrorModel: Model<IError> =
    mongoose.models.Error || mongoose.model<IError>('Error', ErrorSchema);

export default ErrorModel;
