export interface User {
  id: string;
  username: string;
  subscription_plan: 'free' | 'pro' | 'team' | 'enterprise';
  tokens_total: number;
  tokens_used: number;
}

export interface Entity {
  id: string;
  name: string;
  icon: string;
  description: string;
  file_directory: string;
  created_at: string;
}

export interface Sort {
  id: string;
  entity_id: string;
  name: string;
  icon: string;
  status: 'active' | 'completed' | 'archived';
  scheduled_date: string;
  duration: number;
  pa_instance_id?: string;
}

export interface PATemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  tags: string; // JSON string
  rating: number;
  usage_count: number;
  workflow: string; // JSON string of SkillInPA[]
  skills?: Skill[]; // Populated in frontend or backend
}

export interface SkillInPA {
  instanceId: string; // Unique identifier for this skill instance in the PA
  skillId: string;
  order: number;
  chainMode: 'independent' | 'auto' | 'manual' | 'end';
  condition?: {
    type: 'previous_output' | 'file_exists' | 'custom';
    expression: string;
  };
  parameterOverrides?: Record<string, any>;
  config?: {
    triggerConfig?: any;
    parameters?: Record<string, any>;
    afterExecutionBehavior?: any;
    outputConfig?: any;
  };
}

export interface PAInstance {
  id: string;
  user_id: string;
  template_id: string;
  instance_name: string;
  is_enabled: boolean;
  skills: SkillInPA[]; // Orchestration
  binding: {
    entityId: string;
    sortId: string;
    workingDirectory: string;
  };
  requiredPermissions: {
    system: string[];
    thirdParty: Array<{ app: string; permissions: string[] }>;
  };
  execution_count: number;
  success_count: number;
  icon?: string;
  category?: string;
}

export interface ExecutionRecord {
  id: string;
  pa_instance_id: string;
  instance_name: string;
  entity_name: string;
  trigger_type: string;
  status: 'success' | 'failed' | 'running';
  start_time: string;
  duration: number;
  tokens_used: number;
  logs: string;
}

export interface ParameterOption {
  label: string;
  value: any;
  icon?: string;
}

export interface Parameter {
  key: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'file_path' | 'date' | 'time';
  required: boolean;
  defaultValue: any;
  options?: ParameterOption[];
  hint?: string;
  exposedToUser: boolean;
  userCanEdit: boolean;
  dependsOn?: string;
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface ContentConfigItem {
  label: string;
  description: string;
  defaultValue: any;
  exposedToUser: boolean;
  userCanEdit: boolean;
  dependsOn?: string;
  applicableFormats?: string[];
}

export interface FileOutputConfig {
  supportedFormats: string[];
  defaultFormat: string;
  allowFormatSelection: boolean;
  formatDescriptions?: Record<string, string>;
  defaultPath: string;
  allowPathEdit: boolean;
  pathHint?: string;
  fileNameTemplate: string;
  allowFileNameEdit: boolean;
  fileNameHint?: string;
  contentConfig?: Record<string, ContentConfigItem>;
}

export interface WatchConfig {
  deviceType: 'desktop' | 'mobile' | 'any';
  deviceId?: string;
  fileWatch?: {
    enabled: boolean;
    basePath?: string;
    paths: string[];
    patterns: string[];
    events: ('create' | 'modify' | 'rename' | 'delete')[];
    exclude?: string[];
    recursive?: boolean;
    maxDepth?: number;
  };
  appWatch?: {
    enabled: boolean;
    app: string;
    locations: Array<{ type: string; filters?: Record<string, any>; collection?: string }>;
    triggerOn: string;
    requiredPermissions: string[];
  };
  combinationMode?: 'any' | 'all';
}

export interface TriggerConditions {
  fileSize?: { min?: number; max?: number };
  fileAge?: { max: number }; // seconds
  batchMode?: boolean;
  customRules?: string;
}

export interface NotificationAction {
  label: string;
  value: string;
  nextSkillId?: string;
}

export interface NotificationConfig {
  channels: ('system_notification' | 'in_app' | 'email' | 'sms')[];
  message: string;
  actions: NotificationAction[];
  priority?: 'low' | 'normal' | 'high';
}

export interface Skill {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'input' | 'analysis' | 'output' | 'social_media' | 'communication' | 'utility';
  
  // v5.0 Additions
  triggerConfig: {
    watchConfig: WatchConfig;
    triggerConditions: TriggerConditions;
    executionMode: 'auto' | 'manual' | 'semi-auto';
    notificationConfig?: NotificationConfig;
  };
  afterExecutionBehavior: {
    mode: 'auto_next' | 'notify_user' | 'end';
    nextSkillId?: string;
    notification?: {
      message: string;
      showOutput: boolean;
      actions: NotificationAction[];
    };
  };

  executionDevice: {
    requiredDeviceType: 'any' | 'desktop' | 'mobile' | 'cloud';
    requiredApp: string | 'none';
    allowDeviceSelection: boolean;
    alternativeApps?: { app: string; label: string }[];
  };
  inputConfig: {
    inputType: 'none' | 'text' | 'file' | 'structured' | 'stream';
    supportedFormats: string[];
    allowFormatSelection: boolean;
    inputSource: 'none' | 'user' | 'previous_step' | 'sort_metadata' | 'sort_files' | 'api';
    allowCustomSource: boolean;
  };
  parameters: Parameter[];
  outputConfig: {
    outputType: 'memory' | 'file' | 'api' | 'none' | 'display';
    fileOutput?: FileOutputConfig;
    memoryOutput?: { dataStructure: Record<string, any> };
  };
  requiredPermissions: string[];
}
