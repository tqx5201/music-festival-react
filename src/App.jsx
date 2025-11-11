import { useState, useEffect } from 'react';
import { MusicProvider, useMusic } from './contexts/MusicContext';
import Navbar from './components/Navbar';
import Player from './components/Player';
import SongList from './components/SongList';
import Lyrics from './components/Lyrics';
import InputModal from './components/InputModal';
import AudioVisualizer from './components/AudioVisualizer';
import Footer from './components/Footer';
import { musicApi } from './services/api';
import { downloadFile, createLyricContent, formatArtist, batchDownload } from './utils/helpers';
import { storage } from './utils/storage';
import { themes, applyTheme } from './utils/theme';
import './App.css';

function AppContent() {
  const [view, setView] = useState('search');
  const [searchResults, setSearchResults] = useState([]);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [playlistId, setPlaylistId] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [recommendSongs, setRecommendSongs] = useState([]);
  const [currentTheme, setCurrentTheme] = useState('emerald');
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);

  const { playSong, favorites, playlists, recentPlays, currentSong, quality, createPlaylist, deletePlaylist, clearRecentPlays } = useMusic();

  // 初始化主题
  useEffect(() => {
    const savedTheme = storage.getTheme();
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  // 切换主题
  const handleThemeChange = (themeName) => {
    setCurrentTheme(themeName);
    applyTheme(themeName);
    storage.saveTheme(themeName);
    setShowThemeSelector(false);
    showNotification(`已切换到${themes[themeName].name}主题`, 'success');
  };

  // 显示通知
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // 搜索音乐
  const handleSearch = async (keyword, source) => {
    setView('search');
    setLoading(true);
    setSearchResults([]);

    try {
      const results = await musicApi.search(keyword, source, 30);
      setSearchResults(results);
      if (results.length === 0) {
        showNotification('未找到相关歌曲', 'warning');
      }
    } catch (error) {
      console.error('搜索失败:', error);
      showNotification('搜索失败,请稍后重试', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 解析歌单
  const handleParsePlaylist = async () => {
    if (!playlistId.trim()) {
      showNotification('请输入歌单ID', 'warning');
      return;
    }

    setLoading(true);
    try {
      const songs = await musicApi.parsePlaylist(playlistId.trim());
      setPlaylistSongs(songs);
      showNotification(`成功加载 ${songs.length} 首歌曲`, 'success');
    } catch (error) {
      console.error('解析歌单失败:', error);
      showNotification('解析歌单失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 获取推荐音乐
  const handleGetRecommendations = async () => {
    setLoading(true);
    try {
      const songs = await musicApi.getRecommendations();
      setRecommendSongs(songs);
      if (songs.length > 0) {
        playSong(0, songs);
        showNotification('开始随机推荐播放', 'success');
      }
    } catch (error) {
      console.error('获取推荐失败:', error);
      showNotification('获取推荐失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 下载当前歌曲
  const handleDownloadCurrent = async () => {
    if (!currentSong) {
      showNotification('请先选择歌曲', 'warning');
      return;
    }

    try {
      showNotification('666正在获取下载链接...', 'info');
      const data = await musicApi.getMusicUrl(currentSong.source, currentSong.id, quality);
      if (data && data.url) {
        showNotification(`${data.url}`,'info');
        const filename = `${currentSong.name} - ${formatArtist(currentSong.artist)}.mp3`;
        downloadFile(data.url, filename);
        showNotification('开始下载音乐', 'success');
      } else {
        showNotification('无法获取下载链接', 'error');
      }
    } catch (error) {
      console.error('下载失败:', error);
      showNotification('下载失败', 'error');
    }
  };

  // 下载当前歌词
  const handleDownloadLyric = async () => {
    if (!currentSong) {
      showNotification('请先选择歌曲', 'warning');
      return;
    }

    try {
      showNotification('正在获取歌词...', 'info');
      const data = await musicApi.getLyric(currentSong.source, currentSong.lyric_id || currentSong.id);

      if (data && data.lyric) {
        const content = createLyricContent(currentSong, data);
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const filename = `${currentSong.name} - ${formatArtist(currentSong.artist)}.lrc`;
        downloadFile(url, filename);
        URL.revokeObjectURL(url);
        showNotification('歌词下载完成', 'success');
      } else {
        showNotification('该歌曲暂无歌词', 'warning');
      }
    } catch (error) {
      console.error('下载歌词失败:', error);
      showNotification('下载歌词失败', 'error');
    }
  };

  // 批量下载
  const handleBatchDownload = async (songs) => {
    console.log('App.jsx - handleBatchDownload 被调用');
    console.log('接收到的歌曲数组:', songs);
    console.log('歌曲数量:', songs.length);

    if (songs.length === 1) {
      showNotification(`开始下载：${songs[0].name}`, 'info');
    } else {
      showNotification(`开始批量下载 ${songs.length} 首歌曲，正在打包ZIP...`, 'info');
    }

    console.log('准备调用 batchDownload 函数...');
    const successCount = await batchDownload(
      songs,
      (source, id) => musicApi.getMusicUrl(source, id, quality),
      (completed, total, success) => {
        console.log(`进度回调 - completed: ${completed}, total: ${total}, success: ${success}`);
        if (completed === total) {
          if (songs.length === 1) {
            showNotification(`下载完成`, 'success');
          } else {
            showNotification(`ZIP打包完成，成功下载 ${success}/${total} 首歌曲`, 'success');
          }
        }
      }
    );
    console.log('batchDownload 返回值 - 成功数量:', successCount);
  };

  // 清空历史播放
  const handleClearRecentPlays = () => {
    if (confirm('确定要清空所有播放记录吗?')) {
      clearRecentPlays();
      showNotification('播放记录已清空', 'success');
    }
  };

  // 创建新歌单
  const handleCreatePlaylist = (name) => {
    createPlaylist(name);
    showNotification('歌单创建成功', 'success');
  };

  // 删除歌单
  const handleDeletePlaylist = (playlistId) => {
    if (confirm('确定要删除这个歌单吗?')) {
      deletePlaylist(playlistId);
      showNotification('歌单已删除', 'success');
    }
  };

  // 渲染内容区域
  const renderContent = () => {
    if (view === 'search') {
      return (
        <div className="content-section">
          <div className="tabs">
            <button className="tab-btn active">
              <i className="fas fa-search"></i> 搜索结果
            </button>
            <button className="tab-btn" onClick={() => setView('netease-playlist')}>
              <i className="fas fa-list-music"></i> 网易云歌单
            </button>
            <button className="tab-btn" onClick={handleGetRecommendations}>
              <i className="fas fa-random"></i> 随机推荐
            </button>
          </div>

          {loading ? (
            <div className="loading">
              <i className="fas fa-spinner fa-spin"></i>
              <div>加载中...</div>
            </div>
          ) : searchResults.length > 0 ? (
            <SongList
              songs={searchResults}
              onPlay={playSong}
              title={`搜索结果 (${searchResults.length})`}
              showActions={true}
              onBatchDownload={handleBatchDownload}
              onNotify={showNotification}
            />
          ) : recommendSongs.length > 0 ? (
            <SongList
              songs={recommendSongs}
              onPlay={playSong}
              title="随机推荐"
              showActions={true}
              onBatchDownload={handleBatchDownload}
              onNotify={showNotification}
            />
          ) : (
            <div className="empty-state">
              <i className="fas fa-search"></i>
              <div>在上方搜索框输入关键词开始搜索音乐</div>
            </div>
          )}
        </div>
      );
    } else if (view === 'netease-playlist') {
      return (
        <div className="content-section">
          <div className="tabs">
            <button className="tab-btn" onClick={() => setView('search')}>
              <i className="fas fa-search"></i> 搜索结果
            </button>
            <button className="tab-btn active">
              <i className="fas fa-list-music"></i> 网易云歌单
            </button>
          </div>

          <div className="playlist-input-container">
            <input
              type="text"
              className="playlist-input"
              placeholder="输入网易云歌单ID..."
              value={playlistId}
              onChange={(e) => setPlaylistId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleParsePlaylist()}
            />
            <button className="playlist-btn" onClick={handleParsePlaylist}>
              <i className="fas fa-check"></i> 解析歌单
            </button>
          </div>

          {loading ? (
            <div className="loading">
              <i className="fas fa-spinner fa-spin"></i>
              <div>解析中...</div>
            </div>
          ) : playlistSongs.length > 0 ? (
            <SongList
              songs={playlistSongs}
              onPlay={playSong}
              title={`歌单歌曲 (${playlistSongs.length})`}
              showActions={true}
              onBatchDownload={handleBatchDownload}
              onNotify={showNotification}
            />
          ) : (
            <div className="empty-state">
              <i className="fas fa-list-ol"></i>
              <div>输入歌单ID后点击解析</div>
            </div>
          )}
        </div>
      );
    } else if (view === 'favorites') {
      return (
        <div className="content-section">
          <SongList
            songs={favorites}
            onPlay={playSong}
            title={`我的收藏 (${favorites.length})`}
            emptyMessage="暂无收藏的歌曲"
            showActions={true}
            onBatchDownload={handleBatchDownload}
            onNotify={showNotification}
          />
        </div>
      );
    } else if (view === 'playlists') {
      return (
        <div className="content-section">
          <div className="playlists-header">
            <h3>收藏列表 ({playlists.length})</h3>
            <button className="create-playlist-btn" onClick={() => setShowCreatePlaylistModal(true)}>
              <i className="fas fa-plus"></i> 新建歌单
            </button>
          </div>

          {playlists.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-folder-open"></i>
              <div>暂无收藏列表</div>
            </div>
          ) : (
            <div className="playlists-grid">
              {playlists.map(playlist => (
                <div key={playlist.id} className="playlist-card">
                  <div className="playlist-card-header">
                    <h4>{playlist.name}</h4>
                    <button
                      className="delete-playlist-btn"
                      onClick={() => handleDeletePlaylist(playlist.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                  <div className="playlist-card-info">
                    {playlist.songs.length} 首歌曲
                  </div>
                  <button
                    className="play-playlist-btn"
                    onClick={() => {
                      if (playlist.songs.length > 0) {
                        playSong(0, playlist.songs);
                      }
                    }}
                  >
                    <i className="fas fa-play"></i> 播放全部
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else if (view === 'recent') {
      return (
        <div className="content-section">
          <div className="playlists-header">
            <h3>最近播放 ({recentPlays.length})</h3>
            {recentPlays.length > 0 && (
              <button className="create-playlist-btn" onClick={handleClearRecentPlays}>
                <i className="fas fa-trash"></i> 清空记录
              </button>
            )}
          </div>

          {recentPlays.length > 0 ? (
            <SongList
              songs={recentPlays}
              onPlay={playSong}
              showActions={true}
              onBatchDownload={handleBatchDownload}
              onNotify={showNotification}
            />
          ) : (
            <div className="empty-state">
              <i className="fas fa-history"></i>
              <div>暂无播放记录</div>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="app">
      <div className="bg-animation"></div>
      <div className="bg-overlay"></div>

      <Navbar
        onSearch={handleSearch}
        onViewChange={setView}
        currentView={view}
        onThemeClick={() => setShowThemeSelector(!showThemeSelector)}
      />

      <div className="main-container">
        {renderContent()}

        <Player onDownload={handleDownloadCurrent} onDownloadLyric={handleDownloadLyric} />

        <Lyrics />
      </div>

      {/* 主题选择器 */}
      {showThemeSelector && (
        <div className="theme-selector-overlay" onClick={() => setShowThemeSelector(false)}>
          <div className="theme-selector" onClick={(e) => e.stopPropagation()}>
            <h3>选择主题颜色</h3>
            <div className="theme-grid">
              {Object.entries(themes).map(([key, theme]) => (
                <div
                  key={key}
                  className={`theme-option ${currentTheme === key ? 'active' : ''}`}
                  onClick={() => handleThemeChange(key)}
                  style={{ background: theme.gradient }}
                >
                  <span>{theme.name}</span>
                  {currentTheme === key && <i className="fas fa-check"></i>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 创建歌单弹窗 */}
      <InputModal
        show={showCreatePlaylistModal}
        onClose={() => setShowCreatePlaylistModal(false)}
        onConfirm={handleCreatePlaylist}
        title="创建新歌单"
        placeholder="请输入歌单名称..."
        confirmText="创建"
        cancelText="取消"
      />

      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* 音频波形可视化 */}
      <AudioVisualizer />

      {/* 底部版权 */}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <MusicProvider>
      <AppContent />
    </MusicProvider>
  );
}

export default App;
