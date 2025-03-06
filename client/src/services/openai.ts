import OpenAI from 'openai';

// Create an OpenAI client with your API key
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPEN_AI_API_KEY, // Fix env variable name
  dangerouslyAllowBrowser: true // Only use this for development
});

/**
 * Transcribes audio data to text using OpenAI's Whisper API
 * @param audioBlob - The audio blob to transcribe
 * @returns The transcription text
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    // Create a form data object
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model', 'whisper-1');

    // Make the API call
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioBlob], 'recording.webm', { type: audioBlob.type }),
      model: 'whisper-1',
    });

    return transcription.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw new Error('Failed to transcribe audio');
  }
}

/**
 * Interface for speech evaluation feedback
 */
export interface SpeechEvaluation {
  clarity: number;
  coherence: number;
  delivery: number;
  vocabulary: number;
  overallImpact: number;
  feedback: string;
  suggestions: string[];
}

/**
 * Analyzes speech content and provides evaluation
 * @param transcription - The text transcription to analyze
 * @returns Feedback as a formatted string with scores and suggestions
 */
export async function evaluateSpeech(transcription: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional speech coach. Analyze the following speech transcript and provide constructive feedback on: clarity, coherence, delivery, vocabulary, and overall impact. Score each category from 1-10 and provide specific suggestions for improvement."
        },
        {
          role: "user",
          content: transcription
        }
      ]
    });

    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error('Error evaluating speech:', error);
    throw new Error('Failed to evaluate speech');
  }
}

export default openai;