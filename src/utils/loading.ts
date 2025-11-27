export function getS3ImageURL(filename: string): string {
  const baseUrl = "https://pm13-yusu-bukect.s3.ap-northeast-2.amazonaws.com/moai/";
  return `${baseUrl}${encodeURIComponent(filename)}`;
}

export function getS3TTSURL(filename: string): string {
  const baseUrl = "https://pm13-yusu-bukect.s3.ap-northeast-2.amazonaws.com/moai/tts/";
  return `${baseUrl}${encodeURIComponent(filename)}`;
}

/**
 * 이미지 URL 배열을 받아서 모든 이미지가 로드될 때까지 기다리는 함수
 * @param imageUrls 이미지 URL 배열
 * @returns Promise<void> 모든 이미지가 로드되면 resolve
 */
export function preloadImages(imageUrls: string[]): Promise<void> {
  return Promise.all(
    imageUrls.map((url) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
      });
    })
  ).then(() => undefined);
}

