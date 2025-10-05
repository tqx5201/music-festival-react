import { useState, useEffect } from 'react';
import './Navbar.css';

const musicSources = [
  { value: 'netease', label: '网易云音乐', short: '网易' },
  { value: 'tencent', label: 'QQ音乐', short: 'QQ' },
  { value: 'kuwo', label: '酷我音乐', short: '酷我' },
  { value: 'joox', label: 'JOOX', short: 'JOOX' },
  { value: 'kugou', label: '酷狗音乐', short: '酷狗' },
  { value: 'migu', label: '咪咕音乐', short: '咪咕' },
  { value: 'deezer', label: 'Deezer', short: 'Deezer' },
  { value: 'spotify', label: 'Spotify', short: 'Spotify' },
  { value: 'apple', label: 'Apple Music', short: 'Apple' },
  { value: 'ytmusic', label: 'YouTube Music', short: 'YTM' },
  { value: 'tidal', label: 'TIDAL', short: 'TIDAL' },
  { value: 'qobuz', label: 'Qobuz', short: 'Qobuz' },
  { value: 'ximalaya', label: '喜马拉雅', short: '喜马' },
];

const Navbar = ({ onSearch, onViewChange, currentView, onThemeClick }) => {
  const [keyword, setKeyword] = useState('');
  const [source, setSource] = useState('netease');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      onSearch(keyword.trim(), source);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo" onClick={() => onViewChange('search')}>
          <i className="fas fa-music"></i>
          <span>音乐汇</span>
        </div>

        <form className="search-container" onSubmit={handleSearch}>
          <div className="search-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="搜索音乐、歌手、专辑..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <select
              className="source-select"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              {musicSources.map(s => (
                <option key={s.value} value={s.value}>
                  {isMobile ? s.short : s.label}
                </option>
              ))}
            </select>
            <button type="submit" className="search-btn">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </form>

        <div className="nav-menu">
          <button
            className={`nav-btn ${currentView === 'favorites' ? 'active' : ''}`}
            onClick={() => onViewChange('favorites')}
            title="我的收藏"
          >
            <i className="fas fa-heart"></i>
          </button>
          <button
            className={`nav-btn ${currentView === 'playlists' ? 'active' : ''}`}
            onClick={() => onViewChange('playlists')}
            title="收藏列表"
          >
            <i className="fas fa-list"></i>
          </button>
          <button
            className={`nav-btn ${currentView === 'recent' ? 'active' : ''}`}
            onClick={() => onViewChange('recent')}
            title="最近播放"
          >
            <i className="fas fa-history"></i>
          </button>
          <button
            className="nav-btn"
            onClick={onThemeClick}
            title="切换主题"
          >
            <i className="fas fa-palette"></i>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
