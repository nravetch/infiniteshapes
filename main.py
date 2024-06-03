import json

def read_json(file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)
    return data

def write_json(file_path, data):
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=4)

# Specify the path to your JSON file
file_path = 'shapes.json'

# Read the JSON file
shapes = read_json(file_path)
print('Original data:')
print(shapes)

# Modify the data (this is just an example, modify as needed)
shapes['square']['attributes']['width'] = '40'

# Write the modified data back to the JSON file
write_json(file_path, shapes)

# Read the JSON file again to verify the changes
shapes = read_json(file_path)
print('Modified data:')
print(shapes)
