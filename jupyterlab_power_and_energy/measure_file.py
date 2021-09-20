import requests
import time 
import os
import json
# import sys
"""
try:
    base_url = os.environ['DISPATCH_SERVER']
except KeyError:
    print('Please set environment variable DISPATCH_SERVER')
    sys.exit(1)

if len(sys.argv) != 2:
    print('Please include file name')
    sys.exit(1)
"""

def measure_and_time(file_path, run_num):
    """Takes path of python file to be measured and the number of times it has already been run as arguments, writes measurement data to csv files, and returns the program execution time."""
    
    base_url = 'http://node0:9898'

    # send file and get ID 
    url_id = base_url + '/id'
    files = {'file': open(file_path, 'rb'),
            'file_path': file_path} # opens file into buffer; rb = read buffer
    getID = requests.post(url_id, files=files)
    ID = getID.json().get('id')
    
    directory_path = file_path[0:file_path.rfind('/')]
    print("directory path: ", directory_path)

    print("Running Code...")
    print(ID)
    
    # send ID and get execution time
    url_results_time = base_url + '/results/time?id={}'.format(ID)
    time_results = requests.get(url_results_time)
    time_results_dict = time_results.json()
    # convert milliseconds to seconds
    execution_time = time_results_dict['time'] / 1000
    dummy_time = {'time': 5.033}
#     print(dummy_time['time'])
#     print(time_results_dict['time'])

    
    # send ID and get gpu results
    url_results_gpu = base_url + '/results/gpu?id={}'.format(ID)
    gpu_results = requests.get(url_results_gpu)
    gpu_file_name = directory_path + file_path[file_path.rfind('/'):file_path.find('.')] + '_GPU_power' + '_run' + str(run_num) + '.csv'
    print(gpu_file_name)
    with open(gpu_file_name, 'w+') as gpu:
        gpu.write(gpu_results.text)  
    print(gpu_results.text)
    print("Updated")

    # send ID and get cpu results
    url_results_cpu = base_url + '/results/cpu?id={}'.format(ID)
    cpu_results = requests.get(url_results_cpu)
    cpu_file_name = directory_path + file_path[file_path.rfind('/'):file_path.find('.')] + '_CPU_power' + '_run' + str(run_num) + '.csv'
    print(cpu_file_name)
    with open(cpu_file_name, 'w+') as cpu:
        cpu.write(cpu_results.text)
    print(cpu_results.text)
    
    return execution_time
    

  
    
