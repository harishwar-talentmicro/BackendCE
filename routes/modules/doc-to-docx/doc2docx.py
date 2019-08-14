import glob
import subprocess
import os
import sys
import time
try:
    print(os.path.dirname(__file__)+'/'+sys.argv[1])
    # for doc in glob.iglob("/Chiller Technician SADIQUE ALI ANSARI.DOC"):
    filename = os.path.dirname(__file__)+'/'+sys.argv[1]
    print(filename)
    time.sleep(10)
    subprocess.call(
        ['soffice', '--headless', '--convert-to', 'docx', filename])
    print("done")
    # subprocess.call(['soffice', '--headless', '--convert-to', 'docx', "Chiller Technician SADIQUE ALI ANSARI.DOC"], shell=True)
    print("Done")
except Exception as e:
    print(e)
