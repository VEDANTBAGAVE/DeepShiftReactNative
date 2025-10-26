// Localization strings for Worker module
// Add Hindi (hi) and Marathi (mr) translations as needed

export const strings = {
  en: {
    // Common
    back: 'Back',
    cancel: 'Cancel',
    save: 'Save',
    submit: 'Submit',
    done: 'Done',
    required: '*',
    optional: 'Optional',

    // Attendance
    markAttendance: 'Mark Attendance',
    shiftType: 'Shift Type',
    morning: 'Morning',
    afternoon: 'Afternoon',
    night: 'Night',
    areaSection: 'Area / Section',
    present: 'Present',
    absent: 'Absent',
    confirmPresence: 'Confirm Presence',
    markAbsent: 'Mark Absent',
    remarksOptional: 'Remarks (Optional)',

    // Incident
    reportIncident: 'Report Incident',
    description: 'Description',
    severity: 'Severity',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    location: 'Location',
    attachPhoto: 'Attach Photo',
    photoRequired: 'Photo required for medium/high severity',
    linkToShift: 'Link to Shift',

    // Shift
    newShift: 'New Shift',
    shiftDetails: 'Shift Details',
    equipment: 'Equipment',
    safety: 'Safety',
    workSummary: 'Work Summary',
    attachments: 'Attachments',

    // Tasks
    viewTasks: 'View Tasks',
    tasksDone: 'Tasks Done',
    markDone: 'Mark Done',

    // Remarks
    supervisorRemarks: 'Supervisor Remarks',
    foremanRemarks: 'Foreman Remarks',
    unread: 'Unread',
    markAllRead: 'Mark All Read',

    // Settings
    settings: 'Settings',
    language: 'Language',
    clearData: 'Clear All Data',
    demoMode: 'Demo Mode',

    // Messages
    attendanceMarked: 'Attendance Marked',
    incidentReported: 'Incident Reported',
    shiftSubmitted: 'Shift Submitted',
  },
  // Placeholder for Hindi
  hi: {},
  // Placeholder for Marathi
  mr: {},
};

export const getLocalizedString = (
  key: string,
  language: 'en' | 'hi' | 'mr' = 'en',
): string => {
  const langStrings: any = strings[language];
  return langStrings[key] || strings.en[key as keyof typeof strings.en] || key;
};
