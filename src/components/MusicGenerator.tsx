import { useState } from 'react';
import { Music, Loader2, Play, Square } from 'lucide-react';

export default function MusicGenerator() {
  const [genre, setGenre] = useState('Lo-fi Hip Hop');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const generateMusic = async () => {
    setLoading(true);
    setAudioUrl(null);
    try {
      const response = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genre }),
      });
      const data = await response.json();
      
      const binary = atob(data.audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: data.mimeType });
      setAudioUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col gap-4">
      <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
        <Music className="w-4 h-4" /> AI Music Generator
      </h3>
      <input
        type="text"
        value={genre}
        onChange={(e) => setGenre(e.target.value)}
        className="bg-zinc-800 text-white rounded p-2"
        placeholder="Enter genre (e.g., Lo-fi Hip Hop)"
      />
      <button
        onClick={generateMusic}
        disabled={loading}
        className="bg-cyan-600 hover:bg-cyan-500 text-white rounded p-2 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Generate Music'}
      </button>
      {audioUrl && (
        <audio controls src={audioUrl} className="w-full mt-2" />
      )}
    </div>
  );
}
