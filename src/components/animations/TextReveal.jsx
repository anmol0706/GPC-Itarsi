import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const TextReveal = ({ children, delay = 0, duration = 1, stagger = 0.1, className = '' }) => {
  const textRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const textElement = textRef.current;

    if (!textElement) return;
    if (hasAnimated.current) return;

    try {
      // Get the original text content
      const originalText = textElement.innerText;

      // Split text into words
      const words = originalText.split(' ');
      textElement.innerHTML = '';

      // Create a container for the words with proper spacing
      const container = document.createElement('div');
      container.style.display = 'inline';
      container.style.whiteSpace = 'normal';

      // Create spans for each word
      words.forEach((word, index) => {
        // Create a span for the word
        const wordSpan = document.createElement('span');
        wordSpan.innerText = word;
        wordSpan.style.display = 'inline-block';
        wordSpan.style.opacity = 0;
        wordSpan.style.transform = 'translateY(20px)';
        container.appendChild(wordSpan);

        // Add a space after each word (except the last one)
        if (index < words.length - 1) {
          const spaceSpan = document.createElement('span');
          spaceSpan.innerHTML = ' ';
          spaceSpan.style.display = 'inline';
          container.appendChild(spaceSpan);
        }
      });

      textElement.appendChild(container);

      // Animate each word
      const wordElements = container.querySelectorAll('span');
      const wordsOnly = Array.from(wordElements).filter((el, i) => i % 2 === 0); // Only target the word spans, not spaces

      // Make sure all words are visible even before animation
      wordsOnly.forEach(word => {
        word.style.opacity = 1;
        word.style.transform = 'translateY(0)';
      });

      const animation = gsap.to(wordsOnly, {
        opacity: 1,
        y: 0,
        duration: duration,
        stagger: stagger,
        delay: delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: textElement,
          start: "top 80%",
          toggleActions: "play none none none"
        },
        onComplete: () => {
          hasAnimated.current = true;
        }
      });

      return () => {
        if (animation) {
          animation.kill();
        }
      };
    } catch (error) {
      console.error('Error in TextReveal animation:', error);
      // If animation fails, at least make the text visible
      textElement.style.opacity = 1;
    }
  }, [delay, duration, stagger]);

  return (
    <div ref={textRef} className={className}>
      {children}
    </div>
  );
};

export default TextReveal;
