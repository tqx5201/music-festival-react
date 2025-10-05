// 辅助函数
import JSZip from 'jszip';

// 格式化时间（秒转分:秒）
export const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// 解析LRC歌词
export const parseLyrics = (lrcText) => {
  if (!lrcText) return [];

  const lines = lrcText.split('\n');
  const lyrics = [];

  lines.forEach(line => {
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const milliseconds = parseInt(match[3].padEnd(3, '0'));
      const text = match[4].trim();

      if (text) {
        const time = minutes * 60 + seconds + milliseconds / 1000;
        lyrics.push({ time, text });
      }
    }
  });

  return lyrics.sort((a, b) => a.time - b.time);
};

// 获取音质文本
export const getQualityText = (quality) => {
  const qualityMap = {
    '128': '标准音质',
    '192': '较高音质',
    '320': '高品质',
    '740': '无损音质',
    '999': 'Hi-Res音质',
  };
  return qualityMap[quality] || `${quality}K`;
};

// 格式化歌手名称
export const formatArtist = (artist) => {
  if (Array.isArray(artist)) {
    return artist.join(' / ');
  }
  return artist || '未知歌手';
};

// 默认封面
export const DEFAULT_COVER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjIwIiBoZWlnaHQ9IjIyMCIgdmlld0JveD0iMCAwIDIyMCAyMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMjAiIGhlaWdodD0iMjIwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHJ4PSIyMCIvPgo8cGF0aCBkPSJNMTEwIDcwTDE0MCAx MTBIMTIwVjE1MEg5MFYxMTBINzBMMTEwIDcwWiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIi8+Cjwvc3ZnPgo=';

// 下载文件
export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 批量下载 - 多首歌曲打包成ZIP，单首直接下载
export const batchDownload = async (songs, getMusicUrlFn, onProgress) => {
  const total = songs.length;
  let completed = 0;

  console.log('=== 批量下载开始 ===');
  console.log('歌曲数量:', total);
  console.log('歌曲列表:', songs.map(s => s.name));

  // 单首歌曲直接下载
  if (songs.length === 1) {
    console.log('单首歌曲，直接下载模式');
    const song = songs[0];
    try {
      console.log('正在获取下载链接:', song.name);
      const data = await getMusicUrlFn(song.source, song.id);
      console.log('获取到的数据:', data);

      if (data && data.url) {
        const filename = `${song.name} - ${formatArtist(song.artist)}.mp3`;
        console.log('开始下载文件:', filename);
        downloadFile(data.url, filename);
        if (onProgress) {
          onProgress(1, 1, 1);
        }
        console.log('下载完成');
        return 1;
      } else {
        console.error('无法获取下载链接，返回的数据:', data);
        return 0;
      }
    } catch (error) {
      console.error(`下载失败: ${song.name}`, error);
      console.error('错误堆栈:', error.stack);
      return 0;
    }
  }

  // 多首歌曲打包成ZIP
  console.log(`多首歌曲模式，准备打包成ZIP...`);
  const zip = new JSZip();
  let successCount = 0;

  // 获取所有音频文件并添加到ZIP
  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];
    console.log(`\n--- 处理第 ${i + 1}/${total} 首歌曲 ---`);
    console.log('歌曲信息:', { name: song.name, source: song.source, id: song.id });

    try {
      console.log('正在获取音乐URL...');
      const data = await getMusicUrlFn(song.source, song.id);
      console.log('获取到的URL数据:', data);

      if (data && data.url) {
        console.log('音乐URL:', data.url);
        console.log('开始fetch音频文件...');

        // 获取音频文件的二进制数据
        const response = await fetch(data.url);
        console.log('Fetch响应状态:', response.status, response.statusText);
        console.log('响应头:', {
          contentType: response.headers.get('content-type'),
          contentLength: response.headers.get('content-length')
        });

        if (response.ok) {
          console.log('正在读取blob数据...');
          const blob = await response.blob();
          console.log('Blob大小:', blob.size, 'bytes, 类型:', blob.type);

          const filename = `${song.name} - ${formatArtist(song.artist)}.mp3`;
          console.log('添加到ZIP文件:', filename);
          zip.file(filename, blob);
          successCount++;
          console.log(`✓ 成功添加 (${successCount}/${total})`);
        } else {
          console.error(`✗ Fetch失败，状态码: ${response.status}`);
          console.error('响应文本:', await response.text());
        }
      } else {
        console.error(`✗ 无法获取下载链接，返回数据:`, data);
      }

      completed++;
      console.log(`进度: ${completed}/${total}, 成功: ${successCount}`);
      if (onProgress) {
        onProgress(completed, total, successCount);
      }

      // 短暂延迟避免请求过快
      console.log('等待300ms...');
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`✗ 处理失败: ${song.name}`);
      console.error('错误:', error);
      console.error('错误堆栈:', error.stack);
      completed++;
      if (onProgress) {
        onProgress(completed, total, successCount);
      }
    }
  }

  // 生成ZIP文件并下载
  console.log(`\n=== 开始生成ZIP文件 ===`);
  console.log('成功添加的文件数:', successCount);

  if (successCount > 0) {
    try {
      console.log('正在压缩ZIP...');
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      }, (metadata) => {
        console.log('ZIP生成进度:', metadata.percent.toFixed(2) + '%');
      });

      console.log('ZIP文件生成完成，大小:', zipBlob.size, 'bytes');

      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const zipFilename = `音乐下载_${successCount}首_${timestamp}.zip`;
      console.log('ZIP文件名:', zipFilename);

      const url = URL.createObjectURL(zipBlob);
      console.log('创建下载URL:', url);
      downloadFile(url, zipFilename);
      URL.revokeObjectURL(url);

      console.log('✓ ZIP文件下载已触发');
      console.log('=== 批量下载完成 ===');
    } catch (error) {
      console.error('✗ 生成ZIP文件失败');
      console.error('错误:', error);
      console.error('错误堆栈:', error.stack);
    }
  } else {
    console.error('✗ 没有成功添加任何文件到ZIP');
  }

  return successCount;
};

// 创建歌词文件内容
export const createLyricContent = (song, lyricData) => {
  let content = `歌曲：${song.name}\n`;
  content += `歌手：${formatArtist(song.artist)}\n`;
  content += `专辑：${song.album}\n`;
  content += `来源：${song.source}\n\n`;
  content += lyricData.lyric || '暂无歌词';

  if (lyricData.tlyric) {
    content += '\n\n=== 翻译歌词 ===\n';
    content += lyricData.tlyric;
  }

  return content;
};

// 防抖函数
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 节流函数
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};
