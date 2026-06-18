import { useEffect, useRef } from 'react';
import styles from './BurbujaCanvas.module.css';

export default function BurbujaCanvas() {
  const canvasRef = useRef(null);
  const bubbles = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const targetFPS = 60;
    const interval = 1000 / 60;
    let lastTime = performance.now() / targetFPS;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const createBubble = () => {
      const radius = Math.random() * 10 + 5;
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + radius,
        radius,
        speed: Math.random() * 0.4,
      };
    };

    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if(deltaTime >= interval){
        bubbles.current.forEach((bubble, index) => {
          bubble.y -= bubble.speed;

          ctx.beginPath();
          ctx.arc(bubble.x, bubble.y, bubble.radius, 0, 2 * Math.PI);
          ctx.fillStyle = `rgb(173, 216, 230)`;
          ctx.fill();

          if (bubble.y + bubble.radius < 0) {
            bubbles.current.splice(index, 1);
          }
        });

        if (bubbles.current.length < 30) {
          bubbles.current.push(createBubble());
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} />;
}