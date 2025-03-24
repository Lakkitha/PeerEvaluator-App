import OpenAI from "openai";
import { auth, db } from "../firebase";
import { collection, addDoc, getDoc, doc } from "firebase/firestore";

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
    formData.append("model", "gpt-4o-mini-transcribe");

    // Make the API call
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioBlob], "recording.webm", { type: fileType }),
      model: "gpt-4o-mini-transcribe",
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
 * Parse the evaluation response from OpenAI
 * @param response - The raw text response from OpenAI
 * @returns Structured evaluation data
 */
export function parseEvaluationResponse(response: string): SpeechEvaluation {
  try {
    // This is a simple parser - in a real app, you'd want a more robust parser
    // or have OpenAI return structured JSON directly

    const scores = {
      clarity: parseScoreFromText(response, "clarity", "grammar"),
      coherence: parseScoreFromText(response, "coherence"),
      delivery: parseScoreFromText(response, "delivery"),
      vocabulary: parseScoreFromText(response, "vocabulary"),
      overallImpact: parseScoreFromText(response, "overall", "impact"),
    };

    // Extract overall feedback
    const feedback = response;

    // Extract suggestions
    const suggestionMatches =
      response.match(/suggestion[s]?:[\s\S]*?(?=\n\n|\n$|$)/gi) || [];
    const suggestions =
      suggestionMatches.length > 0
        ? suggestionMatches[0]
            .split(/\n-|\n•|\n\d+\./)
            .filter(Boolean)
            .map((s) => s?.trim() || "")
        : [];

    return {
      ...scores,
      feedback,
      suggestions:
        suggestions.length > 0
          ? suggestions
          : ["Work on overall delivery and clarity"],
    };
  } catch (error) {
    console.error("Error parsing evaluation:", error);
    return {
      clarity: 5,
      coherence: 5,
      delivery: 5,
      vocabulary: 5,
      overallImpact: 5,
      feedback: response,
      suggestions: ["Unable to parse specific suggestions"],
    };
  }
}

// Helper function to parse scores from text
function parseScoreFromText(text: string, ...keywords: string[]): number {
  // Look for patterns like "Clarity: 7/10" or "Grammar score: 7"
  for (const keyword of keywords) {
    const regex = new RegExp(
      `${keyword}[^\\d]*(\\d{1,2})(?:\\s*\\/\\s*10)?`,
      "i"
    );
    const match = text.match(regex);
    if (match && match[1]) {
      // Add null check for match[1]
      const score = parseInt(match[1]);
      if (!isNaN(score) && score >= 0 && score <= 10) {
        return score;
      }
    }
  }
  return 5; // Default score if not found
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
            "You are a professional speech coach. Analyze the following speech transcript and provide constructive feedback on: grammar, fluency, coherence, delivery, engagement levels, and overall impact. Score each category from 1-10 and provide specific suggestions for improvement.",
        },
        {
          role: "user",
          content: transcription,
        },
      ],
    });

    const response = completion.choices[0].message.content || "";

    // Save the evaluation to Firestore if user is logged in
    try {
      if (auth.currentUser) {
        const parsedEvaluation = parseEvaluationResponse(response);
        await saveEvaluationToFirestore(
          transcription,
          parsedEvaluation,
          response
        );
      }
    } catch (saveError) {
      console.error("Error saving evaluation to Firestore:", saveError);
      // Continue without failing the overall function
    }

    return response;
  } catch (error) {
    console.error("Error evaluating speech:", error);
    throw new Error("Failed to evaluate speech");
  }
}

/**
 * Save the speech evaluation to Firestore
 * @param transcript - The speech transcript
 * @param evaluation - The parsed evaluation data
 * @param rawResponse - The raw response from the API
 */
export async function saveEvaluationToFirestore(
  transcript: string,
  evaluation: SpeechEvaluation,
  rawResponse: string
): Promise<string> {
  if (!auth.currentUser) {
    throw new Error("User not authenticated");
  }

  try {
    // Get the user's club ID
    const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
    const userData = userDoc.data();
    const clubID = userData?.clubID || null;

    // Make sure we're storing all the metrics mentioned in the system prompt
    const evalData = {
      userId: auth.currentUser.uid,
      date: new Date().toISOString(),
      transcript: transcript,
      scores: {
        clarity: evaluation.clarity,
        coherence: evaluation.coherence,
        delivery: evaluation.delivery,
        vocabulary: evaluation.vocabulary,
        // Add the missing metrics from the prompt
        fluency: parseScoreFromText(rawResponse, "fluency"),
        engagement: parseScoreFromText(
          rawResponse,
          "engagement",
          "engagement levels"
        ),
        overallImpact: evaluation.overallImpact,
      },
      feedback: rawResponse,
      suggestions: evaluation.suggestions,
      createdAt: new Date().toISOString(),
      clubID: clubID, // Add the club ID to the evaluation data
    };

    const docRef = await addDoc(collection(db, "evaluations"), evalData);
    return docRef.id;
  } catch (error) {
    console.error("Error saving evaluation:", error);
    throw new Error("Failed to save evaluation data");
  }
}

export default openai;
