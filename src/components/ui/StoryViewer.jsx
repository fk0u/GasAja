import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const StoryViewer = ({ stories, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [now] = useState(() => Date.now());
  const story = stories[currentIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex(i => i + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + 2;
      });
    }, 100);
    return () => {
      clearInterval(interval);
      setProgress(0);
    };
  }, [currentIndex, stories.length, onClose]);

  const goNext = () => {
    if (currentIndex < stories.length - 1) { setCurrentIndex(i => i + 1); setProgress(0); }
    else onClose();
  };
  const goPrev = () => {
    if (currentIndex > 0) { setCurrentIndex(i => i - 1); setProgress(0); }
  };

  if (!story) return null;

  const isText = story.type === 'text';

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
    >
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-30 flex gap-1 p-3 pt-4">
        {stories.map((_, i) => (
          <div key={i} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-100"
              style={{ width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%' }} />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-0 right-0 z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <img src={story.userAvatar} alt="" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
          <div>
            <p className="text-white font-bold text-sm">{story.userName}</p>
            <p className="text-white/60 text-xs">{Math.round((now - story.createdAt) / 60000)}m lalu</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-white"><X className="w-6 h-6" /></button>
      </div>

      {/* Content */}
      {isText ? (
        <div className={`w-full h-full bg-gradient-to-br ${story.bgGradient || 'from-purple-600 to-pink-500'} flex items-center justify-center p-10`}>
          <p className="text-white text-3xl font-black text-center leading-relaxed drop-shadow-xl">{story.caption}</p>
        </div>
      ) : (
        <>
          <img src={story.image} alt="" className="w-full h-full object-cover" />
          {story.caption && (
            <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20">
              <p className="text-white font-bold text-lg">{story.caption}</p>
            </div>
          )}
        </>
      )}

      {/* Tap areas */}
      <div className="absolute inset-0 z-20 flex">
        <div className="w-1/3 h-full" onClick={goPrev} />
        <div className="w-1/3 h-full" />
        <div className="w-1/3 h-full" onClick={goNext} />
      </div>
    </motion.div>
  );
};

export default StoryViewer;
