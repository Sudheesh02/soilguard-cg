import os
import httpx
from openai import OpenAI

http_client = httpx.Client(
    headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
)

api_key = os.getenv("DEEPSEEK_API_KEY") or os.getenv("OPENAI_API_KEY")
if not api_key:
    print("⚠️  Warning: DEEPSEEK_API_KEY environment variable not set.")
    print("    Set it via: $env:DEEPSEEK_API_KEY='your_api_key' (PowerShell) or export DEEPSEEK_API_KEY='your_api_key' (Bash)\n")

client = OpenAI(
    api_key=api_key or "placeholder_api_key", 
    base_url="https://api.deepseek.com",
    http_client=http_client
)

print("🌱 Soilguard AI Terminal Chatbot Initialized! Type 'exit' to quit.\n")

# Start an empty conversation history list
messages = []

while True:
    user_input = input("You: ")
    if user_input.lower() == 'exit':
        break
        
    # Append the new question to the context history
    messages.append({"role": "user", "content": user_input})
    
    try:
        response = client.chat.completions.create(
            model="deepseek-v4-flash",
            messages=messages
        )
        
        reply = response.choices[0].message.content
        print(f"\nAI: {reply}\n")
        
        # Append the AI's reply so it remembers the conversation context
        messages.append({"role": "assistant", "content": reply})
        
    except Exception as e:
        print(f"\nError: {e}\n")
