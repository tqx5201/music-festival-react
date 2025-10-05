import { useState, useEffect } from 'react';
import { useMusic } from '../contexts/MusicContext';
import { formatTime, getQualityText, DEFAULT_COVER } from '../utils/helpers';
import { musicApi } from '../services/api';
import './Player.css';

const Player = ({ onDownload, onDownloadLyric }) => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    quality,
    togglePlay,
    playPrevious,
    playNext,
    seekTo,
    changeVolume,
    setQuality,
    toggleFavorite,
    isFavorite,
  } = useMusic();

  const [coverUrl, setCoverUrl] = useState(DEFAULT_COVER);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    if (currentSong) {
      loadCover();
      setIsFav(isFavorite(currentSong.id, currentSong.source));
    } else {
      setCoverUrl(DEFAULT_COVER);
    }
  }, [currentSong]);

  const loadCover = async () => {
    if (currentSong && currentSong.pic_id) {
      try {
        const url = await musicApi.getAlbumCover(currentSong.source, currentSong.pic_id, 500);
        setCoverUrl(url || DEFAULT_COVER);
      } catch (error) {
        setCoverUrl(DEFAULT_COVER);
      }
    }
  };

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seekTo(percent * duration);
  };

  const handleVolumeChange = (e) => {
    changeVolume(e.target.value);
  };

  const handleToggleFavorite = () => {
    if (currentSong) {
      const newState = toggleFavorite(currentSong);
      setIsFav(newState);
    }
  };

  const formatArtist = (artist) => {
    if (Array.isArray(artist)) {
      return artist.join(' / ');
    }
    return artist || '未知歌手';
  };

  return (
    <div className="player-section">
      <div className="current-song">
        <div className="current-cover-container">
          <img
            className={`current-cover ${isPlaying ? 'playing' : ''}`}
            src={coverUrl}
            alt="专辑封面"
          />
        </div>
        <div className="current-info">
          <h3>{currentSong?.name || '未选择歌曲'}</h3>
          <p>
            {currentSong
              ? `${formatArtist(currentSong.artist)} · ${currentSong.album}`
              : '请搜索并选择要播放的歌曲'}
          </p>
        </div>
      </div>

      <div className="player-controls">
        <button
          className="control-btn small"
          onClick={playPrevious}
          disabled={!currentSong}
        >
          <i className="fas fa-step-backward"></i>
        </button>
        <button
          className="control-btn play-btn"
          onClick={togglePlay}
          disabled={!currentSong}
        >
          <i className={`fas fa-${isPlaying ? 'pause' : 'play'}`}></i>
        </button>
        <button
          className="control-btn small"
          onClick={playNext}
          disabled={!currentSong}
        >
          <i className="fas fa-step-forward"></i>
        </button>
        <button
          className={`control-btn small ${isFav ? 'favorite' : ''}`}
          onClick={handleToggleFavorite}
          disabled={!currentSong}
          title={isFav ? '取消收藏' : '收藏'}
        >
          <i className={`fas fa-heart`}></i>
        </button>
      </div>

      <div className="progress-container">
        <div className="progress-bar" onClick={handleProgressClick}>
          <div
            className="progress-fill"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          ></div>
        </div>
        <div className="time-info">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="quality-container">
        <div className="quality-label">
          <i className="fas fa-music"></i>
          <span>音质</span>
        </div>
        <select
          className="quality-select"
          value={quality}
          onChange={(e) => setQuality(e.target.value)}
        >
          <option value="128">标准 128K</option>
          <option value="192">较高 192K</option>
          <option value="320">高品质 320K</option>
          <option value="740">无损 FLAC</option>
          <option value="999">Hi-Res</option>
        </select>
      </div>

      <div className="volume-container">
        <i
          className={`fas fa-volume-${
            volume === 0 ? 'mute' : volume < 50 ? 'down' : 'up'
          } volume-icon`}
        ></i>
        <input
          type="range"
          className="volume-slider"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
        />
        <span className="volume-text">{volume}%</span>
      </div>

      <div className="download-container">
        <button
          className="download-btn"
          onClick={onDownload}
          disabled={!currentSong}
        >
          <i className="fas fa-download"></i>
          <span>下载音乐</span>
        </button>
        <button
          className="download-btn"
          onClick={onDownloadLyric}
          disabled={!currentSong}
        >
          <i className="fas fa-file-text"></i>
          <span>下载歌词</span>
        </button>
      </div>
    </div>
  );
};

export default Player;
