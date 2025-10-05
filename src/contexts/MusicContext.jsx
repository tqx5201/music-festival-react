import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { musicApi } from '../services/api';
import { storage } from '../utils/storage';

const MusicContext = createContext();

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within MusicProvider');
  }
  return context;
};

export const MusicProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [currentPlaylist, setCurrentPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(60);
  const [quality, setQuality] = useState('320');
  const [lyrics, setLyrics] = useState([]);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const [favorites, setFavorites] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [recentPlays, setRecentPlays] = useState([]);

  const audioRef = useRef(null);

  // 初始化
  useEffect(() => {
    const settings = storage.getSettings();
    setVolume(settings.volume);
    setQuality(settings.quality);
    setFavorites(storage.getFavorites());
    setPlaylists(storage.getPlaylists());
    setRecentPlays(storage.getRecentPlays());
  }, []);

  // 保存设置
  useEffect(() => {
    storage.saveSettings({ volume, quality });
  }, [volume, quality]);

  // 音频元素事件监听
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // 更新当前歌词高亮
      if (lyrics.length > 0) {
        let index = -1;
        for (let i = 0; i < lyrics.length; i++) {
          if (lyrics[i].time <= audio.currentTime) {
            index = i;
          } else {
            break;
          }
        }
        setCurrentLyricIndex(index);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      playNext();
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [lyrics]);

  // 播放歌曲
  const playSong = async (index, playlist = currentPlaylist) => {
    if (!playlist || index < 0 || index >= playlist.length) return;

    const song = playlist[index];
    setCurrentSong(song);
    setCurrentPlaylist(playlist);
    setCurrentIndex(index);

    try {
      // 获取音乐URL
      const urlData = await musicApi.getMusicUrl(song.source, song.id, quality);

      if (urlData && urlData.url) {
        if (audioRef.current) {
          audioRef.current.src = urlData.url;
          audioRef.current.load();
          await audioRef.current.play();
        }

        // 加载歌词
        loadLyrics(song);

        // 添加到最近播放
        storage.addRecentPlay(song);
        setRecentPlays(storage.getRecentPlays());
      } else {
        throw new Error('无法获取音乐链接');
      }
    } catch (error) {
      console.error('播放失败:', error);
      throw error;
    }
  };

  // 加载歌词
  const loadLyrics = async (song) => {
    try {
      const lyricData = await musicApi.getLyric(song.source, song.lyric_id || song.id);
      if (lyricData && lyricData.lyric) {
        const parsedLyrics = parseLyric(lyricData.lyric);
        setLyrics(parsedLyrics);
      } else {
        setLyrics([]);
      }
    } catch (error) {
      console.error('获取歌词失败:', error);
      setLyrics([]);
    }
  };

  // 解析歌词
  const parseLyric = (lrcText) => {
    const lines = lrcText.split('\n');
    const result = [];

    lines.forEach(line => {
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const milliseconds = parseInt(match[3].padEnd(3, '0'));
        const text = match[4].trim();

        if (text) {
          const time = minutes * 60 + seconds + milliseconds / 1000;
          result.push({ time, text });
        }
      }
    });

    return result.sort((a, b) => a.time - b.time);
  };

  // 播放/暂停
  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      try {
        await audioRef.current.play();
      } catch (error) {
        console.error('播放失败:', error);
      }
    }
  };

  // 上一曲
  const playPrevious = () => {
    if (currentIndex > 0) {
      playSong(currentIndex - 1);
    }
  };

  // 下一曲
  const playNext = () => {
    if (currentIndex < currentPlaylist.length - 1) {
      playSong(currentIndex + 1);
    }
  };

  // 跳转到指定时间
  const seekTo = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  // 设置音量
  const changeVolume = (value) => {
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value / 100;
    }
  };

  // 切换收藏
  const toggleFavorite = (song) => {
    const isFav = storage.isFavorite(song.id, song.source);
    if (isFav) {
      storage.removeFavorite(song.id, song.source);
    } else {
      storage.addFavorite(song);
    }
    setFavorites(storage.getFavorites());
    return !isFav;
  };

  // 检查是否收藏
  const isFavorite = (songId, source) => {
    return storage.isFavorite(songId, source);
  };

  // 创建播放列表
  const createPlaylist = (name, songs = []) => {
    const playlist = storage.addPlaylist({ name, songs });
    setPlaylists(storage.getPlaylists());
    return playlist;
  };

  // 删除播放列表
  const deletePlaylist = (playlistId) => {
    storage.deletePlaylist(playlistId);
    setPlaylists(storage.getPlaylists());
  };

  // 添加歌曲到播放列表
  const addToPlaylist = (playlistId, song) => {
    const success = storage.addSongToPlaylist(playlistId, song);
    if (success) {
      setPlaylists(storage.getPlaylists());
    }
    return success;
  };

  // 从播放列表移除歌曲
  const removeFromPlaylist = (playlistId, songId, source) => {
    storage.removeSongFromPlaylist(playlistId, songId, source);
    setPlaylists(storage.getPlaylists());
  };

  // 清空最近播放
  const clearRecentPlays = () => {
    storage.clearRecentPlays();
    setRecentPlays([]);
  };

  const value = {
    // 状态
    currentSong,
    currentPlaylist,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    quality,
    lyrics,
    currentLyricIndex,
    favorites,
    playlists,
    recentPlays,
    audioRef,

    // 方法
    playSong,
    togglePlay,
    playPrevious,
    playNext,
    seekTo,
    changeVolume,
    setQuality,
    toggleFavorite,
    isFavorite,
    createPlaylist,
    deletePlaylist,
    addToPlaylist,
    removeFromPlaylist,
    clearRecentPlays,
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="metadata" />
    </MusicContext.Provider>
  );
};
