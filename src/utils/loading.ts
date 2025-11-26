export function getS3ImageURL(filename: string): string {
  const baseUrl = "https://pm13-yusu-bukect.s3.ap-northeast-2.amazonaws.com/moai/";
  return `${baseUrl}${encodeURIComponent(filename)}`;
}

export function getS3TTSURL(filename: string): string {
  const baseUrl = "https://pm13-yusu-bukect.s3.ap-northeast-2.amazonaws.com/moai/tts/";
  return `${baseUrl}${encodeURIComponent(filename)}`;
}

