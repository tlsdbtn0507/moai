import { Show, createMemo, createSignal, createEffect } from 'solid-js';
import { getS3ImageURL, preloadImages } from '../../../utils/loading';
import { LoadingSpinner } from '../../LoadingSpinner';
import styles from './Modal.module.css';

type DescribeModalProps = {
  isOpen: boolean;
  onClose?: () => void;
  selectedValue?: 'mt' | 'sea' | 'city' | null;
  onSubmit?: (description: string) => Promise<void> | void;
  isSubmitting?: boolean;
  generatedImageUrl?: string | null;
  errorMessage?: string | null;
  userInput?: string;
};

export function DescribeModal(props: DescribeModalProps) {
  // 선택된 값의 첫 글자를 대문자로 변환하여 이미지 URL 생성
  const imageUrl = createMemo(() => {
    if (!props.selectedValue) return null;
    const capitalized = props.selectedValue.charAt(0).toUpperCase() + props.selectedValue.slice(1);
    return getS3ImageURL(`sunsetOf${capitalized}.png`);
  });

  const [description, setDescription] = createSignal('');
  const [isReady, setIsReady] = createSignal(false);

  // 모달이 열리고 imageUrl이 변경될 때마다 이미지 로딩
  createEffect(async () => {
    if (!props.isOpen) {
      setIsReady(false);
      return;
    }
    
    const url = imageUrl();
    setIsReady(false);
    
    if (url) {
      try {
        await preloadImages([url]);
        setIsReady(true);
      } catch (error) {
        setIsReady(true); // 에러가 발생해도 화면은 표시
      }
    } else {
      setIsReady(true);
    }
  });

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    const value = description().trim();
    if (!value) return;
    if (props.onSubmit) {
      await props.onSubmit(value);
    }
    setDescription('');
  };

  return (
    <Show when={props.isOpen}>
      <div class={styles.overlay} onClick={props.onClose}>
        <div class={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h1 class={styles.modalTitle}>이 그림을 MAI에게 설명해보자!</h1>
          <Show when={isReady()} fallback={<LoadingSpinner />}>
          <button
        style={{
          position: 'absolute',
          top: '3.5rem',
          right: '9.5rem',
          width: '40px',
          height: '40px',
          'border-radius': '999px',
          border: 'none',
          background: 'rgba(255, 255, 255, 0.9)',
          cursor: 'pointer',
          'font-size': '1.2rem',
          'font-weight': 700,
          'box-shadow': '0 2px 6px rgba(0, 0, 0, 0.2)',
          'z-index': 10,
        }}
        onClick={() => {
          localStorage.removeItem('describeSelectedValue');
          props.onClose?.();
        }}
      >
        ✕
      </button>
            {imageUrl() && (
              <img 
                src={imageUrl()!} 
                alt={props.selectedValue || ''} 
                style={{ width: '500px', height: '400px' }}
              />
            )}
          <form class={styles.inputGroup} onSubmit={handleSubmit}>
            <input
              type="text"
              class={styles.descriptionInput}
              placeholder="위 사진을 아주 정확하고 세세하게 묘사해보세요"
              value={description()}
              onInput={(event) => setDescription(event.currentTarget.value)}
            />
            <button
              type="submit"
              class={styles.submitButton}
              disabled={props.isSubmitting}
            >
              {props.isSubmitting ? '전송 중...' : '입력'}
            </button>
          </form>
          {props.errorMessage && (
            <p class={styles.statusMessage}>{props.errorMessage}</p>
          )}
          </Show>
        </div>
      </div>
    </Show>
  );
}

