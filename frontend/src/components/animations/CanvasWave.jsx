import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const CanvasWave = ({ color = '#147efb', height = 200, speed = 0.1 }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const animationRef = useRef(null);
  const pointsRef = useRef([]);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = height;
    };

    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);

    // Get context
    const context = canvas.getContext('2d');
    contextRef.current = context;

    // Initialize points
    const initPoints = () => {
      const points = [];
      const numberOfPoints = Math.ceil(canvas.width / 50) + 2; // One point every 50px + extra points for smooth edges
      const horizontalDistance = canvas.width / (numberOfPoints - 3);

      for (let i = 0; i < numberOfPoints; i++) {
        const x = i === 0 ? -50 : i === numberOfPoints - 1 ? canvas.width + 50 : (i - 1) * horizontalDistance;
        points.push({
          x,
          y: canvas.height / 2,
          originalY: canvas.height / 2,
          amplitude: Math.random() * 20 + 10,
          speed: speed * (0.8 + Math.random() * 0.4),
          phase: Math.random() * Math.PI * 2
        });
      }

      pointsRef.current = points;
    };

    initPoints();

    // Animate wave
    const animate = () => {
      if (!contextRef.current || !canvasRef.current) return;

      const ctx = contextRef.current;
      const canvas = canvasRef.current;
      const points = pointsRef.current;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update points
      const frame = frameRef.current;
      points.forEach(point => {
        point.y = point.originalY + Math.sin(frame * point.speed + point.phase) * point.amplitude;
      });
      
      // Draw wave
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      
      // Draw first point
      ctx.lineTo(points[0].x, points[0].y);
      
      // Draw curve through points
      for (let i = 0; i < points.length - 1; i++) {
        const currentPoint = points[i];
        const nextPoint = points[i + 1];
        
        // Calculate control points for smooth curve
        const controlX = (currentPoint.x + nextPoint.x) / 2;
        const controlY1 = currentPoint.y;
        const controlY2 = nextPoint.y;
        
        ctx.bezierCurveTo(
          controlX, controlY1,
          controlX, controlY2,
          nextPoint.x, nextPoint.y
        );
      }
      
      // Complete the shape
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();
      
      // Increment frame
      frameRef.current += 1;
      
      // Continue animation
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    // GSAP animation for smooth height changes
    gsap.to(canvasRef.current, {
      height,
      duration: 1,
      ease: "power2.inOut"
    });

    // Cleanup
    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [color, height, speed]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: `${height}px`,
        zIndex: -1
      }}
    />
  );
};

export default CanvasWave;
