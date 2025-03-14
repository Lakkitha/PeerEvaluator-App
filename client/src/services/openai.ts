import OpenAI from "openai";

// Create an OpenAI client with your API key
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPEN_AI_API_KEY, // Fix env variable name
  dangerouslyAllowBrowser: true, // Only use this for development
});

/**
 * Transcribes audio data to text using OpenAI's Whisper API
 * @param audioBlob - The audio blob to transcribe
 * @returns The transcription text
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    console.log("Transcribing audio...", audioBlob.size, audioBlob.type);

    // Check if blob is valid
    if (audioBlob.size === 0) {
      throw new Error("Empty audio recording");
    }

    // Ensure we're using a supported audio format
    // OpenAI supports mp3, mp4, mpeg, mpga, m4a, wav, or webm
    const supportedFormats = [
      "audio/webm",
      "audio/mp3",
      "audio/mpeg",
      "audio/wav",
    ];
    const fileType = audioBlob.type || "audio/webm";

    if (!supportedFormats.some((format) => fileType.includes(format))) {
      console.error(`Unsupported audio format: ${fileType}`);
      // Try to convert or proceed with a warning
    }

    // Create a form data object
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");
    formData.append("model", "whisper-1");

    // Make the API call
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioBlob], "recording.webm", { type: fileType }),
      model: "whisper-1",
    });

    console.log("Transcription successful:", transcription);
    return transcription.text;
  } catch (error) {
    console.error("Error transcribing audio:", error);

    // Check for specific API errors
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new Error(
          "OpenAI API key issue - please check your configuration"
        );
      } else if (error.message.includes("rate limit")) {
        throw new Error("Rate limit exceeded for OpenAI API");
      }
    }

    throw new Error("Failed to transcribe audio");
  }
}

/**
 * Tests if the OpenAI API key is valid and working
 * @returns A promise that resolves to true if the key is valid, or an error message if not
 */
export async function testApiKey(): Promise<{
  valid: boolean;
  message: string;
}> {
  try {
    console.log("Testing OpenAI API key...");

    // Make a simple request to OpenAI to verify the key
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello, this is a test." }],
      max_tokens: 10,
    });

    if (response && response.choices && response.choices.length > 0) {
      console.log("API key is valid!");
      return {
        valid: true,
        message: "API key is valid and working correctly.",
      };
    } else {
      return {
        valid: false,
        message: "API returned an unexpected response format.",
      };
    }
  } catch (error) {
    console.error("Error testing API key:", error);

    if (error instanceof Error) {
      // Check for common API key issues
      if (error.message.includes("API key")) {
        return { valid: false, message: "Invalid API key provided." };
      } else if (error.message.includes("rate limit")) {
        return {
          valid: false,
          message:
            "Rate limit exceeded. Your API key is valid but you've sent too many requests.",
        };
      } else if (error.message.includes("insufficient_quota")) {
        return {
          valid: false,
          message:
            "Your account has insufficient quota. Please check your billing settings.",
        };
      }
      return { valid: false, message: `Error: ${error.message}` };
    }

    return {
      valid: false,
      message: "Unknown error occurred while testing the API key.",
    };
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
          content:
            "You are a professional speech coach. Analyze the following speech transcript and provide constructive feedback on: grammer, fluency, coherence, delivery, Engagement levels, and overall impact. Score each category from 1-10 and provide specific suggestions for improvement.",
        },
        {
          role: "user",
          content: transcription,
        },
      ],
    });

    return completion.choices[0].message.content || "";
  } catch (error) {
    console.error("Error evaluating speech:", error);
    throw new Error("Failed to evaluate speech");
  }
}

export default openai;
