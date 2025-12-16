import { For, createSignal, createEffect } from 'solid-js';
import { getS3ImageURL } from '../../utils/loading';

import styles from './MakeAvatar.module.css';
import Chatting from './Chatting';


const avatarOptions = [
    {
        id: 1,
        name: '얼굴',
        image: getS3ImageURL('1-3/Maskgroup.png'),
    },
    {
        id: 2,
        name: '옷',
        image: getS3ImageURL('1-3/maiClothes.png'),
    },
    {
        id: 3,
        name: '장신구',
        image: getS3ImageURL('1-3/maiHeadSet.png'),
    },
];

type MakeAvatarProps = {
    onError?: (error: Error) => void;
    onRestart?: () => void;
    restartTrigger?: number; // 재시작 트리거 (변경될 때마다 재시작)
};

const MakeAvatar = (props: MakeAvatarProps = {}) => {
    const [selectedOption, setSelectedOption] = createSignal<typeof avatarOptions[0]>(avatarOptions[0]);
    const [isInteractionDisabled, setIsInteractionDisabled] = createSignal(false);
    const [completedOptionIds, setCompletedOptionIds] = createSignal<number[]>([]);
    
    // 재시작 트리거가 변경되면 완료된 옵션들을 초기화
    createEffect(() => {
        const trigger = props.restartTrigger;
        if (trigger !== undefined && trigger > 0) {
            setCompletedOptionIds([]);
            setSelectedOption(avatarOptions[0]);
        }
    });

    const handleOptionClick = (option: typeof avatarOptions[0]) => {
        if (isInteractionDisabled()) return;
        setSelectedOption(option);
    };

    const getImageSrc = () => {
        return selectedOption().image;
    };

    const getImageText = () => {
        return `원하는 캐릭터의 ${selectedOption().name}${selectedOption().id === 3? '를' : '을'} 상세히 그려보세요`;
    };

    const renderAvatarOption = (option: typeof avatarOptions[0]) => {
        const isActive = () => selectedOption().id === option.id;
        const isCompleted = () => completedOptionIds().includes(option.id);
        return (
            <div 
                class={styles.avatarOption}
                classList={{ [styles.avatarOptionDisabled]: isInteractionDisabled() }}
                onClick={() => handleOptionClick(option)}
                style={{
                    'background-color': isCompleted()
                        ? '#D5F3B0'
                        : isActive()
                            ? '#A9C1FF'
                            : '#d9d9d9'
                }}
            >
                <span class={styles.avatarOptionText}>{option.name}</span>
            </div>
        );
    };

  return (
    <div class={styles.container}>
        <h1 class={styles.title}>실습 : 캐릭터 만들어보기</h1>
        <div class={styles.content}>
            <div class={styles.imgContainer}>
                <img 
                    class={styles.img} 
                    classList={{ 
                        [styles.imgWithShadow]: selectedOption().id === 2,
                        // [styles.imgLarge]: selectedOption().id === 2
                    }}
                    src={getImageSrc()} 
                    alt={selectedOption().name} 
                />
                <span class={styles.imgText}>{getImageText()}</span>
            </div>
            
            <div class={styles.chattingContainer}>
                <Chatting 
                    selectedOption={selectedOption()} 
                    allOptions={avatarOptions}
                    onLoadingChange={(loading) => setIsInteractionDisabled(loading)}
                    onCompletedOptionsChange={(ids) => setCompletedOptionIds(ids)}
                    onError={props.onError}
                    restartTrigger={props.restartTrigger}
                />
                <div class={styles.avatarOptions}>
                    <For each={avatarOptions}>
                        {(option) => renderAvatarOption(option)}
                    </For>
                </div>
            </div>

        </div>
        <div class={styles.springs}>
                <img class={styles.springsImg} src={getS3ImageURL('1-3/diarySpring.png')} alt="spring" />
                <img class={styles.springsImg} src={getS3ImageURL('1-3/diarySpring.png')} alt="spring" />
                <img class={styles.springsImg} src={getS3ImageURL('1-3/diarySpring.png')} alt="spring" />
                <img class={styles.springsImg} src={getS3ImageURL('1-3/diarySpring.png')} alt="spring" />
                <img class={styles.springsImg} src={getS3ImageURL('1-3/diarySpring.png')} alt="spring" />
        </div>
    </div>
  )
};

export default MakeAvatar;

