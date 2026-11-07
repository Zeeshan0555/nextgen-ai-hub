export interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  accentColor: 'purple' | 'cyan' | 'indigo' | 'emerald';
}

export interface PipelineItem {
  id: string;
  name: string;
  subtext: string;
  type: 'AI' | 'SQL' | 'SEC';
  status: 'active' | 'paused' | 'error';
}
