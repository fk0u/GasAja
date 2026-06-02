import { Clock, Users } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { VIBE_EMOJI } from '@/lib/constants';

/**
 * TrendingPlanCard — compact plan card for horizontal scroll carousel.
 * @param {{ plan: Object }} props
 */
const TrendingPlanCard = ({ plan }) => {
  const coverImg = plan.coverImage || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&q=80';
  const vibeEmoji = VIBE_EMOJI[plan.vibe] || '✨';
  return (
    <Link to={`/${plan.creatorUsername || 'u'}/${plan.slug || plan.id}`} className="min-w-[260px] snap-start">
      <div className="relative h-40 rounded-2xl overflow-hidden border border-white/[0.06]">
        <img src={coverImg} alt="" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-3">
          <span className="text-[10px] bg-gas-orange/80 text-white px-2 py-0.5 rounded-full font-bold w-fit mb-1">{vibeEmoji} {(plan.vibe||'').toUpperCase()}</span>
          <h4 className="font-black text-white text-sm leading-tight">{plan.title}</h4>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-300 font-medium">
            <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{plan.date}</span>
            <span className="flex items-center gap-0.5"><Users className="w-3 h-3" />{plan.participants?.length||0}/{plan.maxParticipants}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TrendingPlanCard;
