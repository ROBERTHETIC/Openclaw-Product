import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  LayoutDashboard, 
  Search, 
  Library, 
  Calendar as CalendarIcon, 
  History, 
  Settings, 
  Plus, 
  ChevronRight, 
  Play, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Menu,
  X,
  Zap,
  Box,
  Cpu,
  Shield,
  Share2,
  Sun,
  Smartphone,
  Moon,
  TrendingUp,
  Activity,
  HardDrive,
  Bell,
  MessageSquare,
  Download,
  ExternalLink,
  Clock,
  Globe,
  FileText,
  Folder,
  Upload,
  RefreshCw,
  Filter,
  ArrowUp,
  ArrowDown,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { 
  User, Entity, PAInstance, PATemplate, ExecutionRecord, Skill, 
  Parameter, FileOutputConfig, ContentConfigItem, SkillInPA, Sort 
} from './types';
import { generateSmartSummary } from './services/geminiService';
import { MOCK_ENTITIES, MOCK_SORTS } from './data/mockData';
import MobileApp from './MobileApp';
import { DevicesView } from './components/DevicesView';
import { CreateMoPAView } from './components/CreateMoPAView';

// --- Components ---

const QuickAction = ({ icon: Icon, label, desc, color, onClick }: any) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left group"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg ${color} group-hover:scale-110 transition-transform`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="font-bold text-sm">{label}</p>
      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">{desc}</p>
    </div>
  </button>
);

const SkillLibraryView = ({ onUse }: { onUse?: (skill: Skill) => void }) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const fetchSkills = async () => {
      const res = await fetch(`/api/skills?${category !== 'all' ? `category=${category}` : ''}${search ? `&keyword=${search}` : ''}`);
      setSkills(await res.json());
      setLoading(false);
    };
    fetchSkills();
  }, [category, search]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Skill 库</h2>
          <p className="text-slate-400 mt-1">浏览并搜索系统提供的能力单元</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="搜索 Skill..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:border-accent outline-none transition-all"
            />
          </div>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-accent outline-none"
          >
            <option value="all">所有分类</option>
            <option value="input">输入处理</option>
            <option value="analysis">分析处理</option>
            <option value="output">输出生成</option>
            <option value="social_media">社交媒体</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array(8).fill(0).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse"></div>
          ))
        ) : (
          skills.map(skill => (
            <Card key={skill.id} className="group hover:border-accent/50 transition-all cursor-pointer" onClick={() => onUse?.(skill)}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-2xl text-accent group-hover:scale-110 transition-transform">
                  {skill.icon}
                </div>
                <Badge variant="default">{skill.category}</Badge>
              </div>
              <h3 className="font-bold mb-1">{skill.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-4 h-8">{skill.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                  <Activity size={12} className="text-emerald-400" />
                  <span>⭐ 4.8</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onUse?.(skill); }}
                  className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline"
                >
                  {onUse ? '添加' : '查看详情'}
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

const SortWorkspace = ({ sort, onBack }: { sort: any, onBack: () => void }) => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      const res = await fetch(`/api/sorts/${sort.id}/files`);
      setFiles(await res.json());
      setLoading(false);
    };
    fetchFiles();
  }, [sort]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
          <ChevronRight className="rotate-180" size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold">{sort.name}</h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">任务 工作空间</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: File Management */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-white/2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Folder className="text-accent" size={20} />
                <h3 className="font-bold">文件管理</h3>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400"><RefreshCw size={16} /></button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-xs font-bold hover:bg-accent-hover transition-all">
                  <Upload size={14} />
                  上传文件
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">工作目录: ~/Research/Exp1/</span>
                <button className="text-[10px] text-accent font-bold uppercase hover:underline">更改</button>
              </div>

              <div className="space-y-2">
                {['项目经理输出文件', '原始输入文件'].map(group => (
                  <div key={group} className="space-y-1">
                    <div className="flex items-center gap-2 px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <ChevronRight size={12} />
                      {group}
                    </div>
                    <div className="pl-6 space-y-1">
                      {files.filter(f => f.path.startsWith(group)).map(file => (
                        <div key={file.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 group transition-all">
                          <div className="flex items-center gap-3">
                            <FileText size={16} className="text-slate-500" />
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-[10px] text-slate-500">
                                {file.generatedBy ? `由 ${file.generatedBy.skillName} 生成` : `由 ${file.uploadedBy.username} 上传`} • {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"><Download size={14} /></button>
                            <button className="p-1.5 rounded-lg hover:bg-white/10 text-rose-400"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Execution Records */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-white/2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <History className="text-emerald-400" size={20} />
                <h3 className="font-bold">执行记录</h3>
              </div>
              <button className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline">查看全部</button>
            </div>

            <div className="space-y-4">
              {[
                { status: 'success', date: '2024-03-08 14:00', trigger: '文件上传', duration: '2分15秒' },
                { status: 'success', date: '2024-03-07 16:30', trigger: '手动触发', duration: '1分50秒' },
                { status: 'failed', date: '2024-03-06 10:00', trigger: '定时任务', error: '文件损坏' }
              ].map((rec, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {rec.status === 'success' ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-rose-500" />}
                      <span className="text-xs font-bold">{rec.date}</span>
                    </div>
                    <Badge variant={rec.status === 'success' ? 'success' : 'danger'}>
                      {rec.status === 'success' ? '成功' : '失败'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    <div>
                      <p className="opacity-60">触发方式</p>
                      <p className="text-slate-300 mt-1">{rec.trigger}</p>
                    </div>
                    <div>
                      <p className="opacity-60">{rec.status === 'success' ? '耗时' : '错误'}</p>
                      <p className={`${rec.status === 'success' ? 'text-slate-300' : 'text-rose-400'} mt-1`}>{rec.status === 'success' ? rec.duration : rec.error}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const EntityWorkspace = ({ entity, templates, sorts, setSorts, onBack, onConfigurePA }: { entity: Entity, templates: PATemplate[], sorts: any[], setSorts: (sorts: any[]) => void, onBack: () => void, onConfigurePA: (template: PATemplate, sortId: string) => void }) => {
  const [selectedSort, setSelectedSort] = useState<any>(null);
  const [showCreateSortModal, setShowCreateSortModal] = useState(false);
  const [newSortName, setNewSortName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<PATemplate | null>(null);

  const entitySorts = sorts.filter(s => s.entity_id === entity.id);

  if (selectedSort) {
    return <SortWorkspace sort={selectedSort} onBack={() => setSelectedSort(null)} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
          <ChevronRight className="rotate-180" size={20} />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-4xl">
            {entity.icon}
          </div>
          <div>
            <h2 className="text-3xl font-bold">{entity.name}</h2>
            <p className="text-slate-400">{entity.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: '总执行次数', value: '23', icon: Activity, color: 'text-emerald-400' },
              { label: '成功率', value: '91.3%', icon: CheckCircle2, color: 'text-indigo-400' },
              { label: '文件总数', value: '156', icon: FileText, color: 'text-amber-400' },
              { label: '存储空间', value: '2.3GB', icon: HardDrive, color: 'text-rose-400' }
            ].map((stat, i) => (
              <Card key={i} className="p-4 bg-white/2">
                <stat.icon size={16} className={`${stat.color} mb-2`} />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">任务列表</h3>
              <button 
                onClick={() => setShowCreateSortModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-xs font-bold hover:bg-white/10 transition-all"
              >
                <Plus size={14} />
                新建任务
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {entitySorts.map(sort => (
                <Card 
                  key={sort.id} 
                  className="flex items-center justify-between p-6 hover:border-accent/30 transition-all cursor-pointer group"
                  onClick={() => setSelectedSort(sort)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {sort.icon}
                    </div>
                    <div>
                      <h4 className="font-bold">{sort.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">12个文件 • 最近执行：2小时前</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="success">✅ 正常</Badge>
                    <ChevronRight className="text-slate-600 group-hover:text-accent transition-colors" size={20} />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="bg-white/2 border-accent/20">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="text-accent" size={20} />
              <h3 className="font-bold">配置的项目经理</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-accent/5 border border-accent/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">🔬</div>
                  <div>
                    <h4 className="text-sm font-bold">实验数据分析师</h4>
                    <p className="text-[10px] text-accent font-bold uppercase tracking-widest">v5.0 已激活</p>
                  </div>
                </div>
                <div className="space-y-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <div className="flex justify-between">
                    <span>Skill 数量</span>
                    <span className="text-slate-200">5 个</span>
                  </div>
                  <div className="flex justify-between">
                    <span>触发方式</span>
                    <span className="text-slate-200">文件监听</span>
                  </div>
                </div>
                <button className="w-full mt-4 py-2 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent-hover transition-all">
                  编辑配置
                </button>
              </div>
            </div>
          </Card>

          <Card className="bg-white/2">
            <h3 className="font-bold mb-6">最近执行记录</h3>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="flex-grow">
                    <p className="text-xs font-bold">实验1 - 成功完成</p>
                    <p className="text-[10px] text-slate-500">2小时前 • 耗时 2:15</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-600" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <AnimatePresence>
        {showCreateSortModal && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-md rounded-2xl border border-border p-6 space-y-6 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-text-primary">新建任务</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase">任务名称</label>
                  <input 
                    type="text" 
                    value={newSortName}
                    onChange={e => setNewSortName(e.target.value)}
                    className="w-full mt-1 bg-bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:border-accent outline-none transition-colors text-text-primary"
                    placeholder="输入任务名称"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase">选择项目经理模板</label>
                  <div className="grid grid-cols-1 gap-2 mt-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {templates.map(tpl => (
                      <button
                        key={tpl.id}
                        onClick={() => setSelectedTemplate(tpl)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                          selectedTemplate?.id === tpl.id 
                            ? 'bg-accent/10 border-accent text-accent' 
                            : 'bg-bg-secondary border-border hover:border-text-secondary text-text-primary'
                        }`}
                      >
                        <div className="text-xl">{tpl.icon}</div>
                        <div>
                          <p className="text-sm font-bold">{tpl.name}</p>
                          <p className="text-[10px] opacity-70">{tpl.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowCreateSortModal(false)} 
                  className="flex-1 py-2 rounded-lg hover:bg-bg-secondary text-text-secondary font-bold text-sm transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={async () => {
                    if (!newSortName || !selectedTemplate) return;
                    try {
                      const res = await fetch('/api/sorts', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          entity_id: entity.id,
                          name: newSortName,
                          icon: entity.icon,
                          scheduled_date: new Date().toISOString().split('T')[0],
                          duration: 1,
                        })
                      });
                      if (res.ok) {
                        const newSort = await res.json();
                        setSorts([newSort, ...sorts]);
                        onConfigurePA(selectedTemplate, newSort.id);
                        setShowCreateSortModal(false);
                        setNewSortName('');
                        setSelectedTemplate(null);
                      }
                    } catch (e) {
                      console.error('Failed to create sort', e);
                    }
                  }}
                  disabled={!newSortName || !selectedTemplate}
                  className="flex-1 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一步：配置项目经理
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ResourceChart = ({ data }: any) => (
  <div className="h-[240px] w-full mt-4">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#64748b', fontSize: 10 }} 
          dy={10}
        />
        <YAxis 
          hide 
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#0f172a', 
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '12px'
          }}
          itemStyle={{ color: '#818cf8' }}
        />
        <Area 
          type="monotone" 
          dataKey="tokens" 
          stroke="#6366f1" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorTokens)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const SystemStatus = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
        <div className="flex items-center gap-2 text-slate-400">
          <Cpu size={14} className="text-emerald-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest">CPU 负载</span>
        </div>
        <div className="flex items-end justify-between">
          <p className="text-xl font-bold">12%</p>
          <div className="flex gap-1 items-end h-8">
            {[4, 6, 3, 8, 5, 7, 4].map((h, i) => (
              <div key={i} className="w-1 bg-emerald-500/40 rounded-full" style={{ height: `${h * 10}%` }}></div>
            ))}
          </div>
        </div>
      </div>
      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
        <div className="flex items-center gap-2 text-slate-400">
          <HardDrive size={14} className="text-indigo-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest">存储空间</span>
        </div>
        <div className="flex items-end justify-between">
          <p className="text-xl font-bold">4.2GB</p>
          <p className="text-[10px] text-slate-500 font-bold mb-1">/ 10GB</p>
        </div>
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 w-[42%]"></div>
        </div>
      </div>
    </div>
    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-400">
          <Activity size={14} className="text-amber-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest">API 延迟</span>
        </div>
        <span className="text-[10px] text-emerald-400 font-bold">正常</span>
      </div>
      <div className="flex items-center gap-4">
        <p className="text-xl font-bold">124ms</p>
        <div className="flex-grow h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 w-[65%]"></div>
        </div>
      </div>
    </div>
  </div>
);

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${
      active ? 'bg-accent/10 text-accent font-bold' : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
    }`}
  >
    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r-full"></div>}
    <Icon size={20} className={active ? 'text-accent' : 'text-slate-500 group-hover:text-slate-300'} />
    <span className="truncate">{label}</span>
  </button>
);

const Card = ({ children, className = "", ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => (
  <div className={`bg-card border border-border rounded-2xl p-6 ${className}`} {...props}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'success' | 'danger' | 'warning' }) => {
  const styles = {
    default: 'bg-slate-800 text-slate-300',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
};

// --- Views ---

const Dashboard = ({ user, stats, history, instances, setActiveTab, setConfiguringPA, templates, entities, onSelectEntity }: any) => {
  const [summary, setSummary] = useState<string>(() => {
    return localStorage.getItem('dashboard_summary') || "";
  });
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [reportType, setReportType] = useState<'daily' | 'monthly'>('daily');
  const [summaryTab, setSummaryTab] = useState<'summary' | 'todo' | 'done' | 'risks'>('summary');
  const [runningInstance, setRunningInstance] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const lastFetchTime = useRef<number>(0);
  const isQuotaExceeded = useRef<boolean>(false);

  const addNotification = (title: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [{ id, title, type, time: '刚刚' }, ...prev].slice(0, 5));
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleRunInstance = (inst: any) => {
    setRunningInstance(inst.id);
    addNotification(`正在启动: ${inst.instance_name}`, 'info');
    
    setTimeout(() => {
      setRunningInstance(null);
      addNotification(`${inst.instance_name} 执行成功`, 'success');
    }, 2000);
  };

  const handleReport = (type: string) => {
    addNotification(`正在生成${type === 'daily' ? '日' : '周'}报...`, 'info');
    setTimeout(() => {
      addNotification(`${type === 'daily' ? '日' : '周'}报已生成并保存到知识库`, 'success');
    }, 1500);
  };

  // Mock data for resource chart
  const resourceData = [
    { name: '01/01', tokens: 1200 },
    { name: '01/02', tokens: 2100 },
    { name: '01/03', tokens: 1800 },
    { name: '01/04', tokens: 2400 },
    { name: '01/05', tokens: 3200 },
    { name: '01/06', tokens: 2800 },
    { name: '01/07', tokens: 3500 },
  ];

  const fetchSummary = useCallback(async (force = false) => {
    if (!stats || history.length === 0) return;
    
    const now = Date.now();
    // If quota was exceeded, wait at least 30 seconds before trying again automatically
    if (!force && isQuotaExceeded.current && now - lastFetchTime.current < 30000) {
      return;
    }

    // Simple cache check: if summary exists and not forced, skip
    // We use a local variable to check the current state to avoid dependency loop
    const currentSummary = localStorage.getItem('dashboard_summary') || "";
    if (!force && currentSummary && 
        currentSummary !== "智能总结暂时不可用。" && 
        currentSummary !== "系统繁忙（配额限制），请稍后再试。") {
      return;
    }

    // Prevent rapid successive calls
    if (now - lastFetchTime.current < 5000 && !force) {
      return;
    }

    setLoadingSummary(true);
    lastFetchTime.current = now;
    
    try {
      const s = await generateSmartSummary({ stats, history, instances });
      setSummary(s);
      
      if (s === "系统繁忙（配额限制），请稍后再试。") {
        isQuotaExceeded.current = true;
      } else {
        isQuotaExceeded.current = false;
        localStorage.setItem('dashboard_summary', s);
      }
    } catch (e) {
      setSummary("智能总结暂时不可用。");
    } finally {
      setLoadingSummary(false);
    }
  }, [stats, history, instances]);

  useEffect(() => {
    const timer = setTimeout(() => fetchSummary(false), 3000);
    return () => clearTimeout(timer);
  }, [fetchSummary]);

  return (
    <div className="space-y-8">
      {/* Header Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 bg-card border-border relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-2 tracking-tight">
                  晚上好，{user?.username}
                </h2>
                <p className="text-slate-400 mt-1 font-medium">今天是 2025年1月8日 星期三</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => fetchSummary(true)}
                  disabled={loadingSummary}
                  className="px-4 py-2 rounded-lg bg-bg-secondary border border-border text-sm font-bold hover:bg-white/5 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <RefreshCw size={14} className={loadingSummary ? 'animate-spin' : ''} />
                  {loadingSummary ? '生成中...' : '刷新总结'}
                </button>
              </div>
            </div>

            {/* Tabbed Summary Interface */}
            <div className="flex-grow flex flex-col">
              <div className="flex items-center justify-between border-b border-border mb-4">
                 <div className="flex gap-1 bg-bg-secondary p-1 rounded-lg">
                    <button
                      onClick={() => setReportType('daily')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                        reportType === 'daily' ? 'bg-accent text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      日报
                    </button>
                    <button
                      onClick={() => setReportType('monthly')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                        reportType === 'monthly' ? 'bg-accent text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      月报
                    </button>
                 </div>

                 <div className="flex gap-4">
                    {['summary', 'todo', 'done', 'risks'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setSummaryTab(tab as any)}
                        className={`text-sm font-bold transition-colors relative py-2 ${
                          summaryTab === tab 
                            ? 'text-accent' 
                            : 'text-slate-400 hover:text-text-primary'
                        }`}
                      >
                        {tab === 'summary' && '总结'}
                        {tab === 'todo' && '待办'}
                        {tab === 'done' && '已完成'}
                        {tab === 'risks' && '风险'}
                        {summaryTab === tab && (
                          <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                        )}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="flex-grow bg-bg-secondary/30 rounded-xl p-4 min-h-[120px]">
                {loadingSummary ? (
                  <div className="flex items-center justify-center h-full text-slate-400 gap-2">
                    <RefreshCw size={16} className="animate-spin" />
                    正在分析数据生成总结...
                  </div>
                ) : (
                  <div className="text-sm leading-relaxed text-text-secondary">
                    {summaryTab === 'summary' && (
                      <div className="space-y-2">
                        {reportType === 'daily' ? (
                           <>
                            <p>✅ <span className="font-bold text-text-primary">今日完成：</span> 实验数据分析任务已完成，成功处理 156 个样本文件。</p>
                            <p>📊 <span className="font-bold text-text-primary">数据亮点：</span> 成功率达到 98.5%，比昨日提升 2.3%。</p>
                            <p>💡 <span className="font-bold text-text-primary">AI 建议：</span> 建议关注 "高音调组" 的异常波动，可能需要人工复核。</p>
                           </>
                        ) : (
                           <>
                            <p>📈 <span className="font-bold text-text-primary">本月概览：</span> 累计执行项目经理任务 452 次，节省人工工时约 120 小时。</p>
                            <p>🏆 <span className="font-bold text-text-primary">最佳表现：</span> "社交媒体周报" 项目经理运行最为稳定，零错误率。</p>
                           </>
                        )}
                      </div>
                    )}
                    {summaryTab === 'todo' && (
                      <ul className="space-y-2">
                        {reportType === 'daily' ? (
                          <>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> <span>审核 "实验1" 的最终报告 (截止: 明天 10:00)</span></li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> <span>配置新的 "竞品监控" 项目经理</span></li>
                          </>
                        ) : (
                          <>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> <span>完成 Q1 季度数据汇总</span></li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> <span>优化 3 个核心项目经理流程</span></li>
                          </>
                        )}
                      </ul>
                    )}
                    {summaryTab === 'done' && (
                      <ul className="space-y-2">
                        {reportType === 'daily' ? (
                          <>
                            <li className="flex items-center gap-2 text-slate-400 line-through"><CheckCircle2 size={12} className="text-emerald-500" /> <span>早会纪要生成</span></li>
                            <li className="flex items-center gap-2 text-slate-400 line-through"><CheckCircle2 size={12} className="text-emerald-500" /> <span>数据清洗任务 #402</span></li>
                          </>
                        ) : (
                          <>
                            <li className="flex items-center gap-2 text-slate-400 line-through"><CheckCircle2 size={12} className="text-emerald-500" /> <span>1月第一周周报</span></li>
                            <li className="flex items-center gap-2 text-slate-400 line-through"><CheckCircle2 size={12} className="text-emerald-500" /> <span>年度总结 PPT 初稿</span></li>
                            <li className="flex items-center gap-2 text-slate-400 line-through"><CheckCircle2 size={12} className="text-emerald-500" /> <span>归档 2024 历史数据</span></li>
                          </>
                        )}
                      </ul>
                    )}
                    {summaryTab === 'risks' && (
                      <div className="space-y-2">
                        {reportType === 'daily' ? (
                          <div className="flex items-start gap-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                            <AlertTriangle size={16} className="text-rose-500 mt-0.5" />
                            <div>
                              <p className="font-bold text-rose-400 text-xs">API 响应延迟</p>
                              <p className="text-xs text-rose-300/80">检测到外部 API 响应时间超过 2s，建议暂停非紧急任务。</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <AlertTriangle size={16} className="text-amber-500 mt-0.5" />
                            <div>
                              <p className="font-bold text-amber-400 text-xs">Token 配额预警</p>
                              <p className="text-xs text-amber-300/80">按当前消耗速度，预计本月 25 日将耗尽 Token 配额。</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between bg-card border-border">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">系统状态</h3>
              <div className="flex items-center gap-2">
                <div className="status-pulse"></div>
                <span className="text-xs font-bold text-emerald-500">运行中</span>
              </div>
            </div>
            <SystemStatus />
          </div>
          <button className="w-full mt-6 py-3 rounded-xl bg-bg-secondary border border-border text-sm font-bold hover:bg-white/5 transition-all flex items-center justify-center gap-2 group">
            <Shield size={16} className="text-emerald-500 group-hover:scale-110 transition-transform" />
            安全中心
          </button>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* My Workspaces */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">我的工作空间 (Entity)</h3>
              <button className="text-xs font-bold text-accent uppercase tracking-widest hover:underline">查看全部</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {entities.map(ent => (
                <Card 
                  key={ent.id} 
                  className="p-6 hover:border-accent/30 transition-all cursor-pointer group"
                  onClick={() => onSelectEntity(ent)}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {ent.icon}
                    </div>
                    <div>
                      <h4 className="font-bold">{ent.name}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">运行中</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{ent.description}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-accent uppercase tracking-widest">进入工作空间</span>
                    <ChevronRight size={14} className="text-slate-600 group-hover:text-accent transition-colors" />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickAction 
              icon={Plus} 
              label="新建项目经理" 
              desc="快速部署助手" 
              color="bg-indigo-500/20 text-indigo-400" 
              onClick={() => setActiveTab('market')}
            />
            <QuickAction 
              icon={Search} 
              label="发现 Skill" 
              desc="浏览技能库" 
              color="bg-emerald-500/20 text-emerald-400" 
              onClick={() => setActiveTab('market')}
            />
            <QuickAction 
              icon={MessageSquare} 
              label="社区求助" 
              desc="获取专家支持" 
              color="bg-amber-500/20 text-amber-400" 
              onClick={() => addNotification('社区功能即将上线', 'info')}
            />
          </div>

          {/* 项目经理 Status */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">活跃项目经理实例</h3>
              <button 
                onClick={() => setActiveTab('library')}
                className="text-accent text-sm font-medium hover:underline flex items-center gap-1"
              >
                管理全部 <ArrowRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {instances.map((inst: PAInstance) => (
                <Card key={inst.id} className="hover:border-accent/30 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-accent/10 transition-all"></div>
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-2xl shadow-inner">
                        {inst.icon}
                      </div>
                      <div>
                        <h4 className="font-bold group-hover:text-accent transition-colors">{inst.instance_name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="default">{inst.category === 'research' ? '科研' : '社交媒体'}</Badge>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => setActiveTab('library')}
                        className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
                      >
                        <Settings size={16} />
                      </button>
                      <button 
                        onClick={() => handleRunInstance(inst)}
                        disabled={runningInstance === inst.id}
                        className={`p-2 rounded-lg hover:bg-white/5 ${runningInstance === inst.id ? 'animate-spin text-accent' : 'text-emerald-400'}`}
                      >
                        {runningInstance === inst.id ? <Zap size={16} /> : <Play size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm relative z-10">
                    <div>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">执行</p>
                      <p className="font-bold">{inst.execution_count}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">成功率</p>
                      <p className="font-bold text-emerald-400">95%</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">最后运行</p>
                      <p className="font-bold">2h前</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Upcoming Schedule */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">待办任务与排期</h3>
              <button 
                onClick={() => setActiveTab('calendar')}
                className="text-accent text-sm font-medium hover:underline flex items-center gap-1"
              >
                查看日历 <ArrowRight size={14} />
              </button>
            </div>
            <Card className="p-0 overflow-hidden">
              <div className="divide-y divide-white/5">
                {[
                  { id: 1, title: '实验数据自动转录', time: '14:00', date: '今日', type: 'research', icon: '🔬' },
                  { id: 2, title: '社交媒体趋势分析', time: '16:30', date: '今日', type: 'social', icon: '📱' },
                  { id: 3, title: '文献库自动更新', time: '09:00', date: '明日', type: 'research', icon: '📚' },
                ].map(task => (
                  <div key={task.id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors group">
                    <div className="text-center min-w-[60px]">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{task.date}</p>
                      <p className="text-sm font-bold text-slate-200">{task.time}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">
                      {task.icon}
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-bold group-hover:text-accent transition-colors">{task.title}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{task.type === 'research' ? '科研项目' : '社交媒体'}</p>
                    </div>
                    <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors">
                      <Clock size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Resource Monitor & History */}
        <div className="space-y-8">
          {/* Resource Monitor */}
          <Card>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Token 消耗趋势</h3>
              <TrendingUp size={16} className="text-accent" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">12,402</p>
              <span className="text-xs text-emerald-400 font-bold">+12.5%</span>
            </div>
            <ResourceChart data={resourceData} />
          </Card>

          {/* Recent History */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">最近活动</h3>
              <div className="p-2 rounded-lg bg-white/5">
                <Bell size={18} className="text-slate-500" />
              </div>
            </div>
            <div className="space-y-3">
              {history.map((rec: ExecutionRecord) => (
                <div key={rec.id} className="group flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${rec.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {rec.status === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold group-hover:text-accent transition-colors">{rec.instance_name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{rec.entity_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400">2h前</p>
                    <p className="text-[10px] text-slate-600 font-bold mt-1">{rec.duration}s</p>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setActiveTab('history')}
              className="w-full py-3 rounded-xl border border-dashed border-white/10 text-slate-500 text-sm font-bold hover:bg-white/5 transition-all"
            >
              查看完整历史
            </button>
          </div>

          {/* Recent Reports */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">最新报告</h3>
              <div className="p-2 rounded-lg bg-white/5">
                <Library size={18} className="text-slate-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 1, name: '听觉实验分析报告_V1.pdf', size: '2.4MB', date: '12-28', icon: '📄' },
                { id: 2, name: '年度科研总结.docx', size: '1.1MB', date: '12-25', icon: '📝' },
              ].map(doc => (
                <div key={doc.id} className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">
                    {doc.icon}
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-bold group-hover:text-accent transition-colors truncate">{doc.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{doc.size} • {doc.date}</p>
                  </div>
                  <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors">
                    <Download size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button className="w-full py-3 rounded-xl bg-accent/10 text-accent text-sm font-bold hover:bg-accent/20 transition-all">
              进入知识库
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Overlay */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border flex items-center gap-3 min-w-[280px] ${
                n.type === 'success' ? 'bg-emerald-900/90 border-emerald-500/50 text-emerald-100' :
                n.type === 'warning' ? 'bg-amber-900/90 border-amber-500/50 text-amber-100' :
                'bg-slate-900/90 border-slate-700 text-slate-100'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                n.type === 'success' ? 'bg-emerald-500/20' :
                n.type === 'warning' ? 'bg-amber-500/20' :
                'bg-white/10'
              }`}>
                {n.type === 'success' ? <CheckCircle2 size={18} /> : 
                 n.type === 'warning' ? <AlertTriangle size={18} /> : 
                 <Bell size={18} />}
              </div>
              <div className="flex-grow">
                <p className="text-sm font-bold">{n.title}</p>
                <p className="text-[10px] opacity-60 font-medium">{n.time}</p>
              </div>
              <button onClick={(e) => {
                e.stopPropagation();
                setNotifications(prev => prev.filter(item => item.id !== n.id));
              }} className="p-1 hover:bg-white/10 rounded-md transition-colors">
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const PAMarket = ({ templates, onUse, onCreateMoPA }: { templates: PATemplate[], onUse: (tpl: PATemplate) => void, onCreateMoPA: () => void }) => (
  <div className="space-y-8">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 className="text-2xl font-bold">项目经理市场</h2>
        <p className="text-slate-400">发现和使用社区分享的 AI 助手</p>
      </div>
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="relative flex-1 md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="搜索项目经理..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <button 
          onClick={onCreateMoPA}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 transition-colors whitespace-nowrap shadow-lg shadow-accent/20"
        >
          <Plus size={18} />
          创建我的PA
        </button>
      </div>
    </div>

    <div className="flex gap-2 overflow-x-auto pb-2">
      {['全部', '科研', '社交媒体', '文档', '数据分析', '项目管理'].map(cat => (
        <button key={cat} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${cat === '全部' ? 'bg-accent text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
          {cat}
        </button>
      ))}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map(tpl => (
        <Card key={tpl.id} className="flex flex-col h-full hover:border-accent/30 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-2xl">
              {tpl.icon}
            </div>
            <div className="flex items-center gap-1 text-amber-400 text-sm font-bold">
              <span>⭐</span> {tpl.rating}
            </div>
          </div>
          <h3 className="text-lg font-bold mb-2 group-hover:text-accent transition-colors">{tpl.name}</h3>
          <p className="text-sm text-slate-400 mb-6 flex-grow line-clamp-2">{tpl.description}</p>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-xs text-slate-500">👥 {tpl.usage_count} 使用</span>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-white/5 text-xs font-medium hover:bg-white/10">预览</button>
              <button 
                onClick={() => onUse(tpl)}
                className="px-3 py-1.5 rounded-lg bg-accent text-xs font-medium hover:bg-accent-hover"
              >
                立即使用
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const PricingModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-card w-full max-w-5xl rounded-3xl border border-border overflow-hidden shadow-2xl flex flex-col md:flex-row"
    >
      <div className="p-8 md:p-12 flex-1 space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">升级您的工作流</h2>
          <p className="text-slate-400">选择适合您的方案，解锁更多高级功能。</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="font-bold">无限 Token 配额</h3>
              <p className="text-sm text-slate-400">不再受每日限制，尽情使用高级模型。</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Share2 size={24} />
            </div>
            <div>
              <h3 className="font-bold">团队协作空间</h3>
              <p className="text-sm text-slate-400">共享项目经理模板，协同编辑工作流。</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="font-bold">企业级安全</h3>
              <p className="text-sm text-slate-400">私有部署选项，SSO 登录支持。</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-bg-secondary p-8 md:p-12 w-full md:w-[400px] border-l border-border flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-bold text-lg">Pro 专业版</h3>
          <Badge variant="default">推荐</Badge>
        </div>
        <div className="mb-8">
          <span className="text-4xl font-bold">¥99</span>
          <span className="text-slate-400">/月</span>
        </div>
        <ul className="space-y-4 mb-8 flex-grow">
          <li className="flex items-center gap-2 text-sm"><CheckCircle2 size={16} className="text-accent" /> 无限 GPT-4 调用</li>
          <li className="flex items-center gap-2 text-sm"><CheckCircle2 size={16} className="text-accent" /> 10GB 知识库存储</li>
          <li className="flex items-center gap-2 text-sm"><CheckCircle2 size={16} className="text-accent" /> 优先技术支持</li>
          <li className="flex items-center gap-2 text-sm"><CheckCircle2 size={16} className="text-accent" /> 自定义 API 接入</li>
        </ul>
        <button className="w-full py-3 rounded-xl bg-accent text-white font-bold hover:bg-accent-hover transition-all shadow-lg shadow-accent/20">
          立即升级
        </button>
        <button onClick={onClose} className="w-full py-3 mt-4 rounded-xl hover:bg-white/5 text-slate-400 font-bold transition-all">
          暂不需要
        </button>
      </div>
    </motion.div>
  </div>
);

const Calendar = ({ instances, templates, entities, sorts }: { instances: PAInstance[], templates: PATemplate[], entities: Entity[], sorts: Sort[] }) => {
  const [view, setView] = useState<'week' | 'day'>('week');
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date('2025-01-06')); // Start on Monday
  const [events, setEvents] = useState([
    { id: '1', title: '实验数据分析 - 自动处理', start: new Date('2025-01-08T09:00:00'), end: new Date('2025-01-08T10:00:00'), type: 'meeting', color: 'rose' },
    { id: '2', title: '社交媒体周报 - 生成报告', start: new Date('2025-01-08T14:00:00'), end: new Date('2025-01-08T16:00:00'), type: 'work', color: 'indigo' },
  ]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', startTime: '09:00', endTime: '10:00', type: 'work', entityId: '', sortId: '' });
  const [draggedEvent, setDraggedEvent] = useState<string | null>(null);
  const [draggedEntity, setDraggedEntity] = useState<Entity | null>(null);
  
  // Selection state
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ dayIndex: number, hour: number, minute: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ dayIndex: number, hour: number, minute: number } | null>(null);

  // Constants
  const HOURS = Array.from({ length: 24 }, (_, i) => i);
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const CELL_HEIGHT = 60; // 1 hour = 60px

  const getWeekDays = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  };

  const weekDays = getWeekDays();

  const handleDragStart = (e: React.DragEvent, eventId: string) => {
    setDraggedEvent(eventId);
    e.dataTransfer.effectAllowed = 'move';
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleEntityDragStart = (e: React.DragEvent, entity: Entity) => {
    setDraggedEntity(entity);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = draggedEntity ? 'copy' : 'move';
  };

  const handleDrop = (e: React.DragEvent, dayIndex: number, hour: number) => {
    e.preventDefault();
    
    // Case 1: Dragging an existing event
    if (draggedEvent) {
      const event = events.find(ev => ev.id === draggedEvent);
      if (!event) return;

      const duration = event.end.getTime() - event.start.getTime();
      const newStart = new Date(weekDays[dayIndex]);
      newStart.setHours(hour, 0, 0, 0);
      const newEnd = new Date(newStart.getTime() + duration);

      setEvents(prev => prev.map(ev => ev.id === draggedEvent ? { ...ev, start: newStart, end: newEnd } : ev));
      setDraggedEvent(null);
      return;
    }

    // Case 2: Dragging an Entity (to create new event with Sort selection)
    if (draggedEntity) {
      const dateStr = weekDays[dayIndex].toISOString().split('T')[0];
      const startTimeStr = `${hour.toString().padStart(2, '0')}:00`;
      const endTimeStr = `${(hour + 1).toString().padStart(2, '0')}:00`;
      
      setNewEvent({ 
        title: draggedEntity.name, 
        date: dateStr, 
        startTime: startTimeStr, 
        endTime: endTimeStr, 
        type: 'work',
        entityId: draggedEntity.id,
        sortId: '' // User needs to select Sort
      });
      setShowCreateModal(true);
      setDraggedEntity(null);
    }
  };

  const handleCreateEvent = () => {
    const id = Math.random().toString(36).substr(2, 9);
    const entity = entities.find(e => e.id === newEvent.entityId);
    const sort = sorts.find(s => s.id === newEvent.sortId);
    
    // Construct title from Entity and Sort
    const title = entity && sort ? `${entity.name} - ${sort.name}` : newEvent.title;
    const color = 'indigo'; // Could be dynamic

    const start = new Date(`${newEvent.date}T${newEvent.startTime}:00`);
    const end = new Date(`${newEvent.date}T${newEvent.endTime}:00`);
    
    setEvents([...events, { id, title, start, end, type: newEvent.type, color }]);
    setShowCreateModal(false);
    setNewEvent({ title: '', date: '', startTime: '09:00', endTime: '10:00', type: 'work', entityId: '', sortId: '' });
  };

  // Time Selection Logic (Simplified for click-to-create range)
  const handleGridMouseDown = (dayIndex: number, hour: number, e: React.MouseEvent) => {
    if (e.button === 0) {
      const dateStr = weekDays[dayIndex].toISOString().split('T')[0];
      const startTimeStr = `${hour.toString().padStart(2, '0')}:00`;
      const endTimeStr = `${(hour + 1).toString().padStart(2, '0')}:00`;
      
      setNewEvent({ 
        title: '', 
        date: dateStr, 
        startTime: startTimeStr, 
        endTime: endTimeStr, 
        type: 'work', 
        entityId: '', 
        sortId: '' 
      });
      setShowCreateModal(true);
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 relative">
      {/* Create Event Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-md rounded-2xl border border-border p-6 space-y-4 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-text-primary">
                {newEvent.entityId ? '配置任务' : '添加日程'}
              </h3>
              
              <div className="space-y-4">
                {newEvent.entityId ? (
                  <div className="p-4 rounded-xl bg-bg-secondary border border-border flex items-center gap-4">
                    <div className="text-2xl">
                      {entities.find(e => e.id === newEvent.entityId)?.icon}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-text-primary">{entities.find(e => e.id === newEvent.entityId)?.name}</p>
                          <p className="text-xs text-text-secondary">请选择要执行的任务</p>
                        </div>
                        <button 
                          onClick={() => setNewEvent({...newEvent, entityId: '', sortId: ''})}
                          className="text-xs text-text-secondary hover:text-accent transition-colors"
                        >
                          更换
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-text-secondary uppercase">选择 Entity (工作空间)</label>
                      <div className="grid grid-cols-1 gap-2 mt-2 max-h-40 overflow-y-auto custom-scrollbar">
                        {entities.map(entity => (
                          <button
                            key={entity.id}
                            onClick={() => setNewEvent({...newEvent, entityId: entity.id})}
                            className="p-3 rounded-xl border border-border bg-bg-secondary hover:border-accent/50 text-left transition-all flex items-center gap-3 group"
                          >
                            <div className="text-xl group-hover:scale-110 transition-transform">{entity.icon}</div>
                            <div>
                              <p className="text-sm font-bold text-text-primary">{entity.name}</p>
                              <p className="text-[10px] text-text-secondary">{entity.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border"></span>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-text-secondary">或者</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-text-secondary uppercase">自定义标题</label>
                      <input 
                        type="text" 
                        value={newEvent.title}
                        onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                        className="w-full mt-1 bg-bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:border-accent outline-none transition-colors text-text-primary"
                        placeholder="输入日程标题"
                      />
                    </div>
                  </div>
                )}

                {newEvent.entityId && (
                  <div>
                    <label className="text-xs font-bold text-text-secondary uppercase">选择任务 (绑定实例)</label>
                    <div className="grid grid-cols-1 gap-2 mt-2 max-h-40 overflow-y-auto custom-scrollbar">
                      {sorts.filter(s => s.entity_id === newEvent.entityId).length > 0 ? (
                        sorts.filter(s => s.entity_id === newEvent.entityId).map(sort => (
                          <button
                            key={sort.id}
                            onClick={() => setNewEvent({...newEvent, sortId: sort.id})}
                            className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                              newEvent.sortId === sort.id 
                                ? 'bg-accent/10 border-accent text-accent' 
                                : 'bg-bg-secondary border-border hover:border-text-secondary text-text-primary'
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full ${newEvent.sortId === sort.id ? 'bg-accent' : 'bg-indigo-500'}`}></div>
                            <span className="text-sm font-bold">{sort.name}</span>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-text-secondary text-sm bg-bg-secondary rounded-xl border border-border border-dashed">
                          暂无可用任务
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-text-secondary uppercase">开始时间</label>
                    <input 
                      type="time" 
                      value={newEvent.startTime}
                      onChange={e => setNewEvent({...newEvent, startTime: e.target.value})}
                      className="w-full mt-1 bg-bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:border-accent outline-none text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-secondary uppercase">结束时间</label>
                    <input 
                      type="time" 
                      value={newEvent.endTime}
                      onChange={e => setNewEvent({...newEvent, endTime: e.target.value})}
                      className="w-full mt-1 bg-bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:border-accent outline-none text-text-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 py-2 rounded-lg hover:bg-bg-secondary text-text-secondary font-bold text-sm transition-colors">取消</button>
                <button 
                  onClick={handleCreateEvent} 
                  disabled={newEvent.entityId && !newEvent.sortId}
                  className="flex-1 py-2 rounded-lg bg-accent text-white font-bold text-sm hover:bg-accent-hover shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  确认添加
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar - Templates List */}
      <div className="w-64 flex-shrink-0 space-y-6">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-text-primary">可用 Entity</h3>
            <button className="p-1.5 rounded-lg hover:bg-bg-secondary text-text-secondary transition-colors">
              <Plus size={16} />
            </button>
          </div>
          <div className="space-y-3">
            {entities.map(entity => (
              <div 
                key={entity.id}
                draggable
                onDragStart={(e) => handleEntityDragStart(e, entity)}
                className="p-3 rounded-xl bg-bg-secondary border border-border hover:border-accent/50 cursor-grab active:cursor-grabbing group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center text-lg shadow-sm">
                    {entity.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary group-hover:text-accent transition-colors">{entity.name}</p>
                    <p className="text-[10px] text-text-secondary">{entity.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={16} className="text-indigo-500" />
            <span className="text-xs font-bold text-indigo-500">智能排程建议</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            根据您的工作习惯，建议在 <span className="text-text-primary font-bold">周三下午</span> 安排 "数据分析" 任务，效率通常最高。
          </p>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-grow bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-text-primary">2025年1月</h2>
            <div className="flex bg-bg-secondary rounded-lg p-1">
              <button 
                onClick={() => setView('day')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${view === 'day' ? 'bg-card text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
              >
                日
              </button>
              <button 
                onClick={() => setView('week')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${view === 'week' ? 'bg-card text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
              >
                周
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg hover:bg-bg-secondary text-text-secondary transition-colors">
              <ArrowUp className="-rotate-90" size={18} />
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-bg-secondary text-sm font-bold text-text-primary hover:bg-border transition-colors">
              今天
            </button>
            <button className="p-2 rounded-lg hover:bg-bg-secondary text-text-secondary transition-colors">
              <ArrowUp className="rotate-90" size={18} />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-grow overflow-y-auto relative custom-scrollbar">
          <div className="flex min-w-[800px]">
            {/* Time Column */}
            <div className="w-16 flex-shrink-0 border-r border-border bg-bg-secondary/30">
              <div className="h-10 border-b border-border"></div> {/* Header spacer */}
              {HOURS.map(hour => (
                <div key={hour} className="h-[60px] border-b border-border text-xs text-text-secondary flex items-start justify-center pt-2">
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Days Columns */}
            <div className="flex-grow grid grid-cols-7 divide-x divide-border">
              {weekDays.map((day, dayIndex) => (
                <div key={dayIndex} className="flex flex-col">
                  {/* Day Header */}
                  <div className={`h-10 border-b border-border flex flex-col items-center justify-center ${
                    day.getDate() === 8 ? 'bg-accent/5' : 'bg-bg-secondary/10'
                  }`}>
                    <span className="text-[10px] font-bold text-text-secondary uppercase">{DAYS[dayIndex]}</span>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                      day.getDate() === 8 ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'text-text-primary'
                    }`}>
                      {day.getDate()}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div className="relative flex-grow">
                    {HOURS.map(hour => (
                      <div 
                        key={hour} 
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, dayIndex, hour)}
                        onMouseDown={(e) => handleGridMouseDown(dayIndex, hour, e)}
                        className="h-[60px] border-b border-border hover:bg-bg-secondary/50 transition-colors relative group"
                      >
                        {/* Plus icon on hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                          <Plus size={14} className="text-text-secondary/50" />
                        </div>
                      </div>
                    ))}

                    {/* Events */}
                    {events.filter(ev => ev.start.getDate() === day.getDate()).map(ev => {
                      const startHour = ev.start.getHours();
                      const durationHours = (ev.end.getTime() - ev.start.getTime()) / (1000 * 60 * 60);
                      const top = startHour * CELL_HEIGHT;
                      const height = durationHours * CELL_HEIGHT;

                      return (
                        <div
                          key={ev.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, ev.id)}
                          className={`absolute left-1 right-1 rounded-lg p-2 text-xs border cursor-move shadow-sm hover:shadow-md transition-all z-10 overflow-hidden ${
                            ev.color === 'rose' ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-300' :
                            ev.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-300' :
                            'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-300'
                          }`}
                          style={{ top: `${top}px`, height: `${height - 2}px` }}
                        >
                          <div className={`w-1 h-full absolute left-0 top-0 ${
                            ev.color === 'rose' ? 'bg-rose-500' :
                            ev.color === 'emerald' ? 'bg-emerald-500' :
                            'bg-indigo-500'
                          }`}></div>
                          <p className="font-bold pl-2 truncate">{ev.title}</p>
                          <p className="pl-2 opacity-70 truncate">{ev.start.getHours()}:00 - {ev.end.getHours()}:00</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HistoryView = ({ history }: { history: ExecutionRecord[] }) => (
  <div className="space-y-8">
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">执行历史</h2>
        <p className="text-slate-400">查看所有项目经理的执行日志和结果</p>
      </div>
      <button className="px-4 py-2 rounded-lg bg-white/5 text-sm font-medium hover:bg-white/10 transition-colors">导出报告</button>
    </div>

    <div className="space-y-4">
      {history.map(rec => (
        <Card key={rec.id} className="hover:border-accent/30 transition-all">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`mt-1 w-2 h-2 rounded-full ${rec.status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold">{rec.instance_name}</h4>
                  <Badge variant={rec.status === 'success' ? 'success' : 'danger'}>
                    {rec.status === 'success' ? '成功' : '失败'}
                  </Badge>
                </div>
                <p className="text-sm text-slate-400">{rec.entity_name} | 触发：{rec.trigger_type === 'calendar' ? '日历自动' : '手动'}</p>
                <div className="flex gap-4 mt-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><History size={12} /> 耗时：{rec.duration}s</span>
                  <span className="flex items-center gap-1"><Zap size={12} /> 消耗：{rec.tokens_used} tokens</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-lg bg-white/5 text-sm font-medium hover:bg-white/10">查看日志</button>
              <button className="px-4 py-2 rounded-lg bg-accent text-sm font-medium hover:bg-accent-hover">查看报告</button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const LibraryView = ({ instances, onCreateMoPA }: { instances: PAInstance[], onCreateMoPA: () => void }) => (
  <div className="space-y-8">
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">我的项目经理</h2>
        <p className="text-slate-400">管理您创建和获取的 AI 助手</p>
      </div>
      <button 
        onClick={onCreateMoPA}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-sm font-medium hover:bg-accent-hover transition-colors"
      >
        <Plus size={18} /> 创建新的
      </button>
    </div>

    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">我创建的</h3>
        <div className="grid grid-cols-1 gap-4">
          {instances.filter(i => i.user_id === 'user_001').map(inst => (
            <Card key={inst.id} className="hover:border-accent/30 transition-all">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-2xl">
                    {inst.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">{inst.instance_name}</h4>
                    <p className="text-sm text-slate-400 mb-3">使用中：听觉感知研究</p>
                    <div className="flex gap-4 text-xs text-slate-500">
                      <span>执行次数：{inst.execution_count}次</span>
                      <span>成功率：95%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400"><Settings size={18} /></button>
                  <button className="px-4 py-2 rounded-lg bg-white/5 text-sm font-medium hover:bg-white/10">查看记录</button>
                  <button className="px-4 py-2 rounded-lg bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20">分享到社区</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const PAConfigurator = ({ template, onCancel, onComplete }: { template: PATemplate, onCancel: () => void, onComplete: (config: any) => void }) => {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<any>({
    instanceName: `${template.name} 实例`,
    binding: {
      entityId: (template as any)._entityId || 'ent_001',
      sortId: (template as any)._sortId || 'sort_001',
      workingDirectory: '~/Research/HearingPerception/'
    },
    skills: [], // SkillInPA[]
    skillConfigs: {}, // Map of skillId -> { triggerConfig, parameters, afterExecutionBehavior, outputConfig }
  });
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);

  // Fetch all skills for lookup
  useEffect(() => {
    const fetchAllSkills = async () => {
      const res = await fetch('/api/skills');
      setAllSkills(await res.json());
    };
    fetchAllSkills();
  }, []);

  // Initialize skills from template
  useEffect(() => {
    if (template.skills) {
      const initialSkills: SkillInPA[] = template.skills.map((s, i) => {
        const instanceId = `${s.id}_${i}_${Date.now()}`;
        return {
          instanceId,
          skillId: s.id,
          order: i + 1,
          chainMode: i === template.skills!.length - 1 ? 'end' : 'auto',
        };
      });
      
      const initialSkillConfigs: Record<string, any> = {};
      initialSkills.forEach((skillInPA, i) => {
        const s = template.skills![i];
        initialSkillConfigs[skillInPA.instanceId] = {
          triggerConfig: s.triggerConfig,
          parameters: s.parameters.reduce((acc: any, p) => ({ ...acc, [p.key]: p.defaultValue }), {}),
          afterExecutionBehavior: s.afterExecutionBehavior,
          outputConfig: s.outputConfig
        };
      });

      setConfig((prev: any) => ({
        ...prev,
        skills: initialSkills,
        skillConfigs: initialSkillConfigs
      }));
    }
  }, [template]);

  const steps = [
    { id: 1, name: '绑定与编排', icon: Box, desc: '设置工作空间与流程' },
    { id: 2, name: '触发配置', icon: Zap, desc: '设置 Skill 触发条件' },
    { id: 3, name: '参数与输出', icon: Settings, desc: '调整执行细节' },
    { id: 4, name: '权限确认', icon: Shield, desc: '系统与第三方授权' },
    { id: 5, name: '完成', icon: CheckCircle2, desc: '保存并启用' },
  ];

  const updateSkillInPA = (instanceId: string, patch: Partial<SkillInPA>) => {
    setConfig((prev: any) => ({
      ...prev,
      skills: prev.skills.map((s: SkillInPA) => s.instanceId === instanceId ? { ...s, ...patch } : s)
    }));
  };

  const updateSkillConfig = (instanceId: string, patch: any) => {
    setConfig((prev: any) => ({
      ...prev,
      skillConfigs: {
        ...prev.skillConfigs,
        [instanceId]: { ...prev.skillConfigs[instanceId], ...patch }
      }
    }));
  };

  const addSkill = (skill: Skill) => {
    const instanceId = `${skill.id}_${Date.now()}`;
    const newSkillInPA: SkillInPA = {
      instanceId,
      skillId: skill.id,
      order: config.skills.length + 1,
      chainMode: 'auto',
    };
    
    setConfig((prev: any) => ({
      ...prev,
      skills: [...prev.skills, newSkillInPA],
      skillConfigs: {
        ...prev.skillConfigs,
        [instanceId]: {
          triggerConfig: skill.triggerConfig,
          parameters: (skill.parameters || []).reduce((acc: any, p) => ({ ...acc, [p.key]: p.defaultValue }), {}),
          afterExecutionBehavior: skill.afterExecutionBehavior,
          outputConfig: skill.outputConfig
        }
      }
    }));
    setIsAddingSkill(false);
  };

  const removeSkill = (instanceId: string) => {
    setConfig((prev: any) => {
      const newSkills = prev.skills.filter((s: any) => s.instanceId !== instanceId).map((s: any, i: number) => ({ ...s, order: i + 1 }));
      const newConfigs = { ...prev.skillConfigs };
      delete newConfigs[instanceId];
      return {
        ...prev,
        skills: newSkills,
        skillConfigs: newConfigs
      };
    });
  };

  const reorderSkill = (instanceId: string, direction: 'up' | 'down') => {
    const index = config.skills.findIndex((s: any) => s.instanceId === instanceId);
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === config.skills.length - 1) return;

    const newSkills = [...config.skills];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSkills[index], newSkills[targetIndex]] = [newSkills[targetIndex], newSkills[index]];
    
    setConfig((prev: any) => ({
      ...prev,
      skills: newSkills.map((s, i) => ({ ...s, order: i + 1 }))
    }));
  };

  const renderTriggerConfig = (instanceId: string, skill: Skill) => {
    const current = config.skillConfigs[instanceId]?.triggerConfig || skill.triggerConfig;
    const update = (patch: any) => {
      updateSkillConfig(instanceId, { triggerConfig: { ...current, ...patch } });
    };

    return (
      <div className="space-y-6 p-6 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Zap size={20} />
          </div>
          <div>
            <h4 className="font-bold">触发配置</h4>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Trigger Configuration</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">执行模式</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'auto', label: '自动执行', desc: '发现即运行' },
                { id: 'manual', label: '手动确认', desc: '推送通知' },
                { id: 'semi-auto', label: '半自动', desc: '需二次确认' }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => update({ executionMode: mode.id })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    current.executionMode === mode.id 
                      ? 'bg-accent/10 border-accent/50 text-accent' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <p className="text-xs font-bold">{mode.label}</p>
                  <p className="text-[10px] opacity-60 mt-0.5">{mode.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {skill.triggerConfig?.watchConfig?.fileWatch?.enabled && (
            <div className="space-y-3 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <HardDrive size={14} />
                <span>文件监听配置</span>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">监听路径 (相对于工作目录)</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={current.watchConfig.fileWatch?.paths.join(', ') || ''}
                    onChange={(e) => update({ 
                      watchConfig: { 
                        ...current.watchConfig, 
                        fileWatch: { ...current.watchConfig.fileWatch, paths: e.target.value.split(',').map(s => s.trim()) } 
                      } 
                    })}
                    className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-accent outline-none"
                    placeholder="例如: recordings/"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">文件匹配模式</label>
                <input 
                  type="text"
                  value={current.watchConfig.fileWatch?.patterns.join(', ') || ''}
                  onChange={(e) => update({ 
                    watchConfig: { 
                      ...current.watchConfig, 
                      fileWatch: { ...current.watchConfig.fileWatch, patterns: e.target.value.split(',').map(s => s.trim()) } 
                    } 
                  })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-accent outline-none"
                  placeholder="例如: *.m4a, *.mp3"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderChainingConfig = (instanceId: string, skill: Skill) => {
    const skillInPA = config.skills.find((s: any) => s.instanceId === instanceId);
    if (!skillInPA) return null;

    return (
      <div className="space-y-6 p-6 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Share2 size={20} />
          </div>
          <div>
            <h4 className="font-bold">执行后行为</h4>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">After Execution Behavior</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">串联模式</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'auto', label: '自动下一步', desc: '执行完立即触发后续' },
                { id: 'manual', label: '手动下一步', desc: '需用户确认后继续' },
                { id: 'independent', label: '独立运行', desc: '不自动触发后续' },
                { id: 'end', label: '在此结束', desc: '作为流程终点' }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => updateSkillInPA(instanceId, { chainMode: mode.id as any })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    skillInPA.chainMode === mode.id 
                      ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <p className="text-xs font-bold">{mode.label}</p>
                  <p className="text-[10px] opacity-60 mt-0.5">{mode.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };
  const renderParameter = (instanceId: string, param: Parameter) => {
    if (!param.exposedToUser) return null;

    const value = config.skillConfigs[instanceId]?.parameters[param.key] ?? param.defaultValue;
    const onChange = (val: any) => {
      updateSkillConfig(instanceId, { 
        parameters: { ...config.skillConfigs[instanceId].parameters, [param.key]: val } 
      });
    };

    return (
      <div key={param.key} className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{param.name}</label>
          {param.required && <span className="text-[10px] text-accent font-bold">必填</span>}
        </div>
        
        {param.type === 'select' && (
          <select 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-accent outline-none transition-all"
          >
            {param.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        )}

        {param.type === 'multiselect' && (
          <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
            {param.options?.map(opt => (
              <button
                key={opt.value}
                onClick={() => {
                  const current = Array.isArray(value) ? value : [];
                  const next = current.includes(opt.value) 
                    ? current.filter(v => v !== opt.value)
                    : [...current, opt.value];
                  onChange(next);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  (Array.isArray(value) && value.includes(opt.value))
                    ? 'bg-accent text-white shadow-lg shadow-accent/20'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {param.type === 'boolean' && (
          <button
            onClick={() => onChange(!value)}
            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
              value ? 'bg-accent/10 border-accent/50 text-accent' : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            <span className="text-sm font-medium">{value ? '已启用' : '已禁用'}</span>
            <div className={`w-10 h-5 rounded-full relative transition-all ${value ? 'bg-accent' : 'bg-slate-700'}`}>
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${value ? 'right-1' : 'left-1'}`} />
            </div>
          </button>
        )}

        {param.type === 'file_path' && (
          <div className="flex gap-2">
            <input 
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-accent outline-none"
            />
            <button className="px-4 py-2 rounded-xl bg-white/10 text-xs font-bold hover:bg-white/20">浏览</button>
          </div>
        )}

        {param.hint && <p className="text-[10px] text-slate-500 italic">{param.hint}</p>}
      </div>
    );
  };

  const renderOutputConfig = (instanceId: string, output: FileOutputConfig) => {
    const savedConfig = config.skillConfigs[instanceId]?.outputConfig?.fileOutput;
    const current = {
      format: savedConfig?.format || output.defaultFormat,
      path: savedConfig?.path || output.defaultPath,
      content: savedConfig?.content || Object.fromEntries(Object.entries(output.contentConfig || {}).map(([k, v]) => [k, v.defaultValue]))
    };

    const update = (patch: any) => {
      updateSkillConfig(instanceId, { 
        outputConfig: { 
          ...config.skillConfigs[instanceId].outputConfig, 
          fileOutput: { ...current, ...patch } 
        } 
      });
    };

    return (
      <div className="mt-6 p-6 rounded-2xl bg-accent/5 border border-accent/10 space-y-6">
        <div className="flex items-center gap-2 text-accent">
          <Box size={16} />
          <h5 className="text-xs font-bold uppercase tracking-widest">输出配置</h5>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {output.allowFormatSelection && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">输出格式</label>
              <div className="flex gap-2">
                {output.supportedFormats.map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => update({ format: fmt })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      current.format === fmt ? 'bg-accent text-white' : 'bg-white/5 text-slate-500'
                    }`}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {output.allowPathEdit && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">保存路径</label>
              <input 
                type="text"
                value={current.path}
                onChange={(e) => update({ path: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs focus:border-accent outline-none"
              />
            </div>
          )}
        </div>

        {output.contentConfig && (
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase">内容选项</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(output.contentConfig).map(([key, item]) => {
                if (!item.exposedToUser) return null;
                return (
                  <button
                    key={key}
                    onClick={() => update({ content: { ...current.content, [key]: !current.content[key] } })}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      current.content[key] ? 'bg-white/10 border-white/20' : 'bg-white/5 border-transparent opacity-50'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${current.content[key] ? 'bg-accent border-accent' : 'border-slate-600'}`}>
                      {current.content[key] && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold">{item.label}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{item.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-bg/90 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="glass w-full max-w-5xl h-full max-h-[850px] overflow-hidden flex flex-col rounded-[32px] shadow-2xl shadow-black/50 border-white/5"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-border flex justify-between items-center bg-white/2">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-indigo-600 flex items-center justify-center text-3xl shadow-xl shadow-accent/20">
              {template.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">{template.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="default">{template.category === 'research' ? '科研' : '社交媒体'}</Badge>
                <span className="text-xs text-slate-500 font-medium">版本 {template.id === 'pa_experiment_analyst' ? '1.0.0' : '1.2.0'}</span>
              </div>
            </div>
          </div>
          <button onClick={onCancel} className="p-3 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-grow overflow-hidden">
          {/* Sidebar Steps */}
          <div className="w-64 border-r border-border bg-black/10 p-6 space-y-2 hidden md:block">
            {steps.map((s) => (
              <button
                key={s.id}
                disabled={s.id > step + 1}
                onClick={() => s.id <= step && setStep(s.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left group ${
                  s.id === step 
                    ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                    : s.id < step 
                      ? 'text-emerald-400 hover:bg-white/5' 
                      : 'text-slate-600 hover:bg-white/5'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  s.id === step ? 'bg-white/20' : s.id < step ? 'bg-emerald-500/10' : 'bg-white/5'
                }`}>
                  {s.id < step ? <CheckCircle2 size={18} /> : <s.icon size={18} />}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest">{s.name}</p>
                  <p className={`text-[10px] opacity-60 ${s.id === step ? 'text-white' : 'text-slate-500'}`}>{s.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="flex-grow overflow-y-auto bg-white/[0.01]">
            <div className="p-10 max-w-3xl mx-auto">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <Box size={20} className="text-accent" /> 工作空间与绑定
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">实例名称</label>
                            <input 
                              type="text"
                              value={config.instanceName}
                              onChange={(e) => setConfig((prev: any) => ({ ...prev, instanceName: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accent outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">关联实体 (Entity)</label>
                            <select 
                              value={config.binding.entityId}
                              onChange={(e) => setConfig((prev: any) => ({ ...prev, binding: { ...prev.binding, entityId: e.target.value } }))}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accent outline-none"
                            >
                              <option value="ent_001">听觉感知研究</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">关联任务</label>
                            <select 
                              value={config.binding.sortId}
                              onChange={(e) => setConfig((prev: any) => ({ ...prev, binding: { ...prev.binding, sortId: e.target.value } }))}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accent outline-none"
                            >
                              <option value="sort_001">实验1 - 高音调组</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">工作目录 (Working Directory)</label>
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                value={config.binding.workingDirectory}
                                onChange={(e) => setConfig((prev: any) => ({ ...prev, binding: { ...prev.binding, workingDirectory: e.target.value } }))}
                                className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accent outline-none"
                              />
                              <button className="px-4 py-2 rounded-xl bg-white/10 text-xs font-bold hover:bg-white/20">浏览</button>
                            </div>
                            <p className="text-[10px] text-slate-500 italic">所有 Skill 的输入输出将基于此路径</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 pt-8 border-t border-white/5">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                          <Share2 size={20} className="text-indigo-400" /> 流程编排 (Orchestration)
                        </h3>
                        <button 
                          onClick={() => setIsAddingSkill(true)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-bold hover:bg-accent/20 transition-all"
                        >
                          <Plus size={14} /> 添加 Skill
                        </button>
                      </div>
                      <div className="space-y-4">
                        {config.skills.map((skillInPA: SkillInPA, idx: number) => {
                          const skill = allSkills.find(s => s.id === skillInPA.skillId);
                          if (!skill) return null;
                          return (
                            <div key={skillInPA.instanceId} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group">
                              <div className="flex flex-col gap-1">
                                <button onClick={() => reorderSkill(skillInPA.instanceId, 'up')} className="p-1 hover:bg-white/10 rounded text-slate-500 hover:text-white transition-colors">
                                  <ArrowUp size={12} />
                                </button>
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-slate-500">
                                  {idx + 1}
                                </div>
                                <button onClick={() => reorderSkill(skillInPA.instanceId, 'down')} className="p-1 hover:bg-white/10 rounded text-slate-500 hover:text-white transition-colors">
                                  <ArrowDown size={12} />
                                </button>
                              </div>
                              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-xl">
                                {skill.icon}
                              </div>
                              <div className="flex-grow">
                                <p className="text-sm font-bold">{skill.name}</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">{skill.category}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <select 
                                  value={skillInPA.chainMode}
                                  onChange={(e) => updateSkillInPA(skillInPA.instanceId, { chainMode: e.target.value as any })}
                                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-accent"
                                >
                                  <option value="auto">自动流转</option>
                                  <option value="manual">手动确认</option>
                                  <option value="independent">独立运行</option>
                                  <option value="end">流程终点</option>
                                </select>
                                <button 
                                  onClick={() => removeSkill(skillInPA.instanceId)}
                                  className="p-2 rounded-lg bg-rose-500/10 text-rose-400 opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 transition-all"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {isAddingSkill && (
                      <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-8">
                        <div className="glass w-full max-w-4xl max-h-[700px] overflow-hidden flex flex-col rounded-3xl border-white/10">
                          <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-xl font-bold">添加 Skill 到项目经理</h3>
                            <button onClick={() => setIsAddingSkill(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                              <X size={20} />
                            </button>
                          </div>
                          <div className="flex-grow overflow-y-auto p-6">
                            <SkillLibraryView onUse={addSkill} />
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Zap size={20} className="text-accent" /> Skill 触发配置
                    </h3>
                    <div className="space-y-12">
                      {config.skills.map((skillInPA: SkillInPA) => {
                        const skill = allSkills.find(s => s.id === skillInPA.skillId);
                        if (!skill) return null;
                        return (
                          <div key={skillInPA.instanceId} className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-lg">
                                {skill.icon}
                              </div>
                              <h4 className="font-bold text-slate-200">{skill.name}</h4>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {renderTriggerConfig(skillInPA.instanceId, skill)}
                              {renderChainingConfig(skillInPA.instanceId, skill)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Settings size={20} className="text-accent" /> 参数与输出配置
                    </h3>
                    <div className="space-y-12">
                      {config.skills.map((skillInPA: SkillInPA) => {
                        const skill = allSkills.find(s => s.id === skillInPA.skillId);
                        if (!skill) return null;
                        return (
                          <div key={skillInPA.instanceId} className="space-y-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-lg">
                                {skill.icon}
                              </div>
                              <h4 className="font-bold text-slate-200">{skill.name}</h4>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              <div className="space-y-6">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                  <Settings size={14} /> 运行参数
                                </div>
                                <div className="space-y-6 p-6 rounded-2xl bg-white/5 border border-white/10">
                                  {(skill.parameters && skill.parameters.length > 0) ? (
                                    (skill.parameters || []).map(p => renderParameter(skillInPA.instanceId, p))
                                  ) : (
                                    <p className="text-xs text-slate-500 italic">此 Skill 无需配置参数</p>
                                  )}
                                </div>
                              </div>
                              <div className="space-y-6">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                  <Box size={14} /> 输出结果
                                </div>
                                {skill.outputConfig?.fileOutput ? (
                                  renderOutputConfig(skillInPA.instanceId, skill.outputConfig.fileOutput)
                                ) : (
                                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                    <p className="text-xs text-slate-500 italic">此 Skill 仅在内存中输出数据</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Shield size={20} className="text-emerald-400" /> 权限确认与安全审查
                    </h3>
                    <Card className="bg-emerald-500/5 border-emerald-500/20">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <Shield size={24} />
                          </div>
                          <div>
                            <h4 className="font-bold">系统权限汇总</h4>
                            <p className="text-xs text-slate-400">以下是此项目经理运行所需的全部系统权限</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { id: 'file_read', label: '文件读取', desc: '读取工作目录下的实验数据' },
                            { id: 'file_write', label: '文件写入', desc: '保存分析报告与转录文本' },
                            { id: 'notification', label: '系统通知', desc: '在任务完成或需要确认时推送' },
                            { id: 'network', label: '网络访问', desc: '调用语音识别与数据分析 API' },
                          ].map(perm => (
                            <div key={perm.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                <CheckCircle2 size={16} />
                              </div>
                              <div>
                                <p className="text-sm font-bold">{perm.label}</p>
                                <p className="text-[10px] text-slate-500">{perm.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>

                    <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="text-amber-400 shrink-0" size={20} />
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-amber-200">安全提示</p>
                          <p className="text-xs text-amber-200/60 leading-relaxed">
                            此项目经理将访问您的本地文件系统。请确保工作目录设置正确，且您信任此项目经理模板的来源。
                            执行过程中产生的所有数据将保存在您的本地设备或指定的云端空间。
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 5 && (
                  <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-10 py-10">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-accent blur-3xl opacity-20 animate-pulse"></div>
                      <div className="relative w-24 h-24 rounded-3xl bg-accent flex items-center justify-center text-white text-5xl shadow-2xl shadow-accent/40">
                        <CheckCircle2 size={48} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-3xl font-bold">配置完成！</h3>
                      <p className="text-slate-400">您的项目经理实例「{config.instanceName}」已准备就绪</p>
                    </div>
                    <Card className="max-w-md mx-auto text-left space-y-4 bg-white/5">
                      <div className="flex justify-between items-center pb-4 border-b border-white/5">
                        <span className="text-xs font-bold text-slate-500 uppercase">绑定任务</span>
                        <span className="text-sm font-bold text-slate-200">实验1 - 高音调组</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-white/5">
                        <span className="text-xs font-bold text-slate-500 uppercase">Skill 数量</span>
                        <span className="text-sm font-bold text-slate-200">{template.skills?.length} 个</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase">状态</span>
                        <Badge variant="success">已启用</Badge>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-border flex justify-between items-center bg-white/2">
          <button 
            onClick={() => step > 1 && setStep(step - 1)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-slate-400 hover:text-white transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            <ChevronRight className="rotate-180" size={18} />
            上一步
          </button>
          <div className="flex gap-4">
            {step < 5 ? (
              <button 
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-2 px-10 py-3 rounded-2xl bg-accent text-sm font-bold hover:bg-accent-hover shadow-xl shadow-accent/20 transition-all group"
              >
                继续
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button 
                onClick={() => onComplete(config)}
                className="flex items-center gap-2 px-10 py-3 rounded-2xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 transition-all group"
              >
                完成并启用
                <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<ExecutionRecord[]>([]);
  const [instances, setInstances] = useState<PAInstance[]>([]);
  const [templates, setTemplates] = useState<PATemplate[]>([]);
  const [entities, setEntities] = useState<Entity[]>(MOCK_ENTITIES);
  const [sorts, setSorts] = useState<Sort[]>(MOCK_SORTS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [configuringPA, setConfiguringPA] = useState<PATemplate | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    console.log('App component mounted');
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const fetchData = async () => {
      const [uRes, sRes, hRes, iRes, tRes] = await Promise.all([
        fetch('/api/user'),
        fetch('/api/dashboard/stats'),
        fetch('/api/execution/history'),
        fetch('/api/pa/instances'),
        fetch('/api/pa/templates')
      ]);
      setUser(await uRes.json());
      setStats(await sRes.json());
      setHistory(await hRes.json());
      setInstances(await iRes.json());
      setTemplates(await tRes.json());
    };
    fetchData();
  }, []);

  const handleSelectEntity = (entity: Entity) => {
    setSelectedEntity(entity);
    setActiveTab('workspace');
  };

  if (isMobile) {
    return <MobileApp />;
  }

  return (
    <div className="min-h-screen flex bg-bg overflow-hidden">
      {/* Pricing Modal */}
      <AnimatePresence>
        {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
      </AnimatePresence>

      {/* Configurator Modal */}
      {configuringPA && (
        <PAConfigurator 
          template={configuringPA} 
          onCancel={() => setConfiguringPA(null)} 
              onComplete={async (config) => {
            try {
              const skillsWithConfig = config.skills.map((s: any) => ({
                ...s,
                config: config.skillConfigs[s.instanceId]
              }));
              const res = await fetch('/api/pa/instances', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  templateId: configuringPA.id,
                  instanceName: config.instanceName,
                  icon: configuringPA.icon,
                  skills: skillsWithConfig,
                  binding: config.binding
                })
              });
              if (res.ok) {
                const { id: instanceId } = await res.json();
                
                // Link to sort if applicable
                const sortId = (configuringPA as any)._sortId;
                if (sortId) {
                  await fetch(`/api/sorts/${sortId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pa_instance_id: instanceId })
                  });
                }

                const iRes = await fetch('/api/pa/instances');
                setInstances(await iRes.json());
                setConfiguringPA(null);
                setActiveTab('library');
              }
            } catch (error) {
              console.error('Failed to save 项目经理 instance:', error);
            }
          }}
        />
      )}

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-card border-r border-border h-screen flex flex-col relative z-50"
      >
        <div className="p-6 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'hidden'}`}>
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
              <Zap size={20} className="text-white fill-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-text-primary">OpenClaw</h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-grow px-4 space-y-2 mt-4">
          <SidebarItem icon={LayoutDashboard} label="工作台" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Search} label="项目经理市场" active={activeTab === 'market'} onClick={() => setActiveTab('market')} />
          <SidebarItem icon={Cpu} label="Skill 库" active={activeTab === 'skills'} onClick={() => setActiveTab('skills')} />
          <SidebarItem icon={Library} label="我的项目经理" active={activeTab === 'library'} onClick={() => setActiveTab('library')} />
          <SidebarItem icon={CalendarIcon} label="日历" active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
          <SidebarItem icon={Smartphone} label="设备管理" active={activeTab === 'devices'} onClick={() => setActiveTab('devices')} />
          <SidebarItem icon={History} label="执行历史" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
        </nav>

        <div className="p-4 mt-auto border-t border-border">
          <div className={`p-4 rounded-2xl bg-bg-secondary border border-border space-y-3 ${!isSidebarOpen && 'hidden'}`}>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Token 消耗</span>
              <span className="text-accent font-bold">97%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-accent w-[97%]"></div>
            </div>
            <button 
              onClick={() => setShowPricing(true)}
              className="w-full py-2 rounded-lg bg-accent text-white text-xs font-bold hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20"
            >
              升级套餐
            </button>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-3 mt-4 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
            <Settings size={20} />
            {isSidebarOpen && <span className="font-medium">设置</span>}
          </button>
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center gap-3 px-4 py-3 mt-2 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            {isSidebarOpen && <span className="font-medium">{theme === 'dark' ? '亮色模式' : '暗色模式'}</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-grow h-screen overflow-y-auto relative">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 glass border-b border-border px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-white/5 text-slate-400">
              <ChevronRight className="rotate-180" size={18} />
            </div>
            <h2 className="font-semibold text-slate-300">
              {activeTab === 'dashboard' && '工作台'}
              {activeTab === 'market' && '项目经理市场'}
              {activeTab === 'skills' && 'Skill 库'}
              {activeTab === 'library' && '我的项目经理'}
              {activeTab === 'calendar' && '日历'}
              {activeTab === 'history' && '执行历史'}
              {activeTab === 'workspace' && '工作空间'}
              {activeTab === 'create-mopa' && '创建我的PA'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full bg-white/5 text-slate-400 hover:text-slate-200 transition-colors relative">
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 border-2 border-bg"></div>
              <Box size={20} />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold">{user?.username}</p>
                <p className="text-[10px] text-accent font-bold uppercase tracking-wider">专业版</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-indigo-600 border-2 border-white/10"></div>
            </div>
          </div>
        </header>

        <div className={activeTab === 'create-mopa' ? "h-[calc(100vh-73px)]" : "p-8 max-w-7xl mx-auto"}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={activeTab === 'create-mopa' ? "h-full" : ""}
            >
              {activeTab === 'dashboard' && (
                <Dashboard 
                  user={user} 
                  stats={stats} 
                  history={history} 
                  instances={instances} 
                  setActiveTab={setActiveTab}
                  setConfiguringPA={setConfiguringPA}
                  templates={templates}
                  entities={entities}
                  onSelectEntity={handleSelectEntity}
                />
              )}
              {activeTab === 'market' && <PAMarket templates={templates} onUse={setConfiguringPA} onCreateMoPA={() => setActiveTab('create-mopa')} />}
              {activeTab === 'skills' && <SkillLibraryView />}
              {activeTab === 'calendar' && <Calendar instances={instances} templates={templates} entities={entities} sorts={sorts} />}
              {activeTab === 'devices' && <DevicesView />}
              {activeTab === 'library' && <LibraryView instances={instances} onCreateMoPA={() => setActiveTab('create-mopa')} />}
              {activeTab === 'history' && <HistoryView history={history} />}
              {activeTab === 'create-mopa' && (
                <CreateMoPAView 
                  onComplete={() => setActiveTab('library')} 
                  onCancel={() => setActiveTab('market')} 
                />
              )}
              {activeTab === 'workspace' && selectedEntity && (
                <EntityWorkspace 
                  entity={selectedEntity} 
                  templates={templates}
                  sorts={sorts}
                  setSorts={setSorts}
                  onBack={() => setActiveTab('dashboard')} 
                  onConfigurePA={(template, sortId) => {
                    setConfiguringPA({ ...template, _sortId: sortId, _entityId: selectedEntity.id } as any);
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
