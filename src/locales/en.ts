export const en = {
  nav: {
    dashboard: 'Dashboard',
    vehicles: 'Vehicles',
    maintenance: 'Maintenance',
    usageLogs: 'Usage Logs',
    expenses: 'Expenses',
    reports: 'Reports',
    settings: 'Settings',
  },
  sidebar: {
    fleetTrack: 'FleetTrack',
    signOut: 'Sign Out'
  },
  header: {
    searchPlaceholder: 'Search vehicles, VIN...',
    systemOperational: 'System Operational',
    adminUser: 'Admin User',
    fleetManager: 'Fleet Manager',
    languageToggle: '中文'
  },
  dashboard: {
    title: 'Dashboard Overview',
    totalVehicles: 'Total Vehicles',
    active: 'Active',
    inMaintenance: 'In Maintenance',
    inactive: 'Inactive',
    expenseOverview: 'Expense Overview',
    recentExpenses: 'Recent Expenses',
    viewAllLogs: 'VIEW ALL LOGS',
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  },
  vehicles: {
    title: 'Vehicles',
    subtitle: 'Manage your fleet of vehicles',
    addVehicle: 'Add Vehicle',
    searchPlaceholder: 'Search vehicles...',
    filter: 'Filter',
    table: {
      vehicle: 'Vehicle',
      licensePlate: 'License Plate',
      status: 'Status',
      mileage: 'Mileage',
      department: 'Department',
      actions: 'Actions'
    },
    noResults: 'No vehicles found matching your search.',
    mi: 'mi'
  },
  maintenance: {
    title: 'Maintenance Logs',
    subtitle: 'Track and schedule vehicle maintenance.',
    logMaintenance: 'Log Maintenance',
    vehicle: 'Vehicle',
    date: 'Date',
    cost: 'Cost',
    description: 'Description'
  },
  usageLogs: {
    title: 'Usage Logs',
    subtitle: 'Track fleet activity and mileage',
    addLog: 'Add Log',
    searchPlaceholder: 'Search by driver or vehicle...',
    filter: 'Filter',
    table: {
      id: 'Log ID',
      vehicle: 'Vehicle',
      driver: 'Driver',
      date: 'Date',
      time: 'Time',
      distance: 'Distance',
      purpose: 'Purpose',
      destination: 'Destination'
    },
    noResults: 'No usage logs found matching your search.'
  },
  expenses: {
    title: 'Fleet Expenses',
    subtitle: 'Track costs and overall spending',
    addExpense: 'Add Expense',
    totalFiltered: 'Total Filtered',
    searchPlaceholder: 'Search expenses...',
    filter: 'Filter',
    table: {
      id: 'Expense ID',
      type: 'Type',
      vehicle: 'Vehicle',
      description: 'Description',
      date: 'Date',
      month: 'Month',
      amount: 'Amount'
    },
    noResults: 'No expenses found matching your search.'
  },
  reports: {
    title: 'Reports',
    subtitle: 'Generate and download fleet analytics',
    generateReport: 'Generate Report',
    recentReports: 'Recent Generated Reports',
    reportsList: [
      { 
        id: 'fleet-utilization', 
        title: 'Fleet Utilization', 
        description: 'Analyze vehicle usage, idle times, and dispatch efficiency over time.'
      },
      { 
        id: 'maintenance-costs', 
        title: 'Maintenance Costs', 
        description: 'Breakdown of service costs, parts, and labor by department or vehicle.'
      },
      { 
        id: 'expense-summary', 
        title: 'Expense Summary', 
        description: 'Aggregated view of all fleet expenses including fuel, tolls, and insurance.'
      }
    ],
    generatedText: 'Generated:',
    pdf: 'PDF',
    csv: 'CSV'
  },
  settings: {
    title: 'System Settings',
    subtitle: 'Manage your application preferences',
    profileInfo: 'Profile Info',
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    saveChanges: 'Save Changes',
    notifications: 'Notifications',
    emailAlerts: 'Email Alerts',
    emailAlertsDesc: 'Receive an email when a vehicle maintenance is due.',
    weeklyReports: 'Weekly Reports',
    weeklyReportsDesc: 'Get a weekly summary of fleet status and costs.',
    dangerZone: 'Danger Zone',
    dangerDesc: 'Permanent actions that cannot be undone.',
    clearData: 'Clear all data',
    msFormsIntegration: 'Microsoft Forms Integration',
    msFormsDesc: 'Use Power Automate to send Form data to this system.',
    webhookUrl: 'Webhook URL',
    webhookDesc: 'Configure this URL in your HTTP POST request in Power Automate:',
    copy: 'Copy',
    copied: 'Copied!'
  },
  common: {
    comingSoon: 'Coming Soon!',
    confirmDelete: 'Are you sure you want to delete this vehicle? This will remove all associated logs and cannot be undone.',
    active: 'active',
    maintenance: 'maintenance',
    inactive: 'inactive',
    completed: 'completed',
    in_progress: 'in progress',
    scheduled: 'scheduled',
    fuel: 'fuel',
    toll: 'toll',
    insurance: 'insurance',
    other: 'other'
  }
};
