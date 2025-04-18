# Low-code-no-code data processing and visualization

*This is a school project for NTU SC4052 - Cloud Computing AY2024/25 Semester 2.*

A low-code/no-code platform for data processing and use of LLM for data visualization generation.

## Sample Run

![](./assets/sample%20run%201.gif)
![](./assets/sample%20run%202.gif)
![](./assets/sample%20run%204.gif)


## How to run

### Frontend
1. Install dependencies
```
npm i
```
2. Run the app
```
npm run start
```

### Backend

1. Create virtual env
```
python -m venv venv
```
> [!NOTe]
> a virtualenv named "venv" is created in current directory

2. Activate virtual env
```
source venv/bin/activate #windows: .\venv\Scripts\activate
```

3. Install dependencies
```
pip install -r requirements.txt
```
4. Create a `.env` file with the following
```
OPENAI_API_KEY=your_key_here
```

5. Run the app
```
python main.py
```

## Known limitations
- The TableNode does not limit the incoming source connection to only 1.
- The graph shown is not fitted correctly onto the Box.
- The prompt to the AI does not gives back a consistent output.
- GroupByNode is not working correctly.
- JoinNode is not working correctly.
- The OpenAI model is not trained with the latest documentation of D3.js, hence some of the code generated is still using the old functions, which results in error when running.
