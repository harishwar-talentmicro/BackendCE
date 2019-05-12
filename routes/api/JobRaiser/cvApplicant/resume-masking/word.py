import re
from docx import Document
import requests
from io import BytesIO
from io import StringIO
import base64

import argparse
import datetime
import pprint

import os
import sys

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.dirname(__file__)+"/cred.json"

# [START storage_upload_file]
from google.cloud import storage

# print (sys.argv)

try:
    def docx_replace_regex(doc_obj, regex, replace):

        for p in doc_obj.paragraphs:
            if regex.search(p.text):
                inline = p.runs
                # Loop added to work with runs (strings with same style)
                for i in range(len(inline)):
                    if regex.search(inline[i].text):
                        text = regex.sub(replace, inline[i].text)
                        inline[i].text = text

        for table in doc_obj.tables:
            for row in table.rows:
                for cell in row.cells:
                    docx_replace_regex(cell, regex, replace)


    regex1 = re.compile(r"(\+)*[ 0-9]{8,14}")
    replace1 = r""
    regex2 = re.compile(r"[a-zA-Z0-9\._]+@[a-zA-Z]+.[a-zA-Z]+")
    replace2 = r""
    filename = sys.argv[1]#"https://storage.googleapis.com/ezeone/6f8e5aaf-84dd-4ece-99c2-946cd469929f.docx"
    doc = Document(BytesIO(requests.get(filename).content))
    docx_replace_regex(doc, regex1, replace1)
    docx_replace_regex(doc, regex2, replace2)
    # doc.save('result2.docx')
    # with open("yourfile.ext", "rb") as image_file:
    #     encoded_string = base64.b64encode(image_file.read())
    # print doc.story
    # print (bytes(doc))
    # print ("2")
    # print (sys.argv)
    section = doc.sections[0]
    header = section.header
    paragraph = header.paragraphs[0]
    r = paragraph.add_run()
    r.add_text("F.Gheewala HR Consultants")
    # r.add_picture("download.png")

    # paragraph.add_picture('download.png', width=Inches(1.25))
    # print ("2")
    try:
        storage_client = storage.Client()
        bucket = storage_client.get_bucket('ezeone')
        blob = bucket.blob(sys.argv[2])#'6f8e5aaf-84dd-4ece-99c2-946cd469929f12345.docx')
    except Exception as e: print(e)
    # print("here")
    # with open(BytesIO(doc), "rb") as my_file:
    #     blob.upload_from_file(my_file)
    file_stream = BytesIO()
    doc.save(file_stream)
    file_stream.seek(0)
    blob.upload_from_file(file_stream)

        # print('File {} uploaded to {}.'.format(
        #     source_file_name,
        #     destination_blob_name))
    # [END storage_upload_file]
except Exception as e: print(e)
print ("done")