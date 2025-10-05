import { useEffect, useRef } from 'react';
import { useMusic } from '../contexts/MusicContext';
import './Lyrics.css';

const Lyrics = () => {
  const { lyrics, currentLyricIndex, seekTo } = useMusic();
  const lyricsContainerRef = useRef(null);
  const isUserScrolling = useRef(false);
  const scrollTimeout = useRef(null);

  useEffect(() => {
    const container = lyricsContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      isUserScrolling.current = true;
      clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        isUserScrolling.current = false;
      }, 2000);
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (currentLyricIndex >= 0 && !isUserScrolling.current) {
      const container = lyricsContainerRef.current;
      const activeLine = container?.querySelector('.lyric-line.active');

      if (activeLine && container) {
        const containerHeight = container.clientHeight;
        const lineOffsetTop = activeLine.offsetTop;
        const lineHeight = activeLine.offsetHeight;

        // 计算滚动位置，使当前歌词居中
        const scrollTop = lineOffsetTop - (containerHeight / 2) + (lineHeight / 2);

        container.scrollTo({
          top: scrollTop,
          behavior: 'smooth',
        });
      }
    }
  }, [currentLyricIndex]);

  const handleLyricClick = (time) => {
    seekTo(time);
  };

  if (!lyrics || lyrics.length === 0) {
    return (
      <div className="lyrics-section">
        <h2 className="section-title">
          <i className="fas fa-align-left"></i>
          歌词
        </h2>
        <div className="lyrics-container">
          <div className="empty-lyrics">暂无歌词</div>
        </div>
      </div>
    );
  }

  return (
    <div className="lyrics-section">
      <h2 className="section-title">
        <i className="fas fa-align-left"></i>
        歌词
      </h2>
      <div className="lyrics-container" ref={lyricsContainerRef}>
        {lyrics.map((lyric, index) => (
          <div
            key={index}
            className={`lyric-line ${index === currentLyricIndex ? 'active' : ''}`}
            onClick={() => handleLyricClick(lyric.time)}
          >
            {lyric.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lyrics;
