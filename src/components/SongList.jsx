import { useState } from 'react';
import { useMusic } from '../contexts/MusicContext';
import Modal from './Modal';
import './SongList.css';

const SongList = ({ songs, onPlay, title, emptyMessage, showActions = true, onBatchDownload, onNotify }) => {
  const { currentSong, currentIndex, currentPlaylist, isFavorite, toggleFavorite, playlists, addToPlaylist } = useMusic();
  const [selectedSongs, setSelectedSongs] = useState(new Set());
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const isCurrentSong = (song, index) => {
    return (
      currentSong &&
      currentPlaylist === songs &&
      currentIndex === index
    );
  };

  const formatArtist = (artist) => {
    if (Array.isArray(artist)) {
      return artist.join(' / ');
    }
    return artist || '未知歌手';
  };

  const handleToggleFavorite = (e, song) => {
    e.stopPropagation();
    toggleFavorite(song);
  };

  const handleToggleSelect = (e, index) => {
    e.stopPropagation();
    const newSelected = new Set(selectedSongs);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSongs(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedSongs.size === songs.length) {
      setSelectedSongs(new Set());
    } else {
      setSelectedSongs(new Set(songs.map((_, i) => i)));
    }
  };

  const handleBatchDownload = () => {
    const selected = songs.filter((_, i) => selectedSongs.has(i));
    console.log('SongList - handleBatchDownload 被调用');
    console.log('选中的歌曲索引:', Array.from(selectedSongs));
    console.log('选中的歌曲:', selected);
    console.log('onBatchDownload 函数存在?', !!onBatchDownload);

    if (selected.length > 0 && onBatchDownload) {
      console.log('调用 onBatchDownload，传入', selected.length, '首歌曲');
      onBatchDownload(selected);
    } else {
      console.warn('未调用 onBatchDownload - 原因:', {
        selectedLength: selected.length,
        hasCallback: !!onBatchDownload
      });
    }
  };

  const handleAddToPlaylist = (playlistId, song) => {
    const success = addToPlaylist(playlistId, song);
    setShowPlaylistMenu(null);

    if (success) {
      const playlist = playlists.find(p => p.id === playlistId);
      setSuccessMessage(`已将《${song.name}》添加到「${playlist?.name}」`);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2000);
    } else {
      if (onNotify) {
        onNotify('歌曲已存在于该歌单中', 'warning');
      }
    }
  };

  if (!songs || songs.length === 0) {
    return (
      <div className="empty-state">
        <i className="fas fa-music"></i>
        <div>{emptyMessage || '暂无歌曲'}</div>
      </div>
    );
  }

  return (
    <div className="song-list-container">
      {title && (
        <div className="song-list-header">
          <h3>{title}</h3>
          {showActions && (
            <div className="batch-actions">
              <button className="batch-btn" onClick={handleSelectAll}>
                <i className={`fas fa-${selectedSongs.size === songs.length ? 'times' : 'check'}-square`}></i>
                {selectedSongs.size === songs.length ? '取消全选' : '全选'}
              </button>
              {selectedSongs.size > 0 && (
                <button
                  className="batch-btn primary"
                  onClick={() => {
                    console.log('批量下载按钮被点击');
                    handleBatchDownload();
                  }}
                >
                  <i className="fas fa-download"></i>
                  批量下载 ({selectedSongs.size})
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="song-list">
        {songs.map((song, index) => (
          <div
            key={`${song.id}-${song.source}-${index}`}
            className={`song-item ${isCurrentSong(song, index) ? 'active' : ''}`}
            onClick={() => onPlay(index, songs)}
          >
            {showActions && (
              <div className="song-checkbox">
                <input
                  type="checkbox"
                  checked={selectedSongs.has(index)}
                  onChange={(e) => handleToggleSelect(e, index)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            <div className="song-index">
              {isCurrentSong(song, index) ? (
                <i className="fas fa-volume-up"></i>
              ) : (
                (index + 1).toString().padStart(2, '0')
              )}
            </div>

            <div className="song-info">
              <div className="song-name">{song.name}</div>
              <div className="song-artist">
                {formatArtist(song.artist)} · {song.album}
              </div>
            </div>

            {showActions && (
              <div className="song-actions">
                <button
                  className={`action-btn ${isFavorite(song.id, song.source) ? 'favorite' : ''}`}
                  onClick={(e) => handleToggleFavorite(e, song)}
                  title="收藏"
                >
                  <i className="fas fa-heart"></i>
                </button>
                <div className="playlist-dropdown">
                  <button
                    className="action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPlaylistMenu(showPlaylistMenu === index ? null : index);
                    }}
                    title="添加到歌单"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                  {showPlaylistMenu === index && (
                    <div className="playlist-menu">
                      {playlists.length === 0 ? (
                        <div className="playlist-menu-empty">暂无歌单</div>
                      ) : (
                        playlists.map(playlist => (
                          <div
                            key={playlist.id}
                            className="playlist-menu-item"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToPlaylist(playlist.id, song);
                            }}
                          >
                            {playlist.name}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 成功提示模态框 */}
      <Modal show={showSuccessModal} onClose={() => setShowSuccessModal(false)} title="" showCloseButton={false}>
        <div className="success-modal-content">
          <div className="success-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <p className="success-message">{successMessage}</p>
        </div>
      </Modal>
    </div>
  );
};

export default SongList;
