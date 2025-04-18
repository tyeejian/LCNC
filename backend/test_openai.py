from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

# openai_api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI()

response = client.responses.retrieve("resp_6801cd1ce84881919bf4ea6d95dfdd7f0a9cd0f3c5aca317")
print(response.content)