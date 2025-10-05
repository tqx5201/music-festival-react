// localStorage 存储工具
const STORAGE_KEYS = {
  FAVORITES: 'music_festival_favorites',
  PLAYLISTS: 'music_festival_playlists',
  RECENT_PLAYS: 'music_festival_recent_plays',
  SETTINGS: 'music_festival_settings',
  THEME: 'music_festival_theme',
};

export const storage = {
  // 获取收藏的单曲
  getFavorites: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('获取收藏失败:', error);
      return [];
    }
  },

  // 保存收藏的单曲
  saveFavorites: (favorites) => {
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
      return true;
    } catch (error) {
      console.error('保存收藏失败:', error);
      return false;
    }
  },

  // 添加到收藏
  addFavorite: (song) => {
    const favorites = storage.getFavorites();
    const exists = favorites.some(s => s.id === song.id && s.source === song.source);
    if (!exists) {
      favorites.unshift({ ...song, favoritedAt: Date.now() });
      return storage.saveFavorites(favorites);
    }
    return false;
  },

  // 从收藏移除
  removeFavorite: (songId, source) => {
    const favorites = storage.getFavorites();
    const filtered = favorites.filter(s => !(s.id === songId && s.source === source));
    return storage.saveFavorites(filtered);
  },

  // 检查是否已收藏
  isFavorite: (songId, source) => {
    const favorites = storage.getFavorites();
    return favorites.some(s => s.id === songId && s.source === source);
  },

  // 获取收藏列表
  getPlaylists: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('获取列表失败:', error);
      return [];
    }
  },

  // 保存收藏列表
  savePlaylists: (playlists) => {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
      return true;
    } catch (error) {
      console.error('保存列表失败:', error);
      return false;
    }
  },

  // 添加收藏列表
  addPlaylist: (playlist) => {
    const playlists = storage.getPlaylists();
    const newPlaylist = {
      id: Date.now().toString(),
      name: playlist.name,
      songs: playlist.songs || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    playlists.unshift(newPlaylist);
    storage.savePlaylists(playlists);
    return newPlaylist;
  },

  // 更新收藏列表
  updatePlaylist: (playlistId, updates) => {
    const playlists = storage.getPlaylists();
    const index = playlists.findIndex(p => p.id === playlistId);
    if (index !== -1) {
      playlists[index] = { ...playlists[index], ...updates, updatedAt: Date.now() };
      return storage.savePlaylists(playlists);
    }
    return false;
  },

  // 删除收藏列表
  deletePlaylist: (playlistId) => {
    const playlists = storage.getPlaylists();
    const filtered = playlists.filter(p => p.id !== playlistId);
    return storage.savePlaylists(filtered);
  },

  // 添加歌曲到列表
  addSongToPlaylist: (playlistId, song) => {
    const playlists = storage.getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist) {
      const exists = playlist.songs.some(s => s.id === song.id && s.source === song.source);
      if (!exists) {
        playlist.songs.push(song);
        playlist.updatedAt = Date.now();
        return storage.savePlaylists(playlists);
      }
    }
    return false;
  },

  // 从列表移除歌曲
  removeSongFromPlaylist: (playlistId, songId, source) => {
    const playlists = storage.getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist) {
      playlist.songs = playlist.songs.filter(s => !(s.id === songId && s.source === source));
      playlist.updatedAt = Date.now();
      return storage.savePlaylists(playlists);
    }
    return false;
  },

  // 获取最近播放
  getRecentPlays: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECENT_PLAYS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('获取最近播放失败:', error);
      return [];
    }
  },

  // 添加到最近播放
  addRecentPlay: (song) => {
    try {
      let recent = storage.getRecentPlays();
      // 移除已存在的相同歌曲
      recent = recent.filter(s => !(s.id === song.id && s.source === song.source));
      // 添加到开头
      recent.unshift({ ...song, playedAt: Date.now() });
      // 只保留最近50首
      recent = recent.slice(0, 50);
      localStorage.setItem(STORAGE_KEYS.RECENT_PLAYS, JSON.stringify(recent));
      return true;
    } catch (error) {
      console.error('保存最近播放失败:', error);
      return false;
    }
  },

  // 清空最近播放
  clearRecentPlays: () => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECENT_PLAYS, JSON.stringify([]));
      return true;
    } catch (error) {
      console.error('清空最近播放失败:', error);
      return false;
    }
  },

  // 获取设置
  getSettings: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : {
        volume: 60,
        quality: '320',
        autoPlay: true,
      };
    } catch (error) {
      console.error('获取设置失败:', error);
      return { volume: 60, quality: '320', autoPlay: true };
    }
  },

  // 保存设置
  saveSettings: (settings) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('保存设置失败:', error);
      return false;
    }
  },

  // 获取主题
  getTheme: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.THEME) || 'emerald';
    } catch (error) {
      console.error('获取主题失败:', error);
      return 'emerald';
    }
  },

  // 保存主题
  saveTheme: (theme) => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      return true;
    } catch (error) {
      console.error('保存主题失败:', error);
      return false;
    }
  },
};

export default storage;
