/**
 * 이미지에서 주요 색상을 추출하여 body 배경색을 동적으로 설정하는 유틸리티
 */

interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * 이미지에서 주요 색상을 추출합니다.
 * @param imageUrl 이미지 URL
 * @returns RGB 색상 객체
 */
export async function extractDominantColor(imageUrl: string): Promise<RGB> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // 샘플링을 위해 작은 크기로 리사이즈 (성능 최적화)
        const sampleSize = 50;
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        
        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
        
        // 이미지의 가장자리 부분 샘플링 (배경색 추출에 유용)
        const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
        const pixels = imageData.data;
        
        // 가장자리 픽셀들만 샘플링
        const edgePixels: RGB[] = [];
        for (let i = 0; i < pixels.length; i += 4) {
          const x = (i / 4) % sampleSize;
          const y = Math.floor((i / 4) / sampleSize);
          
          // 가장자리 픽셀만 수집
          if (x === 0 || x === sampleSize - 1 || y === 0 || y === sampleSize - 1) {
            edgePixels.push({
              r: pixels[i],
              g: pixels[i + 1],
              b: pixels[i + 2],
            });
          }
        }
        
        // 평균 색상 계산
        const avgColor = edgePixels.reduce(
          (acc, pixel) => ({
            r: acc.r + pixel.r,
            g: acc.g + pixel.g,
            b: acc.b + pixel.b,
          }),
          { r: 0, g: 0, b: 0 }
        );
        
        const count = edgePixels.length || 1;
        resolve({
          r: Math.round(avgColor.r / count),
          g: Math.round(avgColor.g / count),
          b: Math.round(avgColor.b / count),
        });
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
}

/**
 * RGB 색상을 CSS 색상 문자열로 변환합니다.
 * @param rgb RGB 색상 객체
 * @returns CSS 색상 문자열 (예: "rgb(255, 128, 64)")
 */
export function rgbToCss(rgb: RGB): string {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

/**
 * RGB 색상을 더 밝게 만듭니다.
 * @param rgb RGB 색상 객체
 * @param factor 밝기 조정 팩터 (0-1, 기본값 0.3)
 * @returns 밝아진 RGB 색상 객체
 */
export function lightenColor(rgb: RGB, factor: number = 0.3): RGB {
  return {
    r: Math.min(255, Math.round(rgb.r + (255 - rgb.r) * factor)),
    g: Math.min(255, Math.round(rgb.g + (255 - rgb.g) * factor)),
    b: Math.min(255, Math.round(rgb.b + (255 - rgb.b) * factor)),
  };
}

/**
 * RGB 색상을 더 어둡게 만듭니다.
 * @param rgb RGB 색상 객체
 * @param factor 어둡게 조정 팩터 (0-1, 기본값 0.2)
 * @returns 어두워진 RGB 색상 객체
 */
export function darkenColor(rgb: RGB, factor: number = 0.2): RGB {
  return {
    r: Math.max(0, Math.round(rgb.r * (1 - factor))),
    g: Math.max(0, Math.round(rgb.g * (1 - factor))),
    b: Math.max(0, Math.round(rgb.b * (1 - factor))),
  };
}

/**
 * body 배경색을 동적으로 설정합니다.
 * @param imageUrl 배경 이미지 URL
 */
export async function setBodyBackgroundFromImage(imageUrl: string): Promise<void> {
  try {
    const dominantColor = await extractDominantColor(imageUrl);
    const lightenedColor = lightenColor(dominantColor, 0.4);
    const darkenedColor = darkenColor(dominantColor, 0.1);
    
    // 그라데이션 배경 생성
    const gradient = `linear-gradient(135deg, ${rgbToCss(lightenedColor)} 0%, ${rgbToCss(dominantColor)} 50%, ${rgbToCss(darkenedColor)} 100%)`;
    
    document.body.style.background = gradient;
    document.body.style.backgroundColor = rgbToCss(dominantColor);
  } catch (error) {
    // 실패 시 기본 색상 유지
  }
}

