
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Repeat, Shuffle } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  src: string;
  duration?: number;
  artwork?: string;
}

interface AdvancedAudioPlayerProps {
  tracks: Track[];
  currentTrackIndex?: number;
  autoPlay?: boolean;
  showPlaylist?: boolean;
}

const AdvancedAudioPlayer = ({ 
  tracks, 
  currentTrackIndex = 0, 
  autoPlay = false,
  showPlaylist = true 
}: AdvancedAudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(currentTrackIndex);
  const [repeat, setRepeat] = useState<'none' | 'one' | 'all'>('none');
  const [shuffle, setShuffle] = useState(false);

  const currentTrack = tracks[currentIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => handleNext();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentIndex]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const handleSeek = (value: number[]) => {
    const time = value[0];
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const vol = value[0];
    setVolume(vol);
    setIsMuted(vol === 0);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      audioRef.current.muted = newMuted;
    }
  };

  const handleNext = () => {
    if (repeat === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    }

    let nextIndex;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * tracks.length);
    } else {
      nextIndex = (currentIndex + 1) % tracks.length;
    }

    if (nextIndex === 0 && repeat === 'none') {
      setIsPlaying(false);
      return;
    }

    setCurrentIndex(nextIndex);
  };

  const handlePrevious = () => {
    if (currentTime > 3) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    } else {
      const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
      setCurrentIndex(prevIndex);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const selectTrack = (index: number) => {
    setCurrentIndex(index);
    setCurrentTime(0);
  };

  return (
    <div className="space-y-4">
      <audio ref={audioRef} src={currentTrack?.src} autoPlay={autoPlay} />
      
      {/* Main Player */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            {currentTrack?.artwork && (
              <img 
                src={currentTrack.artwork} 
                alt={currentTrack.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold">{currentTrack?.title}</h3>
              <p className="text-sm text-muted-foreground">{currentTrack?.artist}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              onValueChange={handleSeek}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShuffle(!shuffle)}
                className={shuffle ? 'text-blue-600' : ''}
              >
                <Shuffle className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="icon" onClick={handlePrevious}>
                <SkipBack className="h-5 w-5" />
              </Button>
              
              <Button variant="default" size="icon" onClick={togglePlay}>
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              
              <Button variant="ghost" size="icon" onClick={handleNext}>
                <SkipForward className="h-5 w-5" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setRepeat(repeat === 'none' ? 'all' : repeat === 'all' ? 'one' : 'none')}
                className={repeat !== 'none' ? 'text-blue-600' : ''}
              >
                <Repeat className="h-4 w-4" />
                {repeat === 'one' && <span className="absolute -top-1 -right-1 text-xs">1</span>}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleMute}>
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <div className="w-20">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Playlist */}
      {showPlaylist && tracks.length > 1 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3">Playlist</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  onClick={() => selectTrack(index)}
                  className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                    index === currentIndex ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs">
                    {index === currentIndex && isPlaying ? (
                      <Pause className="h-3 w-3" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{track.title}</p>
                    <p className="text-xs text-muted-foreground">{track.artist}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {track.duration ? formatTime(track.duration) : '--:--'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedAudioPlayer;
