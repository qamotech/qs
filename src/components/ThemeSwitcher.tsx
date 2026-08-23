import { Palette } from 'lucide-react';
import Tooltip from './Tooltip';

export default function ThemeSwitcher({ theme, onChange }: { theme: 'midnight' | 'qamelot', onChange: (theme: 'midnight' | 'qamelot') => void }) {
  return (
    <Tooltip text={`Switch to ${theme === 'midnight' ? 'Qamelot Gold' : 'Midnight Tech'} Theme`}>
      <button 
        onClick={() => onChange(theme === 'midnight' ? 'qamelot' : 'midnight')}
        className="p-2 text-zinc-400 hover:text-cyan-400 transition-colors bg-zinc-900 border border-zinc-800 rounded-lg"
      >
        <Palette className="w-5 h-5" />
      </button>
    </Tooltip>
  );
}
