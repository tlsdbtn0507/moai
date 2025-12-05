import { onCleanup } from 'solid-js';
import { getS3TTSURL } from '../loading';

export interface UseAudioPlaybackOptions {
  onEnded?: () => void;
  onError?: (error: Event) => void;
  onLoaded?: () => void;
}

export interface UseAudioPlaybackReturn {
  playAudio: (audioFile: string, options?: UseAudioPlaybackOptions) => void;
  pauseAudio: () => void;
  stopAudio: () => void;
  isPlaying: () => boolean;
  currentAudio: HTMLAudioElement | null;
}

/**
 * 오디오 재생을 관리하는 커스텀 훅
 */
export function useAudioPlayback(): UseAudioPlaybackReturn {
  let currentAudio: HTMLAudioElement | null = null;

  const playAudio = (
    audioFile: string,
    options: UseAudioPlaybackOptions = {}
  ) => {
    const { onEnded, onError, onLoaded } = options;

    // 기존 오디오 정지
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }

    // 오디오 파일 URL 생성 (이미 URL인 경우 그대로 사용)
    const audioUrl = audioFile.startsWith('http') 
      ? audioFile 
      : getS3TTSURL(audioFile);
    
    console.log('오디오 파일명:', audioFile);
    console.log('생성된 오디오 URL:', audioUrl);
    
    currentAudio = new Audio(audioUrl);

    currentAudio.addEventListener('loadeddata', () => {
      console.log('오디오 로드 성공:', audioUrl);
      if (onLoaded) {
        onLoaded();
      }
      currentAudio?.play().catch((error) => {
        console.error('오디오 재생 실패:', error);
        if (onError) {
          onError(error as any);
        }
      });
    });

    currentAudio.addEventListener('ended', () => {
      if (onEnded) {
        onEnded();
      }
      currentAudio = null;
    });

    currentAudio.addEventListener('error', (e) => {
      console.error('오디오 로드 실패:', audioUrl);
      console.error('오디오 에러 상세:', e);
      console.error('오디오 엘리먼트 에러:', currentAudio?.error);
      if (onError) {
        onError(e);
      }
    });

    currentAudio.load();
  };

  const pauseAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
    }
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
  };

  const isPlaying = () => {
    return currentAudio !== null && !currentAudio.paused && !currentAudio.ended;
  };

  onCleanup(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
  });

  return {
    playAudio,
    pauseAudio,
    stopAudio,
    isPlaying,
    get currentAudio() {
      return currentAudio;
    },
  };
}

