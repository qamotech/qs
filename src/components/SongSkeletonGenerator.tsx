import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

export default function SongSkeletonGenerator({ 
  onGenerate 
}: { 
  onGenerate: (skeleton: { grid: boolean[][], sounds: string[] }) => void 
}) {
  const [loading, setLoading] = useState(false);

  const generateSkeleton = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-skeleton', {
        method: 'POST',
      });
      const data = await response.json();
      onGenerate(data);
    } catch (error) {
      console.error("Error generating skeleton:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={generateSkeleton}
      disabled={loading}
      className="bg-purple-900/50 hover:bg-purple-800/50 border border-purple-700/50 text-purple-200 rounded-lg p-3 w-full flex items-center justify-center gap-2 transition-all"
    >
      {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      {loading ? 'Generating...' : 'AI Song Skeleton'}
    </button>
  );
}
