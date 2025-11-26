const OPENAI_IMAGE_ENDPOINT = 'https://api.openai.com/v1/images/generations';

type GenerateImageResponse = {
  data: Array<{ url?: string; b64_json?: string }>;
};

export async function generateImageFromPrompt(prompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GPT_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_GPT_API_KEY가 설정되지 않았습니다.');
  }

  const response = await fetch(OPENAI_IMAGE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      quality: 'low',
      size: '1024x1024',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`이미지 생성 실패: ${errorText}`);
  }

  const data = (await response.json()) as GenerateImageResponse;
  const imageUrl = data.data?.[0]?.url;

  if (!imageUrl) {
    throw new Error('이미지 URL을 가져오지 못했습니다.');
  }

  return imageUrl;
}


