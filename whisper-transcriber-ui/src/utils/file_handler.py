import os
from tkinter import filedialog, messagebox

def select_audio_file():
    """Open a file dialog to select an audio file."""
    file_path = filedialog.askopenfilename(
        title="Select an Audio File",
        filetypes=(("Audio Files", "*.mp3;*.wav;*.m4a"), ("All Files", "*.*"))
    )
    return file_path if file_path else None

def display_transcription_result(transcription_text):
    """Display the transcription result in a message box."""
    messagebox.showinfo("Transcription Result", transcription_text)

def save_transcription_to_file(transcription_text, file_path):
    """Save the transcription text to a file."""
    if not transcription_text:
        messagebox.showwarning("Warning", "No transcription text to save.")
        return

    output_file = os.path.splitext(file_path)[0] + "_transcription.txt"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(transcription_text)
    
    messagebox.showinfo("Success", f"Transcription saved to {output_file}")