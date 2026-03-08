import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("data.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT,
    subscription_plan TEXT DEFAULT 'pro',
    tokens_total INTEGER DEFAULT 500000,
    tokens_used INTEGER DEFAULT 485000
  );

  CREATE TABLE IF NOT EXISTS entities (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT,
    icon TEXT,
    description TEXT,
    file_directory TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sorts (
    id TEXT PRIMARY KEY,
    entity_id TEXT,
    name TEXT,
    icon TEXT,
    status TEXT DEFAULT 'active',
    scheduled_date TEXT,
    duration REAL,
    pa_instance_id TEXT
  );

  DROP TABLE IF EXISTS devices;
  CREATE TABLE devices (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT,
    type TEXT,
    device_model TEXT,
    status TEXT DEFAULT 'offline',
    last_active DATETIME,
    client_version TEXT,
    battery_level INTEGER
  );

  CREATE TABLE IF NOT EXISTS device_permissions (
    id TEXT PRIMARY KEY,
    device_id TEXT,
    permission_type TEXT,
    scope TEXT,
    level TEXT,
    is_granted INTEGER DEFAULT 0
  );

  DROP TABLE IF EXISTS skills;
  CREATE TABLE skills (
    id TEXT PRIMARY KEY,
    name TEXT,
    icon TEXT,
    description TEXT,
    category TEXT,
    trigger_config TEXT, -- JSON
    after_execution_behavior TEXT, -- JSON
    execution_device TEXT, -- JSON
    input_config TEXT, -- JSON
    parameters TEXT, -- JSON
    output_config TEXT, -- JSON
    required_permissions TEXT -- JSON
  );

  DROP TABLE IF EXISTS pa_templates;
  CREATE TABLE pa_templates (
    id TEXT PRIMARY KEY,
    name TEXT,
    icon TEXT,
    description TEXT,
    category TEXT,
    tags TEXT,
    rating REAL,
    usage_count INTEGER,
    workflow TEXT -- JSON array of SkillInPA
  );

  DROP TABLE IF EXISTS pa_instances;
  CREATE TABLE pa_instances (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    template_id TEXT,
    instance_name TEXT,
    icon TEXT,
    is_enabled INTEGER DEFAULT 1,
    skills TEXT, -- JSON array of SkillInPA
    binding TEXT, -- JSON {entityId, sortId, workingDirectory}
    required_permissions TEXT, -- JSON
    execution_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS execution_records (
    id TEXT PRIMARY KEY,
    pa_instance_id TEXT,
    sort_id TEXT,
    entity_id TEXT,
    trigger_type TEXT,
    status TEXT,
    start_time DATETIME,
    duration INTEGER,
    tokens_used INTEGER,
    logs TEXT
  );
`);

// Seed initial data
const seedData = () => {
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
  if (userCount.count === 0) {
    db.prepare("INSERT INTO users (id, username) VALUES (?, ?)").run("user_001", "科研助手开发者");
  }
  
  // Always re-seed skills and templates since we dropped them
  // Seed Entities
  const entityCount = db.prepare("SELECT COUNT(*) as count FROM entities").get() as any;
  if (entityCount.count === 0) {
    db.prepare("INSERT INTO entities (id, user_id, name, icon, description, file_directory) VALUES (?, ?, ?, ?, ?, ?)")
      .run("ent_001", "user_001", "听觉感知研究", "🔬", "研究音调对注意力的影响", "~/Research/HearingPerception/");
  }

  // Seed Sorts
  const sortCount = db.prepare("SELECT COUNT(*) as count FROM sorts").get() as any;
  if (sortCount.count === 0) {
    db.prepare("INSERT INTO sorts (id, entity_id, name, icon, scheduled_date, duration) VALUES (?, ?, ?, ?, ?, ?)")
      .run("sort_001", "ent_001", "实验1 - 高音调组", "📊", "2025-01-08", 2.0);
  }

  // Seed Devices
  const deviceCount = db.prepare("SELECT COUNT(*) as count FROM devices").get() as any;
  if (deviceCount.count === 0) {
    const devices = [
      { id: 'dev_001', user_id: 'user_001', name: 'Robert的iPhone', type: 'Smartphone', device_model: 'iPhone 15 Pro', status: 'online', last_active: '2026-03-08 07:00:00', client_version: '1.0.0', battery_level: 85 },
      { id: 'dev_002', user_id: 'user_001', name: 'Robert的MacBook Air', type: 'Laptop', device_model: 'MacBook Air M2', status: 'offline', last_active: '2026-03-07 18:00:00', client_version: '1.0.0', battery_level: 92 },
      { id: 'dev_003', user_id: 'user_001', name: 'Robert的iPad', type: 'Tablet', device_model: 'iPad Pro 11-inch', status: 'online', last_active: '2026-03-08 07:50:00', client_version: '1.1.2', battery_level: 15 },
    ];
    const stmt = db.prepare("INSERT INTO devices (id, user_id, name, type, device_model, status, last_active, client_version, battery_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    devices.forEach(d => stmt.run(d.id, d.user_id, d.name, d.type, d.device_model, d.status, d.last_active, d.client_version, d.battery_level));
  }

  // Seed Skills
  const skills = [
    {
      id: 'skill_apply_reader',
      name: 'Apply理解器',
      icon: '📋',
      description: '读取任务配置，理解研究问题',
      category: 'input',
      trigger_config: JSON.stringify({
        watchConfig: { deviceType: 'any' },
        triggerConditions: {},
        executionMode: 'auto'
      }),
      after_execution_behavior: JSON.stringify({
        mode: 'auto_next',
        nextSkillId: 'skill_file_scanner'
      }),
      execution_device: JSON.stringify({ requiredDeviceType: 'any', requiredApp: 'none', allowDeviceSelection: false }),
      input_config: JSON.stringify({ inputType: 'text', supportedFormats: [], allowFormatSelection: false, inputSource: 'sort_metadata', allowCustomSource: false }),
      parameters: JSON.stringify([]),
      output_config: JSON.stringify({ outputType: 'memory', memoryOutput: { dataStructure: { researchQuestion: 'string', experimentType: 'string', expectedOutputs: 'string[]' } } }),
      required_permissions: JSON.stringify(['file_read'])
    },
    {
      id: 'skill_file_scanner',
      name: '文件扫描器',
      icon: '📁',
      description: '扫描目录，识别文件类型',
      category: 'input',
      trigger_config: JSON.stringify({
        watchConfig: { 
          deviceType: 'desktop',
          fileWatch: {
            enabled: true,
            paths: ['recordings/'],
            patterns: ['*.m4a', '*.mp3', '*.wav'],
            events: ['create']
          }
        },
        triggerConditions: {},
        executionMode: 'auto'
      }),
      after_execution_behavior: JSON.stringify({
        mode: 'notify_user',
        notification: {
          message: '发现新录音文件，是否开始转录？',
          showOutput: true,
          actions: [{ label: '立即转录', value: 'next', nextSkillId: 'skill_speech_to_text' }]
        }
      }),
      execution_device: JSON.stringify({ requiredDeviceType: 'any', requiredApp: 'none', allowDeviceSelection: false }),
      input_config: JSON.stringify({ inputType: 'none', supportedFormats: [], allowFormatSelection: false, inputSource: 'none', allowCustomSource: false }),
      parameters: JSON.stringify([
        { key: 'scan_path', name: '扫描路径', type: 'file_path', required: true, defaultValue: '~/Research/', hint: '选择需要扫描的文件夹', exposedToUser: true, userCanEdit: true },
        { key: 'file_types', name: '文件类型', type: 'multiselect', required: true, defaultValue: ['.m4a', '.xlsx'], options: [{ label: '音频文件 (.m4a)', value: '.m4a' }, { label: 'Excel文件 (.xlsx)', value: '.xlsx' }], hint: '选择需要扫描的文件类型', exposedToUser: true, userCanEdit: true }
      ]),
      output_config: JSON.stringify({ outputType: 'memory' }),
      required_permissions: JSON.stringify(['file_read'])
    },
    {
      id: 'skill_speech_to_text',
      name: '语音转文字',
      icon: '🎤',
      description: '将音频文件转录为文本',
      category: 'input',
      trigger_config: JSON.stringify({
        watchConfig: { deviceType: 'any' },
        triggerConditions: {},
        executionMode: 'manual'
      }),
      after_execution_behavior: JSON.stringify({
        mode: 'notify_user',
        notification: {
          message: '转录已完成，是否继续数据分析？',
          showOutput: true,
          actions: [{ label: '继续', value: 'next', nextSkillId: 'skill_data_analyzer' }]
        }
      }),
      execution_device: JSON.stringify({ requiredDeviceType: 'any', requiredApp: 'none', allowDeviceSelection: false }),
      input_config: JSON.stringify({ inputType: 'file', supportedFormats: ['.m4a', '.mp3', '.wav'], allowFormatSelection: false, inputSource: 'previous_step', allowCustomSource: false }),
      parameters: JSON.stringify([
        { key: 'language', name: '语言', type: 'select', required: true, defaultValue: 'zh', options: [{ label: '中文', value: 'zh' }, { label: 'English', value: 'en' }], hint: '选择音频语言', exposedToUser: true, userCanEdit: true },
        { key: 'quality', name: '转录质量', type: 'select', required: true, defaultValue: 'high', options: [{ label: '标准', value: 'standard' }, { label: '高质量', value: 'high' }], hint: '质量越高，准确度越好', exposedToUser: true, userCanEdit: true },
        { key: 'speaker_detection', name: '说话人识别', type: 'boolean', required: false, defaultValue: false, hint: '是否识别不同说话人', exposedToUser: true, userCanEdit: true }
      ]),
      output_config: JSON.stringify({
        outputType: 'file',
        fileOutput: {
          supportedFormats: ['.txt', '.srt', '.vtt'],
          defaultFormat: '.txt',
          allowFormatSelection: true,
          defaultPath: '~/Research/transcripts/',
          allowPathEdit: true,
          fileNameTemplate: '{filename}_transcript_{date}.{ext}',
          allowFileNameEdit: true,
          contentConfig: {
            includeTimestamps: { label: '包含时间戳', description: '在文本中标注每句话的时间点', defaultValue: true, exposedToUser: true, userCanEdit: true },
            includeSpeakerLabels: { label: '标注说话人', description: '在文本中标注不同说话人', defaultValue: false, exposedToUser: true, userCanEdit: true, dependsOn: 'speaker_detection' }
          }
        }
      }),
      required_permissions: JSON.stringify(['file_read', 'file_write'])
    },
    {
      id: 'skill_data_analyzer',
      name: '数据分析器',
      icon: '📊',
      description: '对实验数据进行统计分析',
      category: 'analysis',
      trigger_config: JSON.stringify({
        watchConfig: { deviceType: 'any' },
        triggerConditions: {},
        executionMode: 'auto'
      }),
      after_execution_behavior: JSON.stringify({
        mode: 'auto_next',
        nextSkillId: 'skill_report_generator'
      }),
      execution_device: JSON.stringify({ requiredDeviceType: 'any', requiredApp: 'none', allowDeviceSelection: false }),
      input_config: JSON.stringify({ inputType: 'file', supportedFormats: ['.xlsx', '.csv'], allowFormatSelection: false, inputSource: 'previous_step', allowCustomSource: false }),
      parameters: JSON.stringify([
        { key: 'analysis_type', name: '分析类型', type: 'multiselect', required: true, defaultValue: ['descriptive'], options: [{ label: '描述性统计', value: 'descriptive' }, { label: '相关性分析', value: 'correlation' }], hint: '选择统计分析方法', exposedToUser: true, userCanEdit: true }
      ]),
      output_config: JSON.stringify({ outputType: 'file', fileOutput: { supportedFormats: ['.xlsx', '.csv'], defaultFormat: '.xlsx', allowFormatSelection: true, defaultPath: '~/Research/analysis/', allowPathEdit: true, fileNameTemplate: '数据分析_{date}.{ext}', allowFileNameEdit: true } }),
      required_permissions: JSON.stringify(['file_read', 'file_write'])
    },
    {
      id: 'skill_report_generator',
      name: '报告生成器',
      icon: '📝',
      description: '基于模板生成结构化实验报告',
      category: 'output',
      trigger_config: JSON.stringify({
        watchConfig: { deviceType: 'any' },
        triggerConditions: {},
        executionMode: 'auto'
      }),
      after_execution_behavior: JSON.stringify({
        mode: 'end'
      }),
      execution_device: JSON.stringify({ requiredDeviceType: 'any', requiredApp: 'none', allowDeviceSelection: false }),
      input_config: JSON.stringify({ inputType: 'structured', supportedFormats: [], allowFormatSelection: false, inputSource: 'previous_steps', allowCustomSource: false }),
      parameters: JSON.stringify([
        { key: 'template', name: '报告模板', type: 'select', required: true, defaultValue: 'experiment', options: [{ label: '实验报告模板', value: 'experiment' }, { label: '周报模板', value: 'weekly' }], hint: '选择报告模板格式', exposedToUser: true, userCanEdit: true }
      ]),
      output_config: JSON.stringify({ outputType: 'file', fileOutput: { supportedFormats: ['.md', '.pdf', '.docx'], defaultFormat: '.md', allowFormatSelection: true, defaultPath: '~/Research/reports/', allowPathEdit: true, fileNameTemplate: '实验报告_{date}.{ext}', allowFileNameEdit: true } }),
      required_permissions: JSON.stringify(['file_read', 'file_write', 'notification'])
    },
    {
      id: 'skill_influencer_searcher',
      name: '达人搜索器',
      icon: '🔍',
      description: '在社交媒体平台搜索达人数据',
      category: 'social_media',
      trigger_config: JSON.stringify({
        watchConfig: { deviceType: 'mobile', appWatch: { enabled: true, app: 'xiaohongshu', locations: [{ type: 'search_page' }], triggerOn: 'manual_trigger' } },
        triggerConditions: {},
        executionMode: 'manual'
      }),
      after_execution_behavior: JSON.stringify({ mode: 'auto_next', nextSkillId: 'skill_data_cleaner' }),
      execution_device: JSON.stringify({ requiredDeviceType: 'mobile', requiredApp: 'xiaohongshu', allowDeviceSelection: true }),
      input_config: JSON.stringify({ inputType: 'structured', supportedFormats: [], allowFormatSelection: false, inputSource: 'user', allowCustomSource: false }),
      parameters: JSON.stringify([
        { key: 'platform', name: '搜索平台', type: 'select', required: true, defaultValue: 'xiaohongshu', options: [{ label: '小红书', value: 'xiaohongshu' }, { label: '抖音', value: 'douyin' }], exposedToUser: true, userCanEdit: true },
        { key: 'search_keyword', name: '搜索关键词', type: 'string', required: true, defaultValue: '', hint: '输入搜索关键词', exposedToUser: true, userCanEdit: true },
        { key: 'follower_range', name: '粉丝数范围', type: 'select', required: false, defaultValue: '100k-500k', options: [{ label: '10万-50万', value: '100k-500k' }, { label: '50万-100万', value: '500k-1m' }], exposedToUser: true, userCanEdit: true }
      ]),
      output_config: JSON.stringify({ outputType: 'file', fileOutput: { supportedFormats: ['.xlsx', '.csv'], defaultFormat: '.xlsx', allowFormatSelection: true, defaultPath: 'influencers/', allowPathEdit: true, fileNameTemplate: '达人列表_{date}.{ext}', allowFileNameEdit: true } }),
      required_permissions: JSON.stringify(['network', 'file_write'])
    },
    {
      id: 'skill_data_cleaner',
      name: '数据清洗器',
      icon: '🧹',
      description: '去除重复、无效的达人数据',
      category: 'analysis',
      trigger_config: JSON.stringify({ watchConfig: { deviceType: 'any' }, triggerConditions: {}, executionMode: 'auto' }),
      after_execution_behavior: JSON.stringify({ mode: 'auto_next', nextSkillId: 'skill_email_sender' }),
      execution_device: JSON.stringify({ requiredDeviceType: 'any', requiredApp: 'none', allowDeviceSelection: false }),
      input_config: JSON.stringify({ inputType: 'structured', supportedFormats: ['.json'], allowFormatSelection: false, inputSource: 'previous_step', allowCustomSource: false }),
      parameters: JSON.stringify([
        { key: 'remove_duplicates', name: '去除重复达人', type: 'boolean', required: false, defaultValue: true, exposedToUser: true, userCanEdit: true }
      ]),
      output_config: JSON.stringify({ outputType: 'memory' }),
      required_permissions: JSON.stringify([])
    },
    {
      id: 'skill_email_sender',
      name: '邮件发送器',
      icon: '📧',
      description: '发送邮件通知并附带达人列表文件',
      category: 'communication',
      trigger_config: JSON.stringify({ watchConfig: { deviceType: 'any' }, triggerConditions: {}, executionMode: 'auto' }),
      after_execution_behavior: JSON.stringify({ mode: 'end' }),
      execution_device: JSON.stringify({ requiredDeviceType: 'any', requiredApp: 'none', allowDeviceSelection: false }),
      input_config: JSON.stringify({ inputType: 'structured', supportedFormats: [], allowFormatSelection: false, inputSource: 'previous_step', allowCustomSource: false }),
      parameters: JSON.stringify([
        { key: 'recipients', name: '收件人', type: 'string', required: true, defaultValue: '', hint: '输入收件人邮箱', exposedToUser: true, userCanEdit: true },
        { key: 'subject', name: '邮件主题', type: 'string', required: false, defaultValue: '达人搜索结果 - {date}', exposedToUser: true, userCanEdit: true }
      ]),
      output_config: JSON.stringify({ outputType: 'none' }),
      required_permissions: JSON.stringify(['network'])
    },
    {
      id: 'skill_meeting_analyzer',
      name: '会议内容分析',
      icon: '🔍',
      description: '分析会议转录，提取关键信息和行动项',
      category: 'analysis',
      trigger_config: JSON.stringify({ watchConfig: { deviceType: 'any' }, triggerConditions: {}, executionMode: 'auto' }),
      after_execution_behavior: JSON.stringify({ mode: 'auto_next', nextSkillId: 'skill_minutes_generator' }),
      execution_device: JSON.stringify({ requiredDeviceType: 'any', requiredApp: 'none', allowDeviceSelection: false }),
      input_config: JSON.stringify({ inputType: 'text', supportedFormats: ['.txt'], allowFormatSelection: false, inputSource: 'previous_step', allowCustomSource: false }),
      parameters: JSON.stringify([
        { key: 'analysis_depth', name: '分析深度', type: 'select', required: true, defaultValue: 'standard', options: [{ label: '标准', value: 'standard' }, { label: '深度', value: 'deep' }], exposedToUser: true, userCanEdit: true }
      ]),
      output_config: JSON.stringify({ outputType: 'memory' }),
      required_permissions: JSON.stringify([])
    },
    {
      id: 'skill_minutes_generator',
      name: '纪要生成器',
      icon: '📝',
      description: '基于分析结果生成结构化会议纪要',
      category: 'output',
      trigger_config: JSON.stringify({ watchConfig: { deviceType: 'any' }, triggerConditions: {}, executionMode: 'auto' }),
      after_execution_behavior: JSON.stringify({ mode: 'end' }),
      execution_device: JSON.stringify({ requiredDeviceType: 'any', requiredApp: 'none', allowDeviceSelection: false }),
      input_config: JSON.stringify({ inputType: 'structured', supportedFormats: [], allowFormatSelection: false, inputSource: 'previous_step', allowCustomSource: false }),
      parameters: JSON.stringify([
        { key: 'template', name: '纪要模板', type: 'select', required: true, defaultValue: 'standard', options: [{ label: '标准会议纪要', value: 'standard' }, { label: '项目讨论纪要', value: 'project' }], exposedToUser: true, userCanEdit: true }
      ]),
      output_config: JSON.stringify({ outputType: 'file', fileOutput: { supportedFormats: ['.md', '.pdf', '.docx'], defaultFormat: '.md', allowFormatSelection: true, defaultPath: 'minutes/', allowPathEdit: true, fileNameTemplate: '会议纪要_{date}.{ext}', allowFileNameEdit: true } }),
      required_permissions: JSON.stringify(['file_write'])
    },
    {
      id: 'skill_pdf_extractor',
      name: 'PDF提取器',
      icon: '📄',
      description: '从PDF文档中提取文本和表格数据',
      category: 'input',
      trigger_config: JSON.stringify({ watchConfig: { deviceType: 'any' }, triggerConditions: {}, executionMode: 'auto' }),
      after_execution_behavior: JSON.stringify({ mode: 'auto_next' }),
      execution_device: JSON.stringify({ requiredDeviceType: 'any', requiredApp: 'none', allowDeviceSelection: false }),
      input_config: JSON.stringify({ inputType: 'file', supportedFormats: ['.pdf'], allowFormatSelection: false, inputSource: 'user', allowCustomSource: true }),
      parameters: JSON.stringify([
        { key: 'extract_images', name: '提取图片', type: 'boolean', required: false, defaultValue: false, exposedToUser: true, userCanEdit: true }
      ]),
      output_config: JSON.stringify({ outputType: 'memory' }),
      required_permissions: JSON.stringify(['file_read'])
    },
    {
      id: 'skill_translator',
      name: '多语言翻译',
      icon: '🌐',
      description: '将文本翻译为多种目标语言',
      category: 'analysis',
      trigger_config: JSON.stringify({ watchConfig: { deviceType: 'any' }, triggerConditions: {}, executionMode: 'auto' }),
      after_execution_behavior: JSON.stringify({ mode: 'auto_next' }),
      execution_device: JSON.stringify({ requiredDeviceType: 'cloud', requiredApp: 'none', allowDeviceSelection: false }),
      input_config: JSON.stringify({ inputType: 'text', supportedFormats: [], allowFormatSelection: false, inputSource: 'previous_step', allowCustomSource: false }),
      parameters: JSON.stringify([
        { key: 'target_lang', name: '目标语言', type: 'select', required: true, defaultValue: 'en', options: [{ label: 'English', value: 'en' }, { label: '中文', value: 'zh' }, { label: '日本語', value: 'ja' }], exposedToUser: true, userCanEdit: true }
      ]),
      output_config: JSON.stringify({ outputType: 'memory' }),
      required_permissions: JSON.stringify(['network'])
    }
  ];

  const skillStmt = db.prepare("INSERT INTO skills (id, name, icon, description, category, trigger_config, after_execution_behavior, execution_device, input_config, parameters, output_config, required_permissions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  for (const s of skills) {
    skillStmt.run(s.id, s.name, s.icon, s.description, s.category, s.trigger_config, s.after_execution_behavior, s.execution_device, s.input_config, s.parameters, s.output_config, s.required_permissions);
  }

  // Seed PA Templates
  const paTemplates = [
    {
      id: 'pa_experiment_analyst',
      name: '实验数据分析师',
      icon: '🔬',
      description: '自动完成实验录音转录、数据分析和报告生成',
      category: 'research',
      tags: JSON.stringify(['科研', '实验', '数据分析', '报告']),
      rating: 4.8,
      usage_count: 1234,
      workflow: JSON.stringify([
        { skillId: 'skill_apply_reader', order: 1, chainMode: 'auto' },
        { skillId: 'skill_file_scanner', order: 2, chainMode: 'auto' },
        { skillId: 'skill_speech_to_text', order: 3, chainMode: 'manual' },
        { skillId: 'skill_data_analyzer', order: 4, chainMode: 'manual' },
        { skillId: 'skill_report_generator', order: 5, chainMode: 'end' }
      ])
    },
    {
      id: 'pa_influencer_search',
      name: '达人搜索助手',
      icon: '🔍',
      description: '自动搜索社交媒体平台的达人数据并导出',
      category: 'social_media',
      tags: JSON.stringify(['社交媒体', '达人', '小红书', '抖音', 'MCN']),
      rating: 4.9,
      usage_count: 856,
      workflow: JSON.stringify([
        { skillId: 'skill_influencer_searcher', order: 1, chainMode: 'auto' },
        { skillId: 'skill_data_cleaner', order: 2, chainMode: 'auto' },
        { skillId: 'skill_email_sender', order: 3, chainMode: 'end' }
      ])
    },
    {
      id: 'pa_meeting_minutes',
      name: '会议纪要生成器',
      icon: '📋',
      description: '自动将会议录音转录为文字，提取关键信息并生成结构化会议纪要',
      category: 'document',
      tags: JSON.stringify(['会议', '纪要', '录音', '转录']),
      rating: 4.8,
      usage_count: 765,
      workflow: JSON.stringify([
        { skillId: 'skill_speech_to_text', order: 1, chainMode: 'auto' },
        { skillId: 'skill_meeting_analyzer', order: 2, chainMode: 'auto' },
        { skillId: 'skill_minutes_generator', order: 3, chainMode: 'end' }
      ])
    }
  ];

  const paStmt = db.prepare("INSERT INTO pa_templates (id, name, icon, description, category, tags, rating, usage_count, workflow) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
  for (const t of paTemplates) {
    paStmt.run(t.id, t.name, t.icon, t.description, t.category, t.tags, t.rating, t.usage_count, t.workflow);
  }

  // Seed PA Instance
  const instanceCount = db.prepare("SELECT COUNT(*) as count FROM pa_instances").get() as any;
  if (instanceCount.count === 0) {
    db.prepare("INSERT INTO pa_instances (id, user_id, template_id, instance_name, is_enabled, skills, binding, required_permissions, execution_count, success_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(
        "inst_001", 
        "user_001", 
        "pa_experiment_analyst", 
        "实验数据分析助手", 
        1, 
        JSON.stringify([
          { skillId: 'skill_apply_reader', order: 1, chainMode: 'auto' },
          { skillId: 'skill_file_scanner', order: 2, chainMode: 'manual' },
          { skillId: 'skill_speech_to_text', order: 3, chainMode: 'manual' },
          { skillId: 'skill_data_analyzer', order: 4, chainMode: 'auto' },
          { skillId: 'skill_report_generator', order: 5, chainMode: 'end' }
        ]),
        JSON.stringify({
          entityId: 'ent_001',
          sortId: 'sort_001',
          workingDirectory: '~/Research/HearingPerception/'
        }),
        JSON.stringify({
          system: ['file_read', 'file_write', 'notification'],
          thirdParty: []
        }),
        12, 
        11
      );
  }

  // Seed Execution Records
  const recordCount = db.prepare("SELECT COUNT(*) as count FROM execution_records").get() as any;
  if (recordCount.count === 0) {
    db.prepare("INSERT INTO execution_records (id, pa_instance_id, sort_id, entity_id, trigger_type, status, start_time, duration, tokens_used, logs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run("rec_001", "inst_001", "sort_001", "ent_001", "calendar", "success", "2025-01-08 14:00:00", 135, 15234, "Workflow completed successfully.");
    
    db.prepare("INSERT INTO execution_records (id, pa_instance_id, sort_id, entity_id, trigger_type, status, start_time, duration, tokens_used, logs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run("rec_002", "inst_001", "sort_001", "ent_001", "manual", "success", "2025-01-07 10:30:00", 120, 12450, "Manual trigger execution finished.");

    db.prepare("INSERT INTO execution_records (id, pa_instance_id, sort_id, entity_id, trigger_type, status, start_time, duration, tokens_used, logs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run("rec_003", "inst_001", "sort_001", "ent_001", "file", "failed", "2025-01-06 09:15:00", 45, 5000, "Error: Audio file corrupted.");
  }
};

seedData();

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  app.use(express.json());

  app.get("/api/devices", (req, res) => {
    try {
      const devices = db.prepare("SELECT * FROM devices").all();
      res.json(devices);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // API Routes
  app.get("/api/user", (req, res) => {
    try {
      const user = db.prepare("SELECT * FROM users LIMIT 1").get();
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/entities", (req, res) => {
    try {
      const entities = db.prepare("SELECT * FROM entities").all();
      res.json(entities);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/dashboard/stats", (req, res) => {
    try {
      const stats = {
        entitiesCount: db.prepare("SELECT COUNT(*) as count FROM entities").get() as any,
        activePAs: db.prepare("SELECT COUNT(*) as count FROM pa_instances WHERE is_enabled = 1").get() as any,
        executionsThisMonth: 156, // Mocked for now
        availableSkills: 12
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/skills", (req, res) => {
    try {
      const { category, keyword } = req.query;
      let query = "SELECT * FROM skills";
      const params: any[] = [];
      
      if (category || keyword) {
        query += " WHERE";
        if (category) {
          query += " category = ?";
          params.push(category);
        }
        if (keyword) {
          if (category) query += " AND";
          query += " (name LIKE ? OR description LIKE ?)";
          params.push(`%${keyword}%`, `%${keyword}%`);
        }
      }
      
      const skills = db.prepare(query).all(...params) as any[];
      const parsed = skills.map(s => ({
        ...s,
        triggerConfig: JSON.parse(s.trigger_config),
        afterExecutionBehavior: JSON.parse(s.after_execution_behavior),
        executionDevice: JSON.parse(s.execution_device),
        inputConfig: JSON.parse(s.input_config),
        parameters: JSON.parse(s.parameters),
        outputConfig: JSON.parse(s.output_config),
        requiredPermissions: JSON.parse(s.required_permissions)
      }));
      res.json(parsed);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/entities/:id/sorts", (req, res) => {
    try {
      const sorts = db.prepare("SELECT * FROM sorts WHERE entity_id = ?").all(req.params.id);
      res.json(sorts);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/sorts", (req, res) => {
    try {
      const { entity_id, name, icon, status, scheduled_date, duration, pa_instance_id } = req.body;
      const id = `sort_${Date.now()}`;
      db.prepare(`
        INSERT INTO sorts (id, entity_id, name, icon, status, scheduled_date, duration, pa_instance_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, entity_id, name, icon, status || 'active', scheduled_date, duration, pa_instance_id);
      
      const newSort = db.prepare("SELECT * FROM sorts WHERE id = ?").get(id);
      res.json(newSort);
    } catch (error) {
      console.error("Error creating sort:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.put("/api/sorts/:id", (req, res) => {
    try {
      const { pa_instance_id } = req.body;
      db.prepare("UPDATE sorts SET pa_instance_id = ? WHERE id = ?").run(pa_instance_id, req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating sort:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/sorts/:id/files", (req, res) => {
    try {
      // Mocked file structure
      const files = [
        { id: 'f1', name: '实验报告_20240308.md', path: 'PA输出文件/reports/', size: 15200, type: 'markdown', generatedBy: { paName: '实验数据分析师', skillName: '报告生成器', date: '2024-03-08' } },
        { id: 'f2', name: '数据分析_20240308.xlsx', path: 'PA输出文件/analysis/', size: 45000, type: 'excel', generatedBy: { paName: '实验数据分析师', skillName: '数据分析器', date: '2024-03-08' } },
        { id: 'f3', name: 'recording_01.m4a', path: '原始输入文件/recordings/', size: 2500000, type: 'audio', uploadedBy: { username: '科研助手开发者', date: '2024-03-08' } },
        { id: 'f4', name: 'experiment_data.xlsx', path: '原始输入文件/data/', size: 120000, type: 'excel', uploadedBy: { username: '科研助手开发者', date: '2024-03-08' } }
      ];
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/pa/instances", (req, res) => {
    try {
      const instances = db.prepare(`
        SELECT i.*, t.icon, t.category 
        FROM pa_instances i 
        JOIN pa_templates t ON i.template_id = t.id
      `).all() as any[];
      
      const parsed = instances.map(i => ({
        ...i,
        is_enabled: !!i.is_enabled,
        skills: i.skills ? JSON.parse(i.skills) : [],
        binding: i.binding ? JSON.parse(i.binding) : {},
        requiredPermissions: i.required_permissions ? JSON.parse(i.required_permissions) : { system: [], thirdParty: [] }
      }));
      
      res.json(parsed);
    } catch (error) {
      console.error("Error fetching instances:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/pa/instances", (req, res) => {
    try {
      const { templateId, instanceName, icon, skills, binding, skillConfigs } = req.body;
      const id = `inst_${Date.now()}`;
      const userId = "user_001"; // Mocked user
      
      // Calculate required permissions from skills
      const skillIds = skills.map((s: any) => s.skillId);
      const placeholders = skillIds.map(() => '?').join(',');
      const skillData = db.prepare(`SELECT required_permissions FROM skills WHERE id IN (${placeholders})`).all(...skillIds) as any[];
      
      const allPermissions = { system: [] as string[], thirdParty: [] as string[] };
      skillData.forEach(s => {
        if (s.required_permissions) {
          const perms = JSON.parse(s.required_permissions);
          if (perms.system) allPermissions.system.push(...perms.system);
          if (perms.thirdParty) allPermissions.thirdParty.push(...perms.thirdParty);
        }
      });
      
      // Deduplicate
      allPermissions.system = Array.from(new Set(allPermissions.system));
      allPermissions.thirdParty = Array.from(new Set(allPermissions.thirdParty));

      db.prepare(`
        INSERT INTO pa_instances (id, user_id, template_id, instance_name, icon, skills, binding, required_permissions, is_enabled)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, 
        userId, 
        templateId, 
        instanceName, 
        icon, 
        JSON.stringify(skills), 
        JSON.stringify(binding), 
        JSON.stringify(allPermissions), 
        1
      );

      res.status(201).json({ id });
    } catch (error) {
      console.error("Error creating instance:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/pa/templates", (req, res) => {
    try {
      const templates = db.prepare("SELECT * FROM pa_templates").all() as any[];
      for (const t of templates) {
        let skillConfigs: any[] = [];
        try {
          skillConfigs = JSON.parse(t.workflow || '[]');
        } catch (e) {
          console.error("Failed to parse workflow for template", t.id, t.workflow);
        }
        
        if (skillConfigs.length > 0) {
          const skillIds = skillConfigs.map(sc => sc.skillId);
          const placeholders = skillIds.map(() => '?').join(',');
          const skills = db.prepare(`SELECT * FROM skills WHERE id IN (${placeholders})`).all(...skillIds);
          
          t.skills = skillConfigs.map(sc => {
            const s = skills.find((sk: any) => sk.id === sc.skillId);
            if (!s) return null;
            return {
              ...s,
              triggerConfig: s.trigger_config ? JSON.parse(s.trigger_config) : {},
              afterExecutionBehavior: s.after_execution_behavior ? JSON.parse(s.after_execution_behavior) : {},
              executionDevice: s.execution_device ? JSON.parse(s.execution_device) : {},
              inputConfig: s.input_config ? JSON.parse(s.input_config) : {},
              parameters: s.parameters ? JSON.parse(s.parameters) : [],
              outputConfig: s.output_config ? JSON.parse(s.output_config) : {},
              requiredPermissions: s.required_permissions ? JSON.parse(s.required_permissions) : []
            };
          }).filter(Boolean);
        } else {
          t.skills = [];
        }
      }
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/execution/history", (req, res) => {
    try {
      const history = db.prepare(`
        SELECT r.*, i.instance_name, e.name as entity_name
        FROM execution_records r
        JOIN pa_instances i ON r.pa_instance_id = i.id
        JOIN entities e ON r.entity_id = e.id
        ORDER BY r.start_time DESC LIMIT 10
      `).all();
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const io = new Server(httpServer);
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    
    socket.on("device.status", (data) => {
      console.log("Device status:", data);
      db.prepare("UPDATE devices SET status = ?, last_active = ? WHERE id = ?")
        .run(data.status, new Date().toISOString(), data.deviceId);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  const PORT = 3000;
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
