import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const AnimatedCard = ({ children, delay = 0, className = '' }) => {
  const cardRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const card = cardRef.current;
    
    if (!card || hasAnimated.current) return;
    
    // Initial state
    gsap.set(card, { 
      y: 50,
      opacity: 0,
      scale: 0.95
    });
    
    // Create animation
    const animation = gsap.to(card, {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.8,
      delay: delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: card,
        start: "top 85%",
        toggleActions: "play none none none"
      },
      onComplete: () => {
        hasAnimated.current = true;
      }
    });
    
    // Mouse hover effect
    const handleMouseEnter = () => {
      gsap.to(card, {
        y: -10,
        scale: 1.03,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        duration: 0.3,
        ease: "power2.out"
      });
    };
    
    const handleMouseLeave = () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        duration: 0.3,
        ease: "power2.out"
      });
    };
    
    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);
    
    // Cleanup
    return () => {
      if (animation) {
        animation.kill();
      }
      
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [delay]);

  return (
    <div 
      ref={cardRef} 
      className={`transition-shadow duration-300 ${className}`}
      style={{ 
        transform: 'translateZ(0)',
        willChange: 'transform, opacity'
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;
