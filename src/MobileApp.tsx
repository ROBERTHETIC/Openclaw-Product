import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  User as UserIcon, 
  Settings, 
  Plus, 
  ChevronRight, 
  Zap, 
  Search, 
  Bell,
  Menu,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MoreVertical,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Entity, Sort, PAInstance, PATemplate, ExecutionRecord, User } from './types';
import { MOCK_ENTITIES, MOCK_SORTS } from './data/mockData';

// --- Mobile Components ---

const MobileHeader = ({ title, user, onMenuClick, showBack, onBack }: { title: string, user: User | null, onMenuClick: () => void, showBack?: boolean, onBack?: () => void }) => (
  <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border px-4 py-3 flex justify-between items-center">
    <div className="flex items-center gap-3">
      {showBack ? (
        <button onClick={onBack} className="p-1 -ml-1 rounded-full hover:bg-bg-secondary text-text-primary">
          <ChevronRight size={24} className="rotate-180" />
        </button>
      ) : (
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
          <Zap size={18} className="text-white fill-white" />
        </div>
      )}
      <h1 className="text-lg font-bold tracking-tight text-text-primary">{title}</h1>
    </div>
    <div className="flex items-center gap-3">
      <button className="p-2 rounded-full hover:bg-bg-secondary text-text-secondary relative">
        <Bell size={20} />
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 border-2 border-card"></span>
      </button>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-indigo-600 border-2 border-white/10"></div>
    </div>
  </header>
);

const MobileNav = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: '工作台' },
    { id: 'calendar', icon: CalendarIcon, label: '日程' },
    { id: 'entities', icon: Zap, label: '项目经理' },
    { id: 'profile', icon: UserIcon, label: '我的' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border pb-6 pt-2 px-6 flex justify-between items-center z-50">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            activeTab === tab.id ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <tab.icon size={24} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
          <span className="text-[10px] font-medium">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

const MobileCard = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void, key?: React.Key }) => (
  <div 
    onClick={onClick}
    className={`bg-card border border-border rounded-xl p-4 shadow-sm ${className} ${onClick ? 'active:scale-95 transition-transform' : ''}`}
  >
    {children}
  </div>
);

const MobileDashboard = ({ user, entities, sorts, setActiveTab, onAction, onSortClick }: { user: User | null, entities: Entity[], sorts: Sort[], setActiveTab: (tab: string) => void, onAction: (action: string) => void, onSortClick: (sort: Sort) => void }) => (
  <div className="space-y-6 pb-24 px-4 pt-4">
    {/* Welcome Card */}
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white shadow-lg">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl pointer-events-none"></div>
      <div className="relative z-10">
        <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Good Evening</p>
        <h2 className="text-2xl font-bold mb-4">{user?.username || 'Researcher'}</h2>
        <div className="flex gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex-1">
            <p className="text-xs text-indigo-200 mb-1">今日任务</p>
            <p className="text-xl font-bold">3/5</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex-1">
            <p className="text-xs text-indigo-200 mb-1">Token 消耗</p>
            <p className="text-xl font-bold">12%</p>
          </div>
        </div>
      </div>
    </div>

    {/* Quick Actions */}
    <div className="grid grid-cols-4 gap-4">
      {[
        { icon: Plus, label: '新建', color: 'bg-emerald-500', action: 'create' },
        { icon: Search, label: '搜索', color: 'bg-indigo-500', action: 'search' },
        { icon: CalendarIcon, label: '日程', color: 'bg-amber-500', action: 'calendar' },
        { icon: Settings, label: '设置', color: 'bg-slate-500', action: 'settings' },
      ].map((action, i) => (
        <button 
          key={i} 
          onClick={() => action.action === 'calendar' ? setActiveTab('calendar') : onAction(action.action)}
          className="flex flex-col items-center gap-2 group"
        >
          <div className={`w-12 h-12 rounded-2xl ${action.color}/10 flex items-center justify-center text-xl group-active:scale-90 transition-transform`}>
            <action.icon size={20} className={action.color.replace('bg-', 'text-')} />
          </div>
          <span className="text-xs font-medium text-text-secondary">{action.label}</span>
        </button>
      ))}
    </div>

    {/* Recent Sorts */}
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-text-primary">最近任务</h3>
        <button onClick={() => setActiveTab('calendar')} className="text-xs text-accent font-bold">查看全部</button>
      </div>
      {sorts.slice(0, 3).map(sort => (
        <MobileCard key={sort.id} className="flex items-center gap-4" onClick={() => onSortClick(sort)}>
          <div className="w-10 h-10 rounded-lg bg-bg-secondary flex items-center justify-center text-xl">
            {sort.icon}
          </div>
          <div className="flex-grow">
            <h4 className="font-bold text-sm text-text-primary">{sort.name}</h4>
            <p className="text-xs text-text-secondary mt-0.5">2小时前 • 运行中</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
        </MobileCard>
      ))}
    </div>

    {/* Entities Preview */}
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-text-primary">工作空间 (Entities)</h3>
        <button onClick={() => setActiveTab('entities')} className="text-xs text-accent font-bold">管理</button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {entities.map(ent => (
          <div key={ent.id} className="flex-shrink-0 w-64 bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-bg-secondary flex items-center justify-center text-xl">
                {ent.icon}
              </div>
              <div>
                <h4 className="font-bold text-sm text-text-primary">{ent.name}</h4>
                <p className="text-[10px] text-text-secondary uppercase font-bold">运行中</p>
              </div>
            </div>
            <p className="text-xs text-text-secondary line-clamp-2 mb-3">{ent.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-card"></div>
                ))}
              </div>
              <button onClick={() => setActiveTab('entities')} className="p-1.5 rounded-lg bg-accent/10 text-accent">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const MobileCalendar = ({ sorts, onSortClick }: { sorts: Sort[], onSortClick: (sort: Sort) => void }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Generate next 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="flex flex-col h-full bg-bg pb-24">
      {/* Calendar Strip */}
      <div className="bg-card border-b border-border p-4 sticky top-14 z-30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">2025年1月</h2>
          <button className="p-2 bg-bg-secondary rounded-lg text-text-secondary">
            <CalendarIcon size={18} />
          </button>
        </div>
        <div className="flex justify-between">
          {days.map((date, i) => {
            const isSelected = date.getDate() === selectedDate.getDate();
            return (
              <button 
                key={i}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl min-w-[44px] transition-all ${
                  isSelected ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-text-secondary hover:bg-bg-secondary'
                }`}
              >
                <span className="text-[10px] uppercase font-bold opacity-80">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]}
                </span>
                <span className="text-lg font-bold">{date.getDate()}</span>
                {isSelected && <div className="w-1 h-1 rounded-full bg-white mt-1"></div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Agenda View */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock size={14} className="text-accent" />
          <span className="text-xs font-bold text-text-secondary uppercase">09:00 AM</span>
        </div>
        
        {sorts.map((sort, i) => (
          <MobileCard key={sort.id} className="flex gap-4 border-l-4 border-l-accent" onClick={() => onSortClick(sort)}>
            <div className="flex flex-col items-center justify-center min-w-[40px] text-text-secondary">
              <span className="text-xs font-bold">09:00</span>
              <span className="text-[10px]">10:00</span>
            </div>
            <div className="flex-grow">
              <h4 className="font-bold text-sm text-text-primary">{sort.name}</h4>
              <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                <Zap size={12} /> {sort.status === 'active' ? '运行中' : '已完成'}
              </p>
            </div>
            <button className="p-2 rounded-full bg-bg-secondary text-text-secondary">
              <MoreVertical size={16} />
            </button>
          </MobileCard>
        ))}

        <div className="flex items-center gap-2 mb-2 mt-6">
          <Clock size={14} className="text-indigo-500" />
          <span className="text-xs font-bold text-text-secondary uppercase">02:00 PM</span>
        </div>
        
        <MobileCard className="flex gap-4 border-l-4 border-l-indigo-500 opacity-60">
          <div className="flex flex-col items-center justify-center min-w-[40px] text-text-secondary">
            <span className="text-xs font-bold">14:00</span>
            <span className="text-[10px]">15:00</span>
          </div>
          <div className="flex-grow">
            <h4 className="font-bold text-sm text-text-primary">团队周会</h4>
            <p className="text-xs text-text-secondary mt-1">会议室 A</p>
          </div>
        </MobileCard>
      </div>
      
      {/* FAB */}
      <button className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-accent text-white shadow-xl shadow-accent/30 flex items-center justify-center z-40 active:scale-90 transition-transform">
        <Plus size={28} />
      </button>
    </div>
  );
};

const MobileEntities = ({ entities, onEntityClick }: { entities: Entity[], onEntityClick: (entity: Entity) => void }) => (
  <div className="p-4 pb-24 space-y-4">
    <div className="flex items-center gap-2 bg-bg-secondary p-2 rounded-xl mb-4">
      <Search size={18} className="text-text-secondary ml-2" />
      <input 
        type="text" 
        placeholder="搜索项目经理或工作空间..." 
        className="bg-transparent border-none outline-none text-sm w-full text-text-primary placeholder:text-text-secondary"
      />
      <button className="p-2 bg-card rounded-lg shadow-sm">
        <Filter size={16} className="text-text-secondary" />
      </button>
    </div>

    {entities.map(ent => (
      <MobileCard key={ent.id} className="space-y-4" onClick={() => onEntityClick(ent)}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-bg-secondary flex items-center justify-center text-2xl">
            {ent.icon}
          </div>
          <div>
            <h4 className="font-bold text-text-primary">{ent.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase">运行中</span>
              <span className="text-[10px] text-text-secondary">3 个任务</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">{ent.description}</p>
        <div className="pt-4 border-t border-border flex justify-between items-center">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white border-2 border-card">A</div>
            <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center text-[10px] text-white border-2 border-card">B</div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onEntityClick(ent); }} className="px-4 py-2 rounded-lg bg-accent text-white text-xs font-bold shadow-lg shadow-accent/20">
            进入空间
          </button>
        </div>
      </MobileCard>
    ))}
  </div>
);

const MobileEntityDetail = ({ entity, sorts, instances, onAddSort }: { entity: Entity, sorts: Sort[], instances: PAInstance[], onAddSort: () => void }) => (
  <div className="p-4 pb-24 space-y-6">
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-bg-secondary flex items-center justify-center text-4xl shadow-sm">
        {entity.icon}
      </div>
      <div>
        <h2 className="text-xl font-bold text-text-primary">{entity.name}</h2>
        <p className="text-xs text-text-secondary mt-1">{entity.description}</p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <p className="text-xs text-emerald-500 font-bold uppercase mb-1">运行状态</p>
        <p className="text-lg font-bold text-emerald-500">正常运行</p>
      </div>
      <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
        <p className="text-xs text-indigo-500 font-bold uppercase mb-1">活跃任务</p>
        <p className="text-lg font-bold text-indigo-500">{sorts.length}</p>
      </div>
    </div>

    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-text-primary">任务列表</h3>
        <button onClick={onAddSort} className="p-1.5 rounded-lg bg-bg-secondary text-text-secondary hover:text-accent">
          <Plus size={16} />
        </button>
      </div>
      {sorts.length > 0 ? sorts.map(sort => (
        <MobileCard key={sort.id} className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-bg-secondary flex items-center justify-center text-xl">
            {sort.icon}
          </div>
          <div className="flex-grow">
            <h4 className="font-bold text-sm text-text-primary">{sort.name}</h4>
            <p className="text-xs text-text-secondary mt-0.5">Scheduled: {sort.scheduled_date}</p>
          </div>
          <div className={`w-2 h-2 rounded-full ${sort.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
        </MobileCard>
      )) : (
        <div className="text-center py-8 text-text-secondary text-xs">
          暂无任务
        </div>
      )}
    </div>

    <div className="space-y-3">
      <h3 className="font-bold text-text-primary">关联项目经理实例</h3>
      {instances.length > 0 ? instances.map(inst => (
        <MobileCard key={inst.id} className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-bg-secondary flex items-center justify-center text-xl">
            {inst.icon}
          </div>
          <div className="flex-grow">
            <h4 className="font-bold text-sm text-text-primary">{inst.instance_name}</h4>
            <p className="text-xs text-text-secondary mt-0.5">{inst.skills ? inst.skills.length : 0} Skills</p>
          </div>
          <div className={`w-2 h-2 rounded-full ${inst.is_enabled ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
        </MobileCard>
      )) : (
        <div className="text-center py-8 text-text-secondary text-xs">
          暂无关联项目经理
        </div>
      )}
    </div>
  </div>
);

const MobileSortDetail = ({ sort }: { sort: Sort }) => (
  <div className="p-4 pb-24 space-y-6">
    <div className="p-6 rounded-2xl bg-gradient-to-br from-bg-secondary to-card border border-border shadow-sm text-center">
      <div className="w-20 h-20 rounded-full bg-card mx-auto flex items-center justify-center text-4xl shadow-sm mb-4">
        {sort.icon}
      </div>
      <h2 className="text-xl font-bold text-text-primary">{sort.name}</h2>
      <div className="flex justify-center items-center gap-2 mt-2">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${sort.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>
          {sort.status}
        </span>
        <span className="text-xs text-text-secondary">•</span>
        <span className="text-xs text-text-secondary">{sort.duration} mins</span>
      </div>
    </div>

    <div className="space-y-4">
      <h3 className="font-bold text-text-primary">执行日志</h3>
      <div className="bg-card border border-border rounded-xl p-4 space-y-4 font-mono text-xs">
        <div className="flex gap-3">
          <span className="text-slate-400">10:00:05</span>
          <span className="text-emerald-500">INFO</span>
          <span className="text-text-primary">任务 initialized successfully.</span>
        </div>
        <div className="flex gap-3">
          <span className="text-slate-400">10:00:12</span>
          <span className="text-indigo-500">EXEC</span>
          <span className="text-text-primary">Loading 项目经理 instance...</span>
        </div>
        <div className="flex gap-3">
          <span className="text-slate-400">10:05:30</span>
          <span className="text-emerald-500">INFO</span>
          <span className="text-text-primary">Data processing started.</span>
        </div>
      </div>
    </div>

    <div className="fixed bottom-24 left-4 right-4 flex gap-3">
      <button className="flex-1 py-3 rounded-xl bg-bg-secondary text-text-primary font-bold text-sm">暂停任务</button>
      <button className="flex-1 py-3 rounded-xl bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-500/20">终止运行</button>
    </div>
  </div>
);

const MobileProfile = ({ user }: { user: User | null }) => (
  <div className="p-4 pb-24 space-y-6">
    <div className="flex items-center gap-4 mb-6">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-indigo-600 border-4 border-card shadow-lg"></div>
      <div>
        <h2 className="text-xl font-bold text-text-primary">{user?.username || 'User'}</h2>
        <p className="text-xs text-accent font-bold uppercase tracking-wider bg-accent/10 px-2 py-1 rounded-md inline-block mt-1">Pro Plan</p>
      </div>
    </div>

    <div className="space-y-2">
      <h3 className="text-xs font-bold text-text-secondary uppercase ml-1">账户概览</h3>
      <MobileCard className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-text-primary">Token 余额</span>
          <span className="text-sm font-bold text-text-primary">8,420 / 10,000</span>
        </div>
        <div className="h-2 w-full bg-bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-accent w-[84%]"></div>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-border">
          <span className="text-sm font-medium text-text-primary">存储空间</span>
          <span className="text-sm font-bold text-text-primary">4.2 GB / 10 GB</span>
        </div>
      </MobileCard>
    </div>

    <div className="space-y-2">
      <h3 className="text-xs font-bold text-text-secondary uppercase ml-1">设置</h3>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {[
          { label: '通知设置', icon: Bell },
          { label: 'API 密钥管理', icon: Zap },
          { label: '通用设置', icon: Settings },
          { label: '关于 OpenClaw', icon: CheckCircle2 },
        ].map((item, i) => (
          <button key={i} className="w-full flex items-center justify-between p-4 hover:bg-bg-secondary border-b border-border last:border-0 transition-colors">
            <div className="flex items-center gap-3">
              <item.icon size={18} className="text-text-secondary" />
              <span className="text-sm font-medium text-text-primary">{item.label}</span>
            </div>
            <ChevronRight size={16} className="text-text-secondary" />
          </button>
        ))}
      </div>
    </div>
    
    <button className="w-full py-3 rounded-xl bg-rose-500/10 text-rose-500 font-bold text-sm hover:bg-rose-500/20 transition-colors">
      退出登录
    </button>
  </div>
);

// --- Main Mobile App ---

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [entities, setEntities] = useState<Entity[]>(MOCK_ENTITIES);
  const [sorts, setSorts] = useState<Sort[]>(MOCK_SORTS);
  const [instances, setInstances] = useState<PAInstance[]>([]);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  // Navigation State
  const [view, setView] = useState<'main' | 'entity-detail' | 'sort-detail'>('main');
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [selectedSort, setSelectedSort] = useState<Sort | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uRes, iRes] = await Promise.all([
          fetch('/api/user'),
          fetch('/api/pa/instances')
        ]);
        setUser(await uRes.json());
        setInstances(await iRes.json());
      } catch (e) {
        console.error("Failed to fetch mobile data", e);
        setUser({ id: 'u1', username: 'Robert', subscription_plan: 'pro', tokens_total: 10000, tokens_used: 1580 });
      }
    };
    fetchData();
  }, []);

  const handleAction = (action: string) => {
    setActiveModal(action);
  };

  const closeModal = () => setActiveModal(null);

  const navigateToEntity = (entity: Entity) => {
    setSelectedEntity(entity);
    setView('entity-detail');
  };

  const navigateToSort = (sort: Sort) => {
    setSelectedSort(sort);
    setView('sort-detail');
  };

  const goBack = () => {
    setView('main');
    setSelectedEntity(null);
    setSelectedSort(null);
  };

  // Handle Tab Change resets view
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setView('main');
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary font-sans pb-6">
      <MobileHeader 
        title={
          view === 'entity-detail' ? '空间详情' :
          view === 'sort-detail' ? '任务详情' :
          activeTab === 'dashboard' ? '工作台' :
          activeTab === 'calendar' ? '日程管理' :
          activeTab === 'entities' ? '项目经理' : '个人中心'
        } 
        user={user} 
        onMenuClick={() => {}}
        showBack={view !== 'main'}
        onBack={goBack}
      />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={view === 'main' ? activeTab : view}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {view === 'main' && (
            <>
              {activeTab === 'dashboard' && <MobileDashboard user={user} entities={entities} sorts={sorts} setActiveTab={handleTabChange} onAction={handleAction} onSortClick={navigateToSort} />}
              {activeTab === 'calendar' && <MobileCalendar sorts={sorts} onSortClick={navigateToSort} />}
              {activeTab === 'entities' && <MobileEntities entities={entities} onEntityClick={navigateToEntity} />}
              {activeTab === 'profile' && <MobileProfile user={user} />}
            </>
          )}

          {view === 'entity-detail' && selectedEntity && (
            <MobileEntityDetail entity={selectedEntity} sorts={sorts.filter(s => s.entity_id === selectedEntity.id)} instances={instances.filter(inst => inst.binding?.entityId === selectedEntity.id)} onAddSort={() => setActiveModal('create-sort')} />
          )}

          {view === 'sort-detail' && selectedSort && (
            <MobileSortDetail sort={selectedSort} />
          )}
        </motion.div>
      </AnimatePresence>

      {view === 'main' && <MobileNav activeTab={activeTab} setActiveTab={handleTabChange} />}

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl border-t sm:border border-border p-6 space-y-4 shadow-2xl h-[80vh] sm:h-auto overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-text-primary">
                  {activeModal === 'create' && '新建任务'}
                  {activeModal === 'search' && '全局搜索'}
                  {activeModal === 'settings' && '系统设置'}
                </h3>
                <button onClick={closeModal} className="p-2 rounded-full hover:bg-bg-secondary text-text-secondary">
                  <X size={20} />
                </button>
              </div>

              {activeModal === 'create' && (
                <div className="space-y-4">
                  <button 
                    onClick={() => setActiveModal('create-entity')}
                    className="w-full p-4 rounded-xl bg-bg-secondary border border-border flex items-center gap-4 hover:border-accent/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <Zap size={20} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-text-primary">新建工作空间</h4>
                      <p className="text-xs text-text-secondary">创建一个新的项目经理工作空间</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => setActiveModal('create-sort')}
                    className="w-full p-4 rounded-xl bg-bg-secondary border border-border flex items-center gap-4 hover:border-accent/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                      <CalendarIcon size={20} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-text-primary">新建任务</h4>
                      <p className="text-xs text-text-secondary">添加一个新的日程任务</p>
                    </div>
                  </button>
                </div>
              )}

              {activeModal === 'create-sort' && (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const entityId = formData.get('entityId') as string;
                    const entity = entities.find(e => e.id === entityId);
                    
                    const newSort: Sort = {
                      id: `sort_${Date.now()}`,
                      entity_id: entityId,
                      name: formData.get('name') as string,
                      icon: entity?.icon || '📅',
                      status: 'active',
                      scheduled_date: formData.get('date') as string,
                      duration: Number(formData.get('duration')),
                    };
                    
                    setSorts([newSort, ...sorts]);
                    closeModal();
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text-secondary">任务名称</label>
                    <input 
                      name="name"
                      required
                      type="text" 
                      placeholder="例如：实验数据分析 - 第一组"
                      className="w-full p-3 rounded-xl bg-bg-secondary border border-border outline-none focus:border-accent text-text-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text-secondary">所属工作空间</label>
                    <div className="relative">
                      <select 
                        name="entityId"
                        required
                        defaultValue=""
                        className="w-full p-3 rounded-xl bg-bg-secondary border border-border outline-none focus:border-accent text-text-primary appearance-none"
                      >
                        <option value="" disabled>选择工作空间...</option>
                        {entities.map(ent => (
                          <option key={ent.id} value={ent.id}>{ent.icon} {ent.name}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-3 top-3.5 text-text-secondary rotate-90 pointer-events-none" size={16} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-text-secondary">日期</label>
                      <input 
                        name="date"
                        required
                        type="date" 
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="w-full p-3 rounded-xl bg-bg-secondary border border-border outline-none focus:border-accent text-text-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-text-secondary">时长 (分钟)</label>
                      <input 
                        name="duration"
                        required
                        type="number" 
                        defaultValue={60}
                        min={15}
                        step={15}
                        className="w-full p-3 rounded-xl bg-bg-secondary border border-border outline-none focus:border-accent text-text-primary"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setActiveModal('create')}
                      className="flex-1 py-3 rounded-xl bg-bg-secondary text-text-primary font-bold text-sm"
                    >
                      返回
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-3 rounded-xl bg-accent text-white font-bold text-sm shadow-lg shadow-accent/20"
                    >
                      创建任务
                    </button>
                  </div>
                </form>
              )}

              {activeModal === 'create-entity' && (
                 <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-bg-secondary rounded-full flex items-center justify-center mx-auto text-text-secondary">
                      <Zap size={32} />
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary">功能开发中</h4>
                      <p className="text-xs text-text-secondary mt-1">创建工作空间需要更复杂的配置，请在桌面端操作。</p>
                    </div>
                    <button 
                      onClick={() => setActiveModal('create')}
                      className="px-6 py-2 rounded-lg bg-bg-secondary text-text-primary text-sm font-bold"
                    >
                      返回
                    </button>
                 </div>
              )}

              {activeModal === 'search' && (
                <div className="space-y-4">
                   <div className="flex items-center gap-2 bg-bg-secondary p-3 rounded-xl">
                    <Search size={18} className="text-text-secondary" />
                    <input 
                      type="text" 
                      autoFocus
                      placeholder="搜索..." 
                      className="bg-transparent border-none outline-none text-sm w-full text-text-primary placeholder:text-text-secondary"
                    />
                  </div>
                  <div className="text-center text-text-secondary text-sm py-8">
                    输入关键词搜索工作空间, 任务 或 项目经理模板
                  </div>
                </div>
              )}

              {activeModal === 'settings' && (
                <div className="space-y-2">
                  <p className="text-sm text-text-secondary">通用设置</p>
                  <div className="bg-bg-secondary rounded-xl p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">深色模式</span>
                      <div className="w-10 h-6 bg-accent rounded-full relative">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">消息通知</span>
                      <div className="w-10 h-6 bg-slate-600 rounded-full relative">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
