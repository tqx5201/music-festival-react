import { useEffect, useRef } from 'react';
import { useMusic } from '../contexts/MusicContext';
import './AudioVisualizer.css';

const AudioVisualizer = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const { isPlaying, currentSong } = useMusic();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // 设置画布尺寸
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = 100;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 绘制波浪
    const drawWave = () => {
      animationRef.current = requestAnimationFrame(drawWave);

      // 清除画布
      ctx.fillStyle = 'rgba(12, 12, 12, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 设置波浪样式 - 使用CSS变量的主题色
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      const primaryColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--primary-color').trim();

      gradient.addColorStop(0, primaryColor);
      gradient.addColorStop(0.5, primaryColor + 'cc');
      gradient.addColorStop(1, primaryColor);

      ctx.lineWidth = 3;
      ctx.strokeStyle = gradient;
      ctx.beginPath();

      // 生成模拟音频数据的波浪
      const time = Date.now() * 0.002;
      const amplitude = isPlaying ? 30 + Math.random() * 20 : 5; // 播放时振幅更大
      const frequency = 0.02;
      const points = 100;

      for (let i = 0; i <= points; i++) {
        const x = (i / points) * canvas.width;
        // 使用正弦波加上一些随机性来模拟音频波形
        const noise = isPlaying ? Math.random() * 10 : 0;
        const y = canvas.height / 2 + Math.sin(i * frequency + time) * amplitude + noise;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      // 添加镜像波浪
      ctx.beginPath();
      ctx.strokeStyle = primaryColor + '4d'; // 30% opacity

      for (let i = 0; i <= points; i++) {
        const x = (i / points) * canvas.width;
        const noise = isPlaying ? Math.random() * 10 : 0;
        const y = canvas.height / 2 - Math.sin(i * frequency + time) * amplitude - noise;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
    };

    // 开始动画
    drawWave();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  // 如果没有歌曲或不在播放，不显示波形
  if (!currentSong) {
    return null;
  }

  return (
    <div className="audio-visualizer">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default AudioVisualizer;
