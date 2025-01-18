import urllib.request
import codecs
from html.parser import HTMLParser
from datetime import datetime
import sys


content = ""


def debugPrint(toPrint):
    print(toPrint)

class MyHTMLParser(HTMLParser):

    def handle_starttag(self, tag, attrs):
        debugPrint("--- start tag: " + tag)

    def handle_endtag(self, tag):
        debugPrint("--- end tag: " + tag)


    def handle_data(self, data):
        global content
        content = content + data


with codecs.open("janosv.html", "r", "utf-8") as fr:
    data = fr.read()
    parser = MyHTMLParser()
    parser.feed(data)

    with codecs.open("janosv.txt", "w", "utf-8") as f:
        f.write(content)