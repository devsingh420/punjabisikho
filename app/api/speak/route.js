// API Route to proxy Google Translate TTS for Punjabi audio
// This avoids CORS issues with direct browser requests

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');

  if (!text) {
    return new Response('Missing text parameter', { status: 400 });
  }

  try {
    // Text is already URL-decoded by searchParams.get(), so we encode it fresh for Google
    const encoded = encodeURIComponent(text);
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=pa&client=tw-ob&q=${encoded}`;

    const response = await fetch(googleTtsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
        'Accept': 'audio/mpeg, audio/*',
      },
      cache: 'no-store', // Don't cache on server side
    });

    if (!response.ok) {
      console.error('Google TTS failed:', response.status, response.statusText);
      throw new Error('Google TTS failed');
    }

    const audioBuffer = await response.arrayBuffer();

    // Return with no-cache to ensure fresh audio each request
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('TTS error:', error);
    return new Response('TTS failed', { status: 500 });
  }
}
