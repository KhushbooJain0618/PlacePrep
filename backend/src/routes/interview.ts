import { Router, Request, Response, NextFunction } from 'express';
import { interviewService } from '../services/interviewService.js';
import { speechService } from '../services/speechService.js';
import { visionService } from '../services/visionService.js';

export const interviewRouter = Router();

// POST /api/interview/start
interviewRouter.post('/start', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role = 'Software Developer', difficulty = 'Beginner', type = 'Technical', questions = 5 } = req.body;
    const session = interviewService.startSession({
      role,
      difficulty,
      type,
      questions: Number(questions)
    });
    return res.json(session);
  } catch (err) {
    next(err);
  }
});

// POST /api/interview/answer
interviewRouter.post('/answer', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId, questionId, transcript, audioBase64, visionSignals } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: true, message: 'Session ID is required.' });
    }

    // Process speech transcription if transcript not provided directly
    let finalTranscript = transcript;
    if (!finalTranscript && audioBase64) {
      const speechRes = await speechService.transcribeAudio(audioBase64);
      finalTranscript = speechRes.transcript;
    }

    // Process defensible vision signals
    const visionTelemetry = visionService.processInteractionSignals(visionSignals);

    const answerResult = interviewService.submitAnswer({
      sessionId,
      questionId,
      transcript: finalTranscript || 'Answer submitted.',
      visionSignals
    });

    return res.json({
      ...answerResult,
      transcript: finalTranscript,
      visionNotice: visionTelemetry.notice
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/interview/finish
interviewRouter.post('/finish', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: true, message: 'Session ID is required.' });
    }

    const report = interviewService.finishSession(sessionId);
    return res.json(report);
  } catch (err) {
    next(err);
  }
});

// GET /api/interview/vision-notice
interviewRouter.get('/vision-notice', (req: Request, res: Response) => {
  return res.json({
    notice: visionService.getResponsibleAiDisclaimer()
  });
});
