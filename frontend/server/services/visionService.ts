/**
 * VisionService: Handles defensible visual interaction signals.
 * 
 * STRICT RESPONSIBLE AI COMPLIANCE:
 * - This service evaluates ONLY operational interaction signals (e.g. video feed active, user centered in frame, lighting clarity).
 * - Does NOT detect facial emotions.
 * - Does NOT infer personality, mental state, honesty, confidence, or intelligence.
 */
export interface VisualInteractionSignal {
  feedActive: boolean;
  userPositionedInFrame: boolean;
  lightingQuality: 'good' | 'fair' | 'poor';
  interactionSignalScore: number; // 0-100 indicating camera readiness & framing
  notice: string;
}

export class VisionService {
  private static readonly RESPONSIBLE_AI_NOTICE = 
    'Visual analysis is strictly limited to interaction-related signals (such as framing and lighting) and does not assess personality, emotions, honesty, confidence, or mental state.';

  /**
   * Processes client camera interaction telemetry.
   */
  processInteractionSignals(signalInput?: {
    faceCenteredScore?: number;
    lightingQuality?: 'good' | 'fair' | 'poor';
    interactionActive?: boolean;
  }): VisualInteractionSignal {
    const isCentered = (signalInput?.faceCenteredScore ?? 85) >= 50;
    const lighting = signalInput?.lightingQuality || 'good';
    const active = signalInput?.interactionActive !== false;

    let score = 88;
    if (!isCentered) score -= 20;
    if (lighting === 'poor') score -= 25;
    if (lighting === 'fair') score -= 10;
    if (!active) score = 0;

    return {
      feedActive: active,
      userPositionedInFrame: isCentered,
      lightingQuality: lighting,
      interactionSignalScore: Math.max(0, Math.min(100, score)),
      notice: VisionService.RESPONSIBLE_AI_NOTICE
    };
  }

  getResponsibleAiDisclaimer(): string {
    return VisionService.RESPONSIBLE_AI_NOTICE;
  }
}

export const visionService = new VisionService();
