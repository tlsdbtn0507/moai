import { createSignal, onMount, Show, createEffect, createMemo } from 'solid-js';
import styles from './SpeechBubble.module.css';
import { getS3ImageURL, preloadImages } from '../utils/loading';
import { LoadingSpinner } from './LoadingSpinner';
import { ScriptHistoryModal } from './ScriptHistoryModal';

type SpeechBubbleType = 'default' | 'simple' | 'smartie' | 'kylie' | 'logos';

type ScriptItem = {
  id: number;
  script: string;
};

type SpeechBubbleProps = {
  message: string;
  size?: number;
  type?: SpeechBubbleType;
  showNavigation?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  canGoNext?: () => boolean;
  canGoPrev?: () => boolean;
  isComplete?: () => boolean; // 타이핑 애니메이션과 음성 재생이 완료되었는지 확인
  scriptHistory?: ScriptItem[]; // 대사 히스토리
  currentScriptIndex?: number; // 현재 대사 인덱스
  onModalStateChange?: (isOpen: boolean) => void; // 모달 상태 변경 콜백
};

export function SpeechBubble(props: SpeechBubbleProps) {
  const [isReady, setIsReady] = createSignal(false);
  const [backgroundImageStyleURL, setBackgroundImageStyleURL] = createSignal<string>('');
  const [isImageLoading, setIsImageLoading] = createSignal(false);
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  
  // type에 따라 이미지 선택
  const getImageName = (): string => {
    const type = props.type || 'default';
    switch (type) {
      case 'simple':
        return '4-2/simpleSpeechBubble.png';
      case 'smartie':
        return '4-2/smartieSpeechBubble.png';
      case 'kylie':
        return '4-2/kylieSpeechBubble.png';
      case 'logos':
        return '4-2/logosSpeechBubble.png';
      case 'default':
      default:
        return 'speechBubble.png';
    }
  };
  
  // 초기 마운트 시 이미지 로드
  onMount(async () => {
    const imageName = getImageName();
    const imageUrl = getS3ImageURL(imageName);
    
    try {
      await preloadImages([imageUrl]);
      setBackgroundImageStyleURL(`url(${imageUrl})`);
      setIsReady(true);
    } catch (error) {
      setBackgroundImageStyleURL(`url(${imageUrl})`);
      setIsReady(true); // 에러가 발생해도 화면은 표시
    }
  });
  
  // type이 변경될 때마다 이미지 다시 로드 (기존 이미지 유지하면서)
  createEffect(async () => {
    const imageName = getImageName();
    const imageUrl = getS3ImageURL(imageName);
    const currentUrl = backgroundImageStyleURL();
    
    // 이미 같은 이미지면 스킵
    if (currentUrl === `url(${imageUrl})`) return;
    
    // 이미 로드 중이면 스킵
    if (isImageLoading()) return;
    
    // 초기 로드가 완료되지 않았으면 스킵 (onMount에서 처리)
    if (!isReady()) return;
    
    setIsImageLoading(true);
    try {
      await preloadImages([imageUrl]);
      // 새 이미지 로드 완료 후 전환
      setBackgroundImageStyleURL(`url(${imageUrl})`);
    } catch (error) {
      // 에러가 발생해도 이미지 URL은 설정
      setBackgroundImageStyleURL(`url(${imageUrl})`);
    } finally {
      setIsImageLoading(false);
    }
  });

  // 반응형으로 버튼 표시 여부 계산
  // message prop도 읽어서 변경 시 재계산되도록 함
  const shouldShowNextButton = createMemo(() => {
    // message를 읽어서 반응형 추적 활성화
    const _ = props.message;
    
    if (!props.showNavigation || !props.onNext) return false;
    
    // isComplete와 canGoNext를 호출하여 반응형 추적 활성화
    const complete = props.isComplete ? props.isComplete() : true;
    const canNext = props.canGoNext ? props.canGoNext() : true;
    
    return complete && canNext;
  });

  const shouldShowPrevButton = createMemo(() => {
    // message를 읽어서 반응형 추적 활성화
    const _ = props.message;
    
    if (!props.showNavigation || !props.onPrev) return false;
    
    // isComplete와 canGoPrev를 호출하여 반응형 추적 활성화
    const complete = props.isComplete ? props.isComplete() : true;
    const canPrev = props.canGoPrev ? props.canGoPrev() : true;
    
    return complete && canPrev;
  });

  return (
    <Show when={isReady()} fallback={<LoadingSpinner />}>
      <div
        style={{
          position: 'relative',
          'background-image': backgroundImageStyleURL(),
          'background-position': 'center',
          'background-repeat': 'no-repeat',
          'background-size': 'contain',
          width: `${props.size || 650}px`,
          height: '198px',
          display: 'flex',
          'flex-direction': 'column-reverse',
          'justify-content': 'center',
          'align-items': 'center',
          padding: '2rem 4rem 1.4rem 4rem',
          'text-align': 'center',
          transition: 'opacity 0.3s ease-in-out',
          opacity: isImageLoading() ? 0.7 : 1,
        }}
      >
        {/* 대사집 모달 버튼 */}
        <Show when={props.scriptHistory && props.scriptHistory.length > 0}>
          <button
            onClick={() => {
              setIsModalOpen(true);
              props.onModalStateChange?.(true);
            }}
            class={styles.scriptHistoryButton}
            title="대사집 보기"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 9h6M9 13h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </Show>
        <Show when={shouldShowPrevButton()}>
          <button
            onClick={props.onPrev}
            class={styles.prevButton}
          >
            이전
          </button>
        </Show>
        <p style={{ 'font-size': '1.4rem', 'font-weight': '700', color: '#3b1a07', 'white-space': 'pre-line' }}>{props.message}</p>
        <Show when={shouldShowNextButton()}>
          <button
            onClick={props.onNext}
            class={styles.nextButton}
          >
            다음
          </button>
        </Show>
      </div>
      <Show when={props.scriptHistory && props.scriptHistory.length > 0}>
        <ScriptHistoryModal
          isOpen={isModalOpen()}
          onClose={() => {
            setIsModalOpen(false);
            props.onModalStateChange?.(false);
          }}
          scripts={props.scriptHistory!}
          currentIndex={props.currentScriptIndex ?? 0}
        />
      </Show>
    </Show>
  );
}

