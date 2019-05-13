import subprocess
import os
import sys
try:
    # print(os.path.dirname(__file__)+'/'+sys.argv[1])
    # for doc in glob.iglob("/Chiller Technician SADIQUE ALI ANSARI.DOC"):
    filename = os.path.dirname(__file__)+'/'+sys.argv[1]
    subprocess.call(
        ['soffice', '--headless', '--convert-to', 'docx', filename, '-outdir', os.path.dirname(__file__)])
    # subprocess.call(['soffice', '--headless', '--convert-to', 'docx', "Chiller Technician SADIQUE ALI ANSARI.DOC"], shell=True)
except Exception as e:
    print(e)
