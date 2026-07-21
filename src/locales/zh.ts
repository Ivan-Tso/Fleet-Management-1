export const zh = {
  nav: {
    dashboard: '仪表盘',
    vehicles: '车辆管理',
    maintenance: '维保记录',
    usageLogs: '使用日志',
    expenses: '费用支出',
    reports: '数据报告',
    settings: '系统设置',
  },
  sidebar: {
    fleetTrack: '车队管理',
    signOut: '退出登录'
  },
  header: {
    searchPlaceholder: '搜索车辆、车架号...',
    systemOperational: '系统运行正常',
    adminUser: '管理员',
    fleetManager: '车队经理',
    languageToggle: 'English'
  },
  dashboard: {
    title: '仪表盘概览',
    totalVehicles: '总车辆数',
    active: '运行中',
    inMaintenance: '维保中',
    inactive: '已停用',
    maintenanceCosts: '维保成本',
    recentPriority: '近期重点事项',
    viewAllLogs: '查看所有日志',
    months: ['一月', '二月', '三月', '四月', '五月', '六月']
  },
  vehicles: {
    title: '车辆管理',
    subtitle: '管理您的车队车辆',
    addVehicle: '添加车辆',
    searchPlaceholder: '搜索车辆...',
    filter: '筛选',
    table: {
      vehicle: '车辆',
      licensePlate: '车牌号',
      status: '状态',
      mileage: '里程',
      department: '部门',
      actions: '操作'
    },
    noResults: '未找到符合条件的车辆。',
    mi: '英里'
  },
  maintenance: {
    title: '维保记录',
    subtitle: '追踪和安排车辆维保',
    logMaintenance: '记录维保',
    vehicle: '车辆',
    date: '日期',
    cost: '费用',
    description: '描述'
  },
  usageLogs: {
    title: '使用日志',
    subtitle: '追踪车队活动和里程',
    addLog: '添加日志',
    searchPlaceholder: '按司机或车辆搜索...',
    filter: '筛选',
    table: {
      id: '日志 ID',
      vehicle: '车辆',
      driver: '司机',
      date: '日期',
      time: '时间',
      distance: '距离',
      purpose: '目的',
      destination: '目的地'
    },
    noResults: '未找到符合条件的使用日志。'
  },
  expenses: {
    title: '车队费用',
    subtitle: '追踪成本和总体支出',
    addExpense: '添加费用',
    totalFiltered: '筛选总计',
    searchPlaceholder: '搜索费用...',
    filter: '筛选',
    table: {
      id: '费用 ID',
      type: '类型',
      vehicle: '车辆',
      description: '描述',
      date: '日期',
      month: '月份',
      amount: '金额'
    },
    noResults: '未找到符合条件的费用。'
  },
  reports: {
    title: '数据报告',
    subtitle: '生成并下载车队分析报告',
    generateReport: '生成报告',
    recentReports: '最近生成的报告',
    reportsList: [
      { 
        id: 'fleet-utilization', 
        title: '车队利用率', 
        description: '分析车辆使用情况、空闲时间及调度效率。'
      },
      { 
        id: 'maintenance-costs', 
        title: '维保成本', 
        description: '按部门或车辆划分的服务、零部件和人工成本明细。'
      },
      { 
        id: 'expense-summary', 
        title: '费用汇总', 
        description: '所有车队费用的汇总视图，包括燃油、过路费和保险。'
      }
    ],
    generatedText: '生成日期:',
    pdf: 'PDF',
    csv: 'CSV'
  },
  settings: {
    title: '系统设置',
    subtitle: '管理您的应用偏好',
    profileInfo: '个人信息',
    fullName: '姓名',
    emailAddress: '邮箱地址',
    saveChanges: '保存更改',
    notifications: '通知设置',
    emailAlerts: '邮件提醒',
    emailAlertsDesc: '车辆需要维保时接收邮件。',
    weeklyReports: '每周报告',
    weeklyReportsDesc: '获取车队状态和成本的每周汇总。',
    dangerZone: '危险区域',
    dangerDesc: '不可逆的多项永久操作。',
    clearData: '清除所有数据',
    msFormsIntegration: 'Microsoft Forms 集成',
    msFormsDesc: '使用 Power Automate 将表单数据发送到系统。',
    webhookUrl: 'Webhook 地址',
    webhookDesc: '在 Power Automate的 HTTP POST 请求中配置此URL：',
    copy: '复制',
    copied: '已复制!'
  },
  common: {
    comingSoon: '敬请期待！',
    confirmDelete: '确定要删除此车辆吗？这将删除所有相关的日志且不可撤销。',
    active: '运行中',
    maintenance: '维保中',
    inactive: '已停用',
    completed: '已完成',
    in_progress: '进行中',
    scheduled: '已排期',
    fuel: '燃油',
    toll: '过路费',
    insurance: '保险',
    other: '其他'
  }
};
