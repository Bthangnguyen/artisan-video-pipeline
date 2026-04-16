from gtts import gTTS
import os

text = "Chào mừng bạn đến với hệ thống Artisan. Hãy cùng kiến tạo tương lai."
tts = gTTS(text=text, lang='vi')

# Ensure public dir exists
os.makedirs("public", exist_ok=True)

output_path = "public/vietnamese_voice.mp3"
tts.save(output_path)
print(f"Voiceover saved to {output_path}")
