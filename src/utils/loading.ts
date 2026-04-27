export function getS3ImageURL(filename: string): string {
  let finalPath = filename;

  // 1-3 이미지들은 현재 루트에 있으므로 경로를 잘라냅니다.
  if (filename.startsWith('1-3/')) {
    finalPath = filename.split('/').pop() || filename;
  }
  // 2-7, 4-2 등 나머지 이미지들은 전달받은 폴더 경로를 그대로 사용합니다.

  const baseUrl = "https://firebasestorage.googleapis.com/v0/b/moai-308a3.firebasestorage.app/o/";
  return `${baseUrl}${encodeURIComponent(finalPath)}?alt=media`;
}

export function getS3TTSURL(filename: string): string {
  let fullPath = filename;
  
  // 파일명에 경로(/)가 없고 단원 접두사로 시작하면 해당 폴더 경로를 추가합니다.
  if (!fullPath.includes('/')) {
    if (fullPath.startsWith('1-3_')) fullPath = `1-3/${fullPath}`;
    else if (fullPath.startsWith('2-7_')) fullPath = `2-7/${fullPath}`;
    else if (fullPath.startsWith('4-2_')) fullPath = `4-2/${fullPath}`;
  }
  
  // 최상위 tts 폴더 경로를 추가합니다.
  const finalPath = `tts/${fullPath}`;
  const baseUrl = "https://firebasestorage.googleapis.com/v0/b/moai-308a3.firebasestorage.app/o/";
  return `${baseUrl}${encodeURIComponent(finalPath)}?alt=media`;
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

