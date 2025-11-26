import { useNavigate, useParams } from '@solidjs/router';
import { createSignal, createEffect, onCleanup, onMount } from 'solid-js';

export function WorldMapDropdown() {
  const navigate = useNavigate();
  const params = useParams();
  const [selectedWorldMap, setSelectedWorldMap] = createSignal(1);
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  const worldMaps = [1, 2, 3, 4];

  // URL 파라미터 또는 로컬 스토리지에서 월드맵 ID 읽기
  // 월드맵 ID는 worldMapId 파라미터 또는 worldId 파라미터에서 가져옴
  createEffect(() => {
    if (params.worldMapId) {
      const worldMapId = parseInt(params.worldMapId, 10);
      if (worldMapId >= 1 && worldMapId <= 4) {
        setSelectedWorldMap(worldMapId);
        localStorage.setItem('selectedWorldMap', worldMapId.toString());
      }
    } else if (params.worldId) {
      // 월드 페이지에서는 worldId가 월드맵 ID와 같음
      const worldId = parseInt(params.worldId, 10);
      if (worldId >= 1 && worldId <= 4) {
        setSelectedWorldMap(worldId);
        localStorage.setItem('selectedWorldMap', worldId.toString());
      }
    } else {
      const savedWorldMap = localStorage.getItem('selectedWorldMap');
      if (savedWorldMap) {
        const worldMapId = parseInt(savedWorldMap, 10);
        if (worldMapId >= 1 && worldMapId <= 4) {
          setSelectedWorldMap(worldMapId);
        }
      }
    }
  });

  const handleSelectWorldMap = (worldMapId: number) => {
    setSelectedWorldMap(worldMapId);
    setIsDropdownOpen(false);
    localStorage.setItem('selectedWorldMap', worldMapId.toString());
    navigate(`/${worldMapId}`);
  };

  // 드롭다운 외부 클릭 시 닫기
  createEffect(() => {
    if (isDropdownOpen()) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-dropdown]')) {
          setIsDropdownOpen(false);
        }
      };
      
      document.addEventListener('click', handleClickOutside);
      onCleanup(() => {
        document.removeEventListener('click', handleClickOutside);
      });
    }
  });

  return (
    <div
      data-dropdown
      style={{
        // position: 'absolute',
        top: '1rem',
        left: '1rem',
        'z-index': 1000,
      }}
    >
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen())}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#007bff',
            color: 'white',
            border: 'none',
            'border-radius': '8px',
            cursor: 'pointer',
            'font-size': '0.9rem',
            'font-weight': 'bold',
            'box-shadow': '0 2px 8px rgba(0,0,0,0.2)',
            display: 'flex',
            'align-items': 'center',
            gap: '0.5rem',
          }}
        >
          월드맵 {selectedWorldMap()}
          <span style={{ 'font-size': '0.7rem' }}>{isDropdownOpen() ? '▲' : '▼'}</span>
        </button>
        
        {isDropdownOpen() && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              'margin-top': '0.5rem',
              background: 'white',
              'border-radius': '8px',
              'box-shadow': '0 4px 12px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              'min-width': '150px',
            }}
          >
            {worldMaps.map((worldMapId) => (
              <button
                onClick={() => handleSelectWorldMap(worldMapId)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: selectedWorldMap() === worldMapId ? '#e3f2fd' : 'white',
                  color: selectedWorldMap() === worldMapId ? '#007bff' : 'black',
                  border: 'none',
                  cursor: 'pointer',
                  'font-size': '0.9rem',
                  'text-align': 'left',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (selectedWorldMap() !== worldMapId) {
                    e.currentTarget.style.background = '#f5f5f5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedWorldMap() !== worldMapId) {
                    e.currentTarget.style.background = 'white';
                  }
                }}
              >
                월드맵 {worldMapId}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

