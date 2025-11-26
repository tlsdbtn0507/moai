import { A, useParams } from '@solidjs/router';
import { WorldMapDropdown } from '../components/WorldMapDropdown';
import pageContainerStyles from '../styles/PageContainer.module.css';

const stepNames = [
  '사전학습',
  '공통성 탐구',
  '개념 설명 및 원리 정리',
  '실제연습',
  '학습 마무리 및 AI 분석 리뷰',
];

export function Class() {
  const params = useParams();
  const worldId = params.worldId;
  const classId = params.classId;

  return (
    <div class={pageContainerStyles.container}>
      <WorldMapDropdown />
      <h1>월드 {worldId} - 클래스 {classId}</h1>
      <p>학습 단계를 선택하세요</p>
      <div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem', margin: '2rem 0' }}>
        {stepNames.map((stepName, index) => {
          const stepId = index + 1;
          return (
            <A
              href={`/${worldId}/${classId}/${stepId}`}
              style={{
                display: 'block',
                padding: '1.5rem',
                background: '#fff3e0',
                'text-decoration': 'none',
                color: 'black',
                'border-radius': '8px',
                'font-size': '1.1rem',
                'border-left': '4px solid #ff9800',
              }}
            >
              {stepId}. {stepName}
            </A>
          );
        })}
      </div>
      <div style={{ margin: '2rem 0' }}>
        <A href={`/${worldId}`} style={{ display: 'inline-block', margin: '1rem', padding: '0.5rem 1rem', background: '#6c757d', color: 'white', 'text-decoration': 'none', 'border-radius': '4px' }}>
          월드로 돌아가기
        </A>
      </div>
    </div>
  );
}

