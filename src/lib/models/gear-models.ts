GearCaseMatchSchema.index({ gearId: 1, caseId: 1 }, { unique: true });

// Create the model
export const GearCaseMatch = mongoose.model<IGearCaseMatch>('GearCaseMatch', GearCaseMatchSchema);