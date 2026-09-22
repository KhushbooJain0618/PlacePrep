import { config } from '../config/env';

export class SpeechService {
  /**
   * Transcribes student audio into text.
   * Uses Azure AI Speech REST API when configured, or returns browser transcript.
   */
  async transcribeAudio(audioBufferOrBase64?: string, browserTranscript?: string): Promise<{ transcript: string; confidence: number }> {
    // 1. If the client browser already provided a live Web Speech transcript, prefer it
    if (browserTranscript && browserTranscript.trim().length > 0) {
      return {
        transcript: browserTranscript.trim(),
        confidence: 0.95
      };
    }

    // 2. Azure AI Speech STT REST API integration
    if (!config.useMockAI && config.azure.speech.key && config.azure.speech.region && audioBufferOrBase64) {
      try {
        const region = config.azure.speech.region;
        const sttUrl = `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US`;

        let rawBuffer: Buffer;
        if (audioBufferOrBase64.startsWith('data:')) {
          const base64Data = audioBufferOrBase64.split(',')[1] || '';
          rawBuffer = Buffer.from(base64Data, 'base64');
        } else {
          rawBuffer = Buffer.from(audioBufferOrBase64, 'base64');
        }

        const res = await fetch(sttUrl, {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': config.azure.speech.key,
            'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
            'Accept': 'application/json'
          },
          body: new Uint8Array(rawBuffer)
        });

        if (res.ok) {
          const data = await res.json() as { RecognitionStatus?: string; DisplayText?: string };
          if (data.RecognitionStatus === 'Success' && data.DisplayText) {
            return {
              transcript: data.DisplayText,
              confidence: 0.96
            };
          }
        } else {
          const errText = await res.text().catch(() => '');
          console.warn(`[Azure Speech STT Error] HTTP ${res.status}: ${errText}`);
        }
      } catch (err) {
        console.warn('[SpeechService] Azure Speech transcription error:', err);
      }
    }

    return {
      transcript: '',
      confidence: 0
    };
  }

  /**
   * Issues an ephemeral authentication token for client-side Azure Speech SDK.
   */
  async issueToken(): Promise<{ token: string; region: string } | null> {
    if (config.useMockAI || !config.azure.speech.key || !config.azure.speech.region) {
      return null;
    }

    try {
      const region = config.azure.speech.region;
      const issueUrl = `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;

      const res = await fetch(issueUrl, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': config.azure.speech.key,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': '0'
        },
        signal: AbortSignal.timeout(5000)
      });

      if (res.ok) {
        const token = await res.text();
        return { token, region };
      } else {
        const errText = await res.text().catch(() => '');
        console.warn(`[Azure Speech STS Error] HTTP ${res.status}: ${errText}`);
        return null;
      }
    } catch (err) {
      console.warn('[SpeechService] Token issue failed:', err);
      return null;
    }
  }

  /**
   * Synthesizes text into high-fidelity neural speech audio (MP3) using Azure AI Speech TTS.
   */
  async synthesizeSpeech(text: string): Promise<Buffer | null> {
    if (config.useMockAI || !config.azure.speech.key || !config.azure.speech.region) {
      return null;
    }

    try {
      const tokenObj = await this.issueToken();
      if (!tokenObj) return null;

      const region = tokenObj.region;
      const ttsUrl = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
      const voice = config.azure.speech.voiceName || 'en-US-JennyNeural';
      const escapedText = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

      const ssml = `<speak version='1.0' xml:lang='en-US'><voice xml:lang='en-US' name='${voice}'>${escapedText}</voice></speak>`;

      const res = await fetch(ttsUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenObj.token}`,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
          'User-Agent': 'PlacePrep-Interview-AI'
        },
        body: ssml
      });

      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        return Buffer.from(arrayBuf);
      } else {
        const errText = await res.text().catch(() => '');
        console.warn(`[Azure Speech TTS Error] HTTP ${res.status}: ${errText}`);
        return null;
      }
    } catch (err) {
      console.warn('[SpeechService] TTS failed:', err);
      return null;
    }
  }
}

export const speechService = new SpeechService();

