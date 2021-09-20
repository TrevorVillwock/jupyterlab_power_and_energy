import os
import json
import subprocess
import csv
import time
import datetime

try:
    from notebook.base.handlers import APIHandler
except:
    print("APIHandler not imported")

from notebook.utils import url_path_join

import tornado
from tornado.web import StaticFileHandler

from IPython.display import display, HTML

# import energy measurement code
from .measure_file import measure_and_time

class RouteHandler(APIHandler):
    
    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps(
            {"data": "At the /jlab-ext-example/hello endpoint; finding and converting notebook"}))
    
    @tornado.web.authenticated
    def post(self):
        # receive .ipynb file name from index.ts on client-side
        # input_data is a dictionary with a key "file"
        input_data = self.get_json_body()
        
        # convert notebook to .py file with nbconvert
        subprocess.run(["jupyter", "nbconvert", input_data["file"], "--to", "script"])
        
        # get name and absolute path of converted .py file
        python_file_rel_path = input_data["file"]
        extension_index = python_file_rel_path.find(".")
        generic_file_path = python_file_rel_path[0:extension_index]
        python_file_rel_path = python_file_rel_path[0:extension_index] + ".py"
        abs_path = os.path.abspath(python_file_rel_path)
        print(abs_path)
        
        # execute measurement code and record execution time
        time_elapsed = measure_and_time(abs_path, input_data["run_num"])
        print("time_elapsed: ", time_elapsed)
        
        # calculate total energy used
        
        # get paths for csv files to read from
        directory_path = abs_path[0:abs_path.rfind('/')]
        cpu_path =  generic_file_path + '_CPU_power' + '_run' + str(input_data["run_num"]) + '.csv'
        gpu_path =  generic_file_path + '_GPU_power' + '_run' + str(input_data["run_num"]) + '.csv'
        
        # initialize measurement totals to 0
        cpu_total = 0.0
        dram_total = 0.0
        gpu_total = 0.0
        
        # read cpu data from csv file and find total power usage in watts
        with open(cpu_path, encoding='utf-8') as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=',')
            line_count = 0
            
            for row in csv_reader:
                # skip column headers
                if line_count == 0:
                    line_count += 1
                else:
                    cpu_total += float(row[1])
                    dram_total += float(row[2]) 
                    line_count += 1 
            
            csv_file.close()
        
        # read gpu data from csv file and find total power usage in watts
        with open(gpu_path, encoding='utf-8') as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=',')
            line_count = 0
            for row in csv_reader:
                # skip column headers
                if line_count == 0:
                    line_count += 1
                else:
                    gpu_total += float(row[5])
                    print("added gpu value of ", float(row[5]))
                    # gpu_total += float(row[5][0:row[5].find('/')])
                    line_count += 1
        
            csv_file.close()
            
        # find average power and use to get total energy in joules
        gpu_total = (gpu_total / (line_count - 1)) * time_elapsed
        cpu_total = (cpu_total / (line_count - 1)) * time_elapsed
        dram_total = (dram_total / (line_count - 1)) * time_elapsed
        
        # convert seconds to days, hours, minutes, seconds and format nicely
        formatted_time = str(datetime.timedelta(seconds=time_elapsed))
        print(formatted_time)
        time_array = formatted_time.split(':')
        days_hours_array = time_array[0].split(", ")
        if formatted_time.find(',') != -1:
            days = days_hours_array[0]
            hours = days_hours_array[1]
        else:
            hours = days_hours_array[0]
        
        minutes = time_array[1]
        seconds = float(time_array[2])
        
        if minutes[0] == '0': 
            minutes = minutes[1]     
        if formatted_time.find(',') != -1:
            formatted_time = '{} day(s), {} hour(s), {} minute(s), and {:.2f} seconds'.format(
                days, hours, minutes, round(seconds, 2))
        elif hours == '0' and minutes != '00' and minutes != '0':
            formatted_time = '{} minute(s) and {:.2f} seconds'.format(
                minutes, round(seconds, 2))
        elif hours == '0' and (minutes == '00' or minutes == '0'):
            formatted_time = '{:.2f} seconds'.format(round(seconds, 2))
        else:
            formatted_time = '{} hour(s), {} minute(s), and {:.2f} seconds'.format(
                hours, minutes, round(seconds, 2))
        
        # send data back to client-side
        data = {
            "CPU": cpu_total,
            "DRAM": dram_total,
            "GPU": gpu_total, 
            "TIME": formatted_time
        }
        self.finish(json.dumps(data))
        
def setup_handlers(web_app, url_path):
    print("setting up handlers")
    host_pattern = ".*$"
    base_url = web_app.settings["base_url"]

    # Prepend the base_url so that it works in a JupyterHub setting
    route_pattern = url_path_join(base_url, url_path, "hello")
    handlers = [(route_pattern, RouteHandler)]
    web_app.add_handlers(host_pattern, handlers)

    # Prepend the base_url so that it works in a JupyterHub setting
    doc_url = url_path_join(base_url, url_path, "public")
    doc_dir = os.getenv(
        "JLAB_SERVER_EXAMPLE_STATIC_DIR",
        os.path.join(os.path.dirname(__file__), "public"),
    )
    handlers = [("{}/(.*)".format(doc_url), StaticFileHandler, {"path": doc_dir})]
    web_app.add_handlers(".*$", handlers)
    print("handlers set up")
