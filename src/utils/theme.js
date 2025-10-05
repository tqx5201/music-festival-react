// 主题颜色配置
export const themes = {
  emerald: {
    name: '翠绿',
    primary: '#10b981',
    primaryHover: '#059669',
    primaryLight: 'rgba(16, 185, 129, 0.3)',
    gradient: 'linear-gradient(-45deg, #10b981, #34d399, #22d3ee, #3b82f6)',
  },
  red: {
    name: '炽红',
    primary: '#ff6b6b',
    primaryHover: '#ff5252',
    primaryLight: 'rgba(255, 107, 107, 0.3)',
    gradient: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
  },
  purple: {
    name: '魅紫',
    primary: '#a855f7',
    primaryHover: '#9333ea',
    primaryLight: 'rgba(168, 85, 247, 0.3)',
    gradient: 'linear-gradient(-45deg, #a855f7, #c084fc, #e879f9, #f472b6)',
  },
  blue: {
    name: '深蓝',
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    primaryLight: 'rgba(59, 130, 246, 0.3)',
    gradient: 'linear-gradient(-45deg, #3b82f6, #60a5fa, #06b6d4, #22d3ee)',
  },
  orange: {
    name: '活力橙',
    primary: '#f97316',
    primaryHover: '#ea580c',
    primaryLight: 'rgba(249, 115, 22, 0.3)',
    gradient: 'linear-gradient(-45deg, #f97316, #fb923c, #fbbf24, #facc15)',
  },
  pink: {
    name: '樱花粉',
    primary: '#ec4899',
    primaryHover: '#db2777',
    primaryLight: 'rgba(236, 72, 153, 0.3)',
    gradient: 'linear-gradient(-45deg, #ec4899, #f472b6, #fb7185, #fda4af)',
  },
};

export const defaultTheme = 'emerald';

// 应用主题到CSS变量
export const applyTheme = (themeName) => {
  const theme = themes[themeName] || themes[defaultTheme];
  const root = document.documentElement;

  root.style.setProperty('--primary-color', theme.primary);
  root.style.setProperty('--primary-hover', theme.primaryHover);
  root.style.setProperty('--primary-light', theme.primaryLight);
  root.style.setProperty('--gradient-bg', theme.gradient);
};
