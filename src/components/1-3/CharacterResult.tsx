import { onMount, onCleanup } from 'solid-js';
import styles from './CharacterResult.module.css';
import { getS3ImageURL } from '../../utils/loading';
import { SpeechBubble } from '../SpeechBubble';
import { makingAvatarsScripts } from '../../data/scripts/1-3';
import { useTypingAnimation } from '../../utils/hooks/useTypingAnimation';
import { useAudioPlayback } from '../../utils/hooks/useAudioPlayback';

type CharacterResultProps = {
    characterImageUrl: string;
    onRetry: () => void;
    onConfirm: () => void;
};

const CharacterResult = (props: CharacterResultProps) => {
    // 스크립트 가져오기 (id 4)
    const script = makingAvatarsScripts.find(s => s.id === 4);
    const scriptText = script?.script || '짜잔~ 너만의 캐릭터가 완성됐어\n어때 맘에 들어?';
    const voiceFile = script?.voice || '';
    
    // 타이핑 애니메이션 훅
    const typingAnimation = useTypingAnimation({ typingSpeed: 150 });
    
    // 오디오 재생 훅
    const audioPlayback = useAudioPlayback();
    
    // 컴포넌트가 마운트될 때 오디오 재생 및 타이핑 애니메이션 시작
    onMount(() => {
        // 스킵 상태 초기화
        typingAnimation.resetSkipState();
        
        // 오디오 재생
        if (voiceFile) {
            audioPlayback.playAudio(voiceFile, {
                onLoaded: () => {
                    // 오디오 재생 후 0.5초 뒤에 타이핑 애니메이션 시작
                    setTimeout(() => {
                        typingAnimation.startTyping(scriptText);
                    }, 500);
                },
            });
        } else {
            // 음성 파일이 없으면 바로 타이핑 애니메이션 시작
            setTimeout(() => {
                typingAnimation.startTyping(scriptText);
            }, 500);
        }
    });
    
    // 컴포넌트가 언마운트될 때 정리
    onCleanup(() => {
        typingAnimation.setDisplayedMessage('');
        typingAnimation.resetSkipState();
        audioPlayback.stopAudio();
    });
    
    return (
        <div class={styles.container}>
            <div class={styles.contentWrapper}>
                {/* 가운데 회색 배경 위에 캐릭터 이미지 */}
                <div class={styles.characterImageContainer}>
                    <div class={styles.characterPlaceholder}>
                        <img 
                            src={props.characterImageUrl} 
                            alt="Generated Character" 
                            class={styles.characterImage}
                        />
                        <div class={styles.shadow}></div>
                    </div>
                </div>

                {/* 말풍선 */}
                <div class={styles.speechBubbleContainer}>
                    <SpeechBubble 
                        size={550}
                        message={typingAnimation.displayedMessage() || scriptText}
                    />
                </div>

                {/* 버튼들 */}
                <div class={styles.buttonsContainer}>
                    <button  class={styles.button} onClick={props.onRetry}>
                        다시 하기
                    </button>
                    <button  class={styles.button} onClick={props.onConfirm}>
                        맘에 들어
                    </button>
                </div>

                {/* 오른쪽 하단 MAI 로봇 */}
                {/* <div class={styles.maiRobotContainer}> */}
                    <img 
                        src={getS3ImageURL('1-3/finishingMai.png')} 
                        alt="MAI Robot" 
                        class={styles.maiRobot}
                    />
                {/* </div> */}
            </div>
        </div>
    );
};

export default CharacterResult;

