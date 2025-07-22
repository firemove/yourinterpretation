import OpenAI from 'openai';

// Vercel 환경 변수에서 OpenAI API 키를 불러옵니다.
// 이 변수는 Vercel 배포 시 Vercel 대시보드에서 설정해야 합니다.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Vercel에 설정할 환경 변수 이름과 일치해야 합니다.
});

// Vercel 서버리스 함수의 기본 핸들러입니다.
export default async function handler(req, res) {
  // POST 요청만 허용합니다.
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '메소드 허용 안 됨' });
  }

  // 요청 본문에서 'text'를 추출합니다.
  const { text } = req.body;

  // 텍스트가 없으면 오류를 반환합니다.
  if (!text) {
    return res.status(400).json({ error: '요청 본문에 텍스트가 필요합니다.' });
  }

  try {
    // OpenAI Chat Completions API를 호출합니다.
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // 사용할 OpenAI 모델을 지정합니다. (예: "gpt-4"도 가능)
      messages: [{ role: "user", content: `다음 영어 텍스트를 자세히 해석해 줘:\n\n"${text}"` }],
      temperature: 0.7, // 0.0에서 1.0 사이의 값. 높을수록 더 창의적이고 무작위적인 응답.
      max_tokens: 200,  // 생성될 해석의 최대 길이 (토큰 단위)
    });

    // AI 응답에서 해석 텍스트를 추출합니다.
    const interpretation = chatCompletion.choices[0].message.content.trim();
    
    // 해석 결과를 클라이언트에 JSON 형식으로 반환합니다.
    res.status(200).json({ interpretation: interpretation });

  } catch (error) {
    console.error('OpenAI API 오류:', error);
    if (error.response) {
      // OpenAI에서 받은 상세 오류 메시지가 있다면 출력합니다.
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json({ error: error.response.data.error.message || 'OpenAI API에서 오류가 발생했습니다.' });
    } else {
      res.status(500).json({ error: '텍스트를 해석하는 데 실패했습니다. 다시 시도해주세요.' });
    }
  }
}