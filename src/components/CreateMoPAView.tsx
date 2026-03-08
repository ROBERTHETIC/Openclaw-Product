import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, Settings, Zap, Shield, Folder, Play, CheckCircle2, 
  ArrowRight, ArrowLeft, Bot, User, Search, Filter, Plus, X,
  Smartphone, Monitor, Mail, FileText, Database, Calendar
} from 'lucide-react';
import { Skill, PAInstance } from '../types';

const STEPS = [
  { id: 'scenario', label: '场景理解', icon: MessageSquare },
  { id: 'skills', label: 'Skill选择', icon: Zap },
  { id: 'params', label: '参数配置', icon: Settings },
  { id: 'trigger', label: '触发设置', icon: Calendar },
  { id: 'permissions', label: '权限配置', icon: Shield },
  { id: 'sort', label: 'Sort绑定', icon: Folder },
  { id: 'test', label: '测试验证', icon: Play },
  { id: 'publish', label: '发布', icon: CheckCircle2 },
];

export const CreateMoPAView = ({ onComplete, onCancel }: { onComplete: () => void, onCancel: () => void }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [chatHistory, setChatHistory] = useState<{role: 'ai'|'user', content: string}[]>([
    { role: 'ai', content: '你好！我是OpenClaw PA配置助手 🎯\n\n我会帮你一步步创建适合你的PA。\n先告诉我，你想让PA帮你做什么？' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // PA State
  const [paName, setPaName] = useState('未命名PA');
  const [paDesc, setPaDesc] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<any[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    setChatHistory(prev => [...prev, { role: 'user', content: chatInput }]);
    setChatInput('');
    setIsTyping(true);
    
    // Simulate AI response based on step
    setTimeout(() => {
      if (currentStepIndex === 0) {
        setChatHistory(prev => [...prev, { 
          role: 'ai', 
          content: '好的！我理解了你的需求 ✅\n\n📋 场景分析：\n• 平台：小红书\n• 任务：搜索达人 → 筛选 → 导出 → 发邮件\n• 频率：每周五自动执行\n\n🔍 我需要确认几个细节：\n1️⃣ 搜索关键词是什么？\n2️⃣ 每次搜索多少个达人？\n3️⃣ 具体在周五的什么时间执行？' 
        }]);
        setPaName('小红书美妆达人周报助手');
        setPaDesc('每周五自动搜索小红书美妆达人，筛选粉丝数>10万的，导出Excel并发邮件给我');
      } else if (currentStepIndex === 1) {
        setChatHistory(prev => [...prev, {
          role: 'ai',
          content: '完美！根据你的需求，我推荐以下Skill组合 🎯\n\n1. 🔍 小红书达人搜索\n2. 📊 数据筛选器\n3. 📈 Excel数据导出\n4. 📧 邮件发送'
        }]);
        setSelectedSkills([
          { id: 's1', name: '小红书达人搜索', icon: '🔍' },
          { id: 's2', name: '数据筛选器', icon: '📊' },
          { id: 's3', name: 'Excel数据导出', icon: '📈' },
          { id: 's4', name: '邮件发送', icon: '📧' },
        ]);
      }
      setIsTyping(false);
    }, 1500);
  };

  const nextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStepIndex) {
      case 0: // Scenario
      case 1: // Skills
        return (
          <div className="flex flex-col h-full bg-bg-secondary rounded-2xl border border-border overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-accent text-white' : 'bg-slate-700 text-slate-300'}`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl p-4 whitespace-pre-wrap ${msg.role === 'user' ? 'bg-accent text-white rounded-tr-none' : 'bg-card border border-border text-slate-300 rounded-tl-none'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-tl-none p-4 flex gap-1 items-center">
                    <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 bg-card border-t border-border">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="输入你的需求或回答..."
                  className="flex-1 bg-bg-secondary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || isTyping}
                  className="bg-accent text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50 hover:bg-accent/90 transition-colors"
                >
                  发送
                </button>
              </div>
            </div>
          </div>
        );
      case 2: // Params
        return (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings className="text-accent" />
                配置参数
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">搜索关键词 *</label>
                  <input type="text" defaultValue="美妆" className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent" />
                  <p className="text-xs text-slate-500 mt-1">支持多个关键词，用逗号分隔</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">搜索数量 *</label>
                  <input type="number" defaultValue={30} className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">排序方式</label>
                  <select className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent">
                    <option>粉丝数从高到低</option>
                    <option>点赞数从高到低</option>
                    <option>最新发布</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
      case 3: // Trigger
        return (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="text-accent" />
                触发设置
              </h3>
              
              <div className="space-y-4">
                <label className="flex items-start gap-4 p-4 rounded-xl border border-accent bg-accent/5 cursor-pointer">
                  <input type="radio" name="trigger" defaultChecked className="mt-1" />
                  <div>
                    <div className="font-medium text-white">定时触发</div>
                    <div className="text-sm text-slate-400 mt-1">每周五 18:00</div>
                  </div>
                </label>
                <label className="flex items-start gap-4 p-4 rounded-xl border border-border hover:border-slate-600 cursor-pointer">
                  <input type="radio" name="trigger" className="mt-1" />
                  <div>
                    <div className="font-medium text-white">手动触发</div>
                    <div className="text-sm text-slate-400 mt-1">随时可以在PA详情页手动执行</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        );
      case 4: // Permissions
        return (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="text-accent" />
                权限配置
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-border bg-bg-secondary">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-white font-medium">
                      <Smartphone size={18} className="text-blue-400" />
                      小红书 (Mobile APP)
                    </div>
                    <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-medium">已授权</span>
                  </div>
                  <p className="text-sm text-slate-400">需要 search (read) 权限来搜索达人和笔记</p>
                </div>
                
                <div className="p-4 rounded-xl border border-border bg-bg-secondary">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-white font-medium">
                      <Monitor size={18} className="text-purple-400" />
                      文件系统 (Desktop)
                    </div>
                    <button className="px-3 py-1 rounded bg-accent text-white text-xs font-medium hover:bg-accent/90">立即授权</button>
                  </div>
                  <p className="text-sm text-slate-400">需要 write 权限来导出Excel文件</p>
                </div>
                
                <div className="p-4 rounded-xl border border-border bg-bg-secondary">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-white font-medium">
                      <Mail size={18} className="text-rose-400" />
                      邮箱服务
                    </div>
                    <button className="px-3 py-1 rounded bg-accent text-white text-xs font-medium hover:bg-accent/90">立即授权</button>
                  </div>
                  <p className="text-sm text-slate-400">需要 send_email 权限来发送报告</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 5: // Sort Binding
        return (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Folder className="text-accent" />
                Sort绑定
              </h3>
              
              <div className="space-y-4">
                <p className="text-sm text-slate-400">Sort是你的工作目录，PA会读取和存储文件到这个目录。</p>
                
                <div className="space-y-4 mt-4">
                  <label className="flex items-start gap-4 p-4 rounded-xl border border-border hover:border-slate-600 cursor-pointer">
                    <input type="radio" name="sort" className="mt-1" />
                    <div>
                      <div className="font-medium text-white">使用现有Sort</div>
                      <select className="mt-2 w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-white text-sm">
                        <option>工作笔记</option>
                        <option>学习资料</option>
                      </select>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-4 p-4 rounded-xl border border-accent bg-accent/5 cursor-pointer">
                    <input type="radio" name="sort" defaultChecked className="mt-1" />
                    <div className="w-full">
                      <div className="font-medium text-white mb-2">创建新Sort</div>
                      <input type="text" defaultValue="小红书美妆达人数据" className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-white text-sm mb-2" />
                      <div className="text-xs text-slate-500 font-mono">/Users/robert/Documents/OpenClaw/Beauty/</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      case 6: // Test
        return (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Play className="text-accent" />
                测试验证
              </h3>
              
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <h4 className="font-medium text-emerald-400 mb-2">PA配置完成！</h4>
                <p className="text-sm text-slate-300">在发布前，建议先进行小规模测试验证配置是否正确。</p>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-border bg-bg-secondary">
                  <div className="font-medium text-white mb-2">测试模式</div>
                  <label className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                    <input type="radio" name="testMode" defaultChecked />
                    快速测试 (只运行第1个Skill，搜索5条数据)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input type="radio" name="testMode" />
                    完整测试 (运行所有Skill，使用真实参数)
                  </label>
                </div>
                
                <button className="w-full py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 flex items-center justify-center gap-2">
                  <Play size={18} />
                  开始测试
                </button>
              </div>
            </div>
          </div>
        );
      case 7: // Publish
        return (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={40} className="text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold text-white">准备发布</h3>
              <p className="text-slate-400">你的PA "{paName}" 已经准备就绪！</p>
              
              <div className="max-w-md mx-auto text-left space-y-4 mt-8">
                <div className="p-4 rounded-xl border border-border bg-bg-secondary">
                  <div className="font-medium text-white mb-2">分享设置</div>
                  <label className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                    <input type="radio" name="share" defaultChecked />
                    仅我可见 (保存在"我的PA库"中)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input type="radio" name="share" />
                    分享到PA市场 (其他用户可以使用)
                  </label>
                </div>
                
                <div className="p-4 rounded-xl border border-border bg-bg-secondary">
                  <label className="flex items-center gap-2 text-sm text-white font-medium">
                    <input type="checkbox" defaultChecked />
                    立即启用PA
                  </label>
                  <p className="text-xs text-slate-500 mt-1 ml-6">发布后PA会立即开始工作（下次触发时间: 周五18:00）</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-bg-primary">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">创建我的PA (MoPA)</h1>
            <p className="text-sm text-slate-400">通过对话和配置，定制你的专属自动化助手</p>
          </div>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Left Sidebar - Steps */}
        <div className="w-64 border-r border-border p-6 overflow-y-auto">
          <div className="space-y-2">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStepIndex;
              const isPast = index < currentStepIndex;
              
              return (
                <button
                  key={step.id}
                  onClick={() => index <= currentStepIndex && setCurrentStepIndex(index)}
                  disabled={index > currentStepIndex}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                    isActive 
                      ? 'bg-accent/10 text-accent font-medium' 
                      : isPast 
                        ? 'text-slate-300 hover:bg-white/5 cursor-pointer' 
                        : 'text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-accent text-white' : isPast ? 'bg-slate-800 text-slate-300' : 'bg-transparent text-slate-600'
                  }`}>
                    {isPast && !isActive ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                  </div>
                  <span className="text-sm">{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStepIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Footer Actions */}
          <div className="mt-6 pt-6 border-t border-border flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStepIndex === 0}
              className="px-6 py-2.5 rounded-xl border border-border text-slate-300 font-medium disabled:opacity-50 hover:bg-white/5 transition-colors"
            >
              上一步
            </button>
            <button
              onClick={nextStep}
              className="px-6 py-2.5 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 transition-colors flex items-center gap-2"
            >
              {currentStepIndex === STEPS.length - 1 ? '确认发布' : '下一步'}
              {currentStepIndex !== STEPS.length - 1 && <ArrowRight size={18} />}
            </button>
          </div>
        </div>

        {/* Right Sidebar - Preview */}
        <div className="w-80 border-l border-border p-6 bg-bg-secondary overflow-y-auto">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Monitor size={16} />
            配置预览
          </h3>
          
          <div className="space-y-6">
            <div>
              <div className="text-xs text-slate-500 mb-1">PA名称</div>
              <div className="font-medium text-white">{paName}</div>
            </div>
            
            {paDesc && (
              <div>
                <div className="text-xs text-slate-500 mb-1">场景描述</div>
                <div className="text-sm text-slate-300 leading-relaxed">{paDesc}</div>
              </div>
            )}
            
            {selectedSkills.length > 0 && (
              <div>
                <div className="text-xs text-slate-500 mb-2">Skills ({selectedSkills.length})</div>
                <div className="space-y-2">
                  {selectedSkills.map((skill, i) => (
                    <div key={skill.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border text-sm text-slate-300">
                      <span className="text-lg">{skill.icon}</span>
                      <span className="flex-1 truncate">{skill.name}</span>
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-6 border-t border-border">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>完成度</span>
                <span>{Math.round(((currentStepIndex + 1) / STEPS.length) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent transition-all duration-500"
                  style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
