// 音乐API服务
const API_BASE = 'https://music-api.gdstudio.xyz/api.php';

export const musicApi = {
  // 搜索音乐
  search: async (keyword, source = 'netease', count = 30) => {
    try {
      const response = await fetch(
        `${API_BASE}?types=search&source=${source}&name=${encodeURIComponent(keyword)}&count=${count}`
      );
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('搜索失败:', error);
      throw error;
    }
  },

  // 获取音乐URL
  getMusicUrl: async (source, id, quality = '320') => {
    try {
      const response = await fetch(
        `${API_BASE}?types=url&source=${source}&id=${id}&br=${quality}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('获取音乐URL失败:', error);
      throw error;
    }
  },

  // 获取歌词
  getLyric: async (source, id) => {
    try {
      const response = await fetch(
        `${API_BASE}?types=lyric&source=${source}&id=${id}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('获取歌词失败:', error);
      throw error;
    }
  },

  // 获取专辑封面
  getAlbumCover: async (source, picId, size = 300) => {
    try {
      if (!picId) {
        return null;
      }
      const response = await fetch(
        `${API_BASE}?types=pic&source=${source}&id=${picId}&size=${size}`
      );
      const data = await response.json();
      return data?.url || null;
    } catch (error) {
      console.error('获取专辑封面失败:', error);
      return null;
    }
  },

  // 解析歌单
  parsePlaylist: async (playlistId, source = 'netease') => {
    try {
      const response = await fetch(
        `${API_BASE}?types=playlist&id=${playlistId}&source=${source}`
      );
      const data = await response.json();

      let songs = [];
      if (data && data.playlist && data.playlist.tracks) {
        songs = data.playlist.tracks.map(track => ({
          name: track.name,
          artist: track.ar.map(a => a.name),
          album: track.al.name,
          id: track.id,
          pic_id: track.al.pic_id_str || track.al.pic_str || track.al.pic,
          lyric_id: track.id,
          source: source,
        }));
      } else if (data && data.tracks) {
        songs = data.tracks.map(track => ({
          name: track.name,
          artist: track.ar.map(a => a.name),
          album: track.al.name,
          id: track.id,
          pic_id: track.al.pic_id_str || track.al.pic_str || track.al.pic,
          lyric_id: track.id,
          source: source,
        }));
      }

      return songs;
    } catch (error) {
      console.error('解析歌单失败:', error);
      throw error;
    }
  },

  // 获取推荐音乐（使用热门关键词搜索）
  getRecommendations: async () => {
    const keywords = ['流行', '热歌', '华语', '经典', '新歌'];
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
    try {
      const songs = await musicApi.search(randomKeyword, 'netease', 20);
      // 随机打乱顺序
      return songs.sort(() => Math.random() - 0.5);
    } catch (error) {
      console.error('获取推荐失败:', error);
      return [];
    }
  },
};

export default musicApi;
