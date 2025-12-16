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
      prompt: `${prompt} cartoon / flat / stylized / vector한 분위기와 스타일 적용. 전체 캐릭터가 잘리지 않고 완전히 보이도록 캐릭터 주변에 최소 100px의 여백(padding)을 두고 생성해주세요. full body visible, complete character view, no cropping, 100px padding around character`,
      quality: 'low',
      size: '1024x1024',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`이미지 생성 실패: ${errorText}`);
  }

  const data = (await response.json()) as GenerateImageResponse;
  const imageData = data.data?.[0];
  
  if (!imageData) {
    throw new Error('이미지 데이터를 가져오지 못했습니다.');
  }

  // url이 있으면 url 반환, 없으면 b64_json을 data URL로 변환
  if (imageData.url) {
    return imageData.url;
  }
  
  if (imageData.b64_json) {
    return `data:image/png;base64,${imageData.b64_json}`;
  }

  throw new Error('이미지 URL 또는 base64 데이터를 가져오지 못했습니다.');
}


