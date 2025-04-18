from flask import request, jsonify, Flask
import pandas as pd
from operations import *
from flask_cors import CORS
# from matplotlib_ai.matplotlib_ai import matplotlib_ai
from werkzeug.utils import secure_filename
import os
from dotenv import load_dotenv
import openai
import json

load_dotenv()

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
openai_api_key = os.getenv("OPENAI_API_KEY")

try:
    os.mkdir(UPLOAD_FOLDER)
except FileExistsError:
    print('Folder already exists')
CORS(app)



@app.get('/')
def root():
    return jsonify({"status": 200, 'message': 'Welcome to homepage'})

@app.get('/api/get-files')
def get_files():
    file_list = [f for f in os.listdir(UPLOAD_FOLDER) if os.path.isfile(os.path.join(UPLOAD_FOLDER, f))]
    print(file_list)
    return jsonify({ 'files' : file_list})

@app.post('/api/upload')
def upload_file():
    # print('here')
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    return jsonify({ "filename": filename })

@app.post('/api/get-columns')
def get_columns():
    data = request.get_json()
    print(data)
    file_path = data.get('filePath')
    print(file_path)
    try:
        df = pd.read_csv(UPLOAD_FOLDER + '/' + file_path, nrows=1)  # Read only header row
        columns = list(df.columns)
        print(columns)
        return jsonify(columns)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.post('/api/execute-flow')
def perform_operations():
    # print('inside perform operations')
    body = request.json
    print(body)
    # print(body.get('id'))
    table_id = body.get('id')['id']
    
    nodes = body.get('nodes')
    edges = body.get('edges')

    # print('nodes: ', nodes)
    # print('edges: ', edges)
    
     # Convert nodes to dict for easier access
    nodes_dict = {node['id']: node for node in nodes}
    
    # Create a dict to store node inputs
    node_inputs = {node['id']: [] for node in nodes}

    # Build node inputs from edges
    for edge in edges:
        source = edge['source']
        target = edge['target']
        node_inputs[target].append(source)

    processed_results = {}


    
    def process_flow(node_id):
        if node_id in processed_results:
            return processed_results[node_id]

        for input_id in node_inputs.get(node_id, []):
            if input_id not in processed_results:
                process_flow(input_id)

        result = process_node(node_id, nodes_dict[node_id]['data'], node_inputs, nodes_dict, processed_results)
        # print(result)
        processed_results[node_id] = result
        return result

    result = process_flow(table_id)
    return jsonify(result)


def process_node(node_id, node_data, node_inputs, nodes_dict, processed_results):
    node_type = nodes_dict[node_id]['type']
    input_data = [processed_results[i] for i in node_inputs.get(node_id, [])]

    print(f"Processing {node_type} node ({node_id})...")

    if node_type == 'input':
        print(node_data['filePath'])
        if node_data['filePath'].endswith('.csv'):
            return pd.read_csv(UPLOAD_FOLDER + '/' + node_data['filePath'])
        elif node_data['filePath'].endswith('.xslx'):
            return pd.read_excel(UPLOAD_FOLDER + '/' + node_data['filePath'])
        else:
            return f"Error"
    
    elif node_type == 'sort':
        df = input_data[0]
        column = node_data['column']
        order = node_data['order'] == 'asc'
        return df.sort_values(by=column, ascending=order)

    elif node_type == 'filter':
        df = input_data[0]
        filter_column = node_data['column']
        condition = node_data['condition']
        filter_value = node_data['value']

        try:
            filter_value = float(filter_value)
        except ValueError:
            pass

        if condition == '==':
            filtered_df = df[df[filter_column] == filter_value]
        elif condition == '<=':
            filtered_df = df[df[filter_column] <= filter_value]
        elif condition == '>=':
            filtered_df = df[df[filter_column] >= filter_value]
        elif condition == '<':
            filtered_df = df[df[filter_column] < filter_value]
        elif condition == '>':
            filtered_df = df[df[filter_column] > filter_value]
        elif condition == 'contains':
            filtered_df = df[df[column].astype(str).str.contains(str(filtered_df), na=False)]
        else:
            raise ValueError(f"Unsupported filter condition: {condition}")

        return filtered_df
    elif node_type == 'groupby':
        df = input_data[0]
        groupby_columns = node_data['columns']
        aggregation = node_data['aggregation']
        aggregation_columns = node_data['aggregationColumn']
        print(groupby_columns)
        print(aggregation)
        print(aggregation_columns)

        if aggregation == 'max':
            new_df = df.groupby(by=groupby_columns)[aggregation_columns].max().reset_index()
        elif aggregation == 'min':
            new_df = df.groupby(by=groupby_columns)[aggregation_columns].min().reset_index()
        elif aggregation == 'sum':
            new_df = df.groupby(by=groupby_columns)[aggregation_columns].sum().reset_index()
        elif aggregation == 'count':
            new_df = df.groupby(by=groupby_columns)[aggregation_columns].count().reset_index()
        elif aggregation == 'avg':
            new_df = df.groupby(by=groupby_columns)[aggregation_columns].mean().reset_index()
        else:
            return ValueError(f"Unsupported groupby condition")
        return new_df
    elif node_type == 'table':
        return input_data[0].fillna('').to_dict(orient='records')
    elif node_type == 'graph':
        print('inside graph function')
        data = input_data[0]
        body = request.get_json()
        prompt = body.get('graphPrompt', '')
        # print(list(data.columns))
        response = openai.responses.create(
            model='gpt-4',
            instructions = "You are an expert in D3.js. Write D3.js v7 code based on the user input and the header columns. Only return Javascript code without wrapping it in triple backticks or any markdown syntax. No comments. No Explanations." \
            "When creating the svg, select the html tag \"#d3-graph-container\". Assume the data that will be used in the graph is in the variable called \"data\". Width of graph is 800 and height of graph is 600.",
            input = f"""{prompt}. Data column headers: {list(data.columns)}"""
        )
        # print(response)
        code = response.output[0].content[0].text
        code = f"const data = results; " + code
        print(code)


        # testing
#         code = """const data = results; const width = 800;
# const height = 600;
# const radius = Math.min(width, height) / 2;

# const svg = d3.select('#d3-graph-container')
#   .append('svg')
#   .attr('width', width)
#   .attr('height', height)
#   .append('g')
#   .attr('transform', `translate(${width / 2},${height / 2})`);

# const color = d3.scaleOrdinal(d3.schemeCategory10);

# const pie = d3.pie().value(d => d.salary);

# const path = d3.arc()
#   .outerRadius(radius - 10)
#   .innerRadius(0);

# const arc = svg.selectAll('.arc')
#   .data(pie(data))
#   .enter().append('g')
#   .attr('class', 'arc');

# arc.append('path')
#   .attr('d', path)
#   .attr('fill', d => color(d.data.department));

# arc.append('text')
#   .attr('transform', d => `translate(${path.centroid(d)})`)
#   .attr('dy', '0.35em')
#   .text(d => d.data.department);"""
        return {'code' : code, 'data': data.fillna('').to_dict(orient='records')}
    else:
        raise ValueError(f"Unknown node type: {node_type}")
    
if __name__ == '__main__':
    app.run(port='8080', debug=True)