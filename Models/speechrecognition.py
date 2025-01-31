import speech_recognition as sr
from speech_recognition import UnknownValueError, RequestError
from time import sleep

def transcribe_audio(file_path, max_retries=3, timeout=10):
    recognizer = sr.Recognizer()
    recognizer.operation_timeout = timeout
    
    with sr.AudioFile(file_path) as source:
        audio = recognizer.record(source)
    
    # Try Google Speech Recognition with retries
    for attempt in range(max_retries):
        try:
            text = recognizer.recognize_google(audio)
            print("Google Speech Recognition result:", text)
            return text
        except TimeoutError:
            if attempt < max_retries - 1:
                print(f"Timeout occurred. Retrying... (Attempt {attempt + 1}/{max_retries})")
                sleep(2)  # Wait before retry
            continue
        except UnknownValueError:
            print("Google Speech Recognition could not understand audio")
            break
        except RequestError as e:
            print(f"Network error with Google Speech Recognition: {e}")
            break
    
    # Fallback to offline Sphinx recognition
    print("Falling back to offline recognition...")
    try:
        text = recognizer.recognize_sphinx(audio)
        print("Sphinx Recognition result:", text)
        return text
    except UnknownValueError:
        print("Sphinx could not understand audio")
    except RequestError as e:
        print(f"Error with Sphinx recognition: {e}")
    
    return None

if __name__ == "__main__":
    result = transcribe_audio('./testaudio/AIdudes.wav')
    if result is None:
        print("Speech recognition failed with all available methods")