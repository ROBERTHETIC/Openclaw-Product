import { Entity, Sort } from '../types';

export const MOCK_ENTITIES: Entity[] = [
  { id: 'ent_001', name: '听觉感知研究', icon: '🔬', description: '3个Sort | 配置PA：实验数据分析师', file_directory: '/research/audio', created_at: '2024-01-01' },
  { id: 'ent_002', name: 'MCN达人筛选', icon: '📱', description: '5个Sort | 配置PA：达人搜索助手', file_directory: '/marketing/mcn', created_at: '2024-01-02' }
];

export const MOCK_SORTS: Sort[] = [
  { id: 'sort_001', entity_id: 'ent_001', name: '实验1 - 高音调组', icon: '🎵', status: 'active', scheduled_date: '2025-01-08', duration: 60, pa_instance_id: '1' },
  { id: 'sort_002', entity_id: 'ent_001', name: '实验2 - 低音调组', icon: '🔉', status: 'active', scheduled_date: '2025-01-09', duration: 60, pa_instance_id: '1' },
  { id: 'sort_003', entity_id: 'ent_002', name: '美妆博主筛选', icon: '💄', status: 'active', scheduled_date: '2025-01-08', duration: 120, pa_instance_id: '2' },
];
