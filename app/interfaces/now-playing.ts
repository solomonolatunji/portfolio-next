export interface NowPlaying {
  isPlaying: boolean;
  title: string;
  artist: string;
  album?: string;
  artworkUrl?: string;
  deviceName?: string;
  deviceType?: string;
  spotifyUrl: string;
  appleMusicUrl?: string;
  youtubeUrl?: string;
}

export interface NowPlayingResult {
  track: NowPlaying | null;
}
