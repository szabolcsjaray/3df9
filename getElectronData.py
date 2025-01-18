import urllib.request
import codecs
from html.parser import HTMLParser
from datetime import datetime
import sys


launches = []
WIKI_PAGES = ["https://en.wikipedia.org/wiki/List_of_Electron_launches"];
NO_COLUMN = -1
NEXT_ROW = "nextRow"
FH_SIDE_1_ROW ="fhSide1"
FH_SIDE_2_ROW ="fhSide2"
BOOSTER_COL = 3
LANDING_COL = 10

def debugPrint(toPrint):
    print(toPrint)

class MyHTMLParser(HTMLParser):
    lastTag = ""
    id = ""
    storeField = False
    collectData = ""
    actLaunch = []
    stack = []
    column = NO_COLUMN
    skipData = False


    def handle_starttag(self, tag, attrs):
        global NO_COLUMN
        global NEXT_ROW
        global FH_SIDE_1_ROW
        global FH_SIDE_2_ROW

        debugPrint("--- start tag: " + tag)
        if tag=="tr":
            if self.lastTag=="" and len(attrs)>0 and attrs[0][0]=="id":
                self.lastTag = tag
                debugPrint("Start:" + tag)
                print(attrs)
                self.id = attrs[0][1]
                self.actLaunch = []
                self.actLaunch.append(self.id)
                self.stack = [tag]
            elif len(self.stack) > 0:
                self.stack.append(tag)
                debugPrint("start tr in row")
                debugPrint(self.stack)
            elif self.lastTag == NEXT_ROW:
                debugPrint("start tr nextRow")
                self.stack = [tag]
                debugPrint(self.stack)
            elif self.lastTag == FH_SIDE_1_ROW:
                debugPrint("start tr fh s 1")
                self.stack = [tag]
                debugPrint(self.stack)
            elif self.lastTag == FH_SIDE_2_ROW:
                debugPrint("start tr fh s 2")
                self.stack = [tag]
                debugPrint(self.stack)
        elif self.lastTag != "":
            debugPrint("in row, not tr")
            if tag != "link":
                self.stack.append(tag)
            debugPrint(self.stack)
            if (tag == "td" or tag == "th") and self.column == NO_COLUMN:
                self.column = len(self.stack)
                debugPrint("Start collecting column:" + str(self.column))
                self.collectData = ""
            if tag=="sup" or tag == "style":
                debugPrint("sup/style skipData start")
                self.skipData = True


    def handle_endtag(self, tag):
        global launches
        global NEXT_ROW
        global FH_SIDE_1_ROW
        global FH_SIDE_2_ROW
        global BOOSTER_COL
        global LANDING_COL

        debugPrint("--- end tag: " + tag)
        if self.lastTag!="":
            popTag = self.stack.pop()
            debugPrint("end tag, in row, popped:" + popTag )
            debugPrint(self.stack)
            if popTag != tag:
                print("Tag mismatch " + tag + " != " + popTag)
            if self.column > 0:
                debugPrint("in column")
                if (tag == "td" or tag == "th") and self.column > len(self.stack):
                    debugPrint("column closed, data: ")
                    debugPrint(self.collectData)
                    self.actLaunch.append(self.collectData.strip())
                    self.column = NO_COLUMN
                if tag=="sup" or tag == "style":
                    debugPrint("sup/style end")
                    self.skipData = False
            elif tag == "tr" and len(self.stack) == 0:
                debugPrint("end row")
                if self.lastTag == "tr":
                    if self.actLaunch[0].startswith("FH"):
                        self.lastTag = FH_SIDE_1_ROW
                        debugPrint("fh s 1 row will come")
                    else:
                        debugPrint("nextRow will come")
                        self.lastTag = NEXT_ROW
                        # !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                        #if (len(launches)>1):
                        #    sys.exit();
                        # !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                elif self.lastTag == FH_SIDE_1_ROW or self.lastTag == FH_SIDE_2_ROW:
                    debugPrint("A side booster row ended.")
                    debugPrint(self.actLaunch)
                    boosterLanding = self.actLaunch.pop()
                    booster = self.actLaunch.pop()
                    self.actLaunch[BOOSTER_COL] = self.actLaunch[BOOSTER_COL] + " | " + booster
                    self.actLaunch[LANDING_COL] = self.actLaunch[LANDING_COL] + " | " + boosterLanding
                    debugPrint(self.actLaunch)
                    if self.lastTag == FH_SIDE_1_ROW:
                        self.lastTag = FH_SIDE_2_ROW
                        debugPrint("fh s 2 row will come")
                    else:
                        # !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                        #if (len(launches)>1):
                        #    sys.exit();
                        # !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                        self.lastTag = NEXT_ROW
                        debugPrint("nextRow will come")
                else:
                    debugPrint("nextRow ended, saving data to launches")
                    launches.append(self.actLaunch)
                    self.lastTag = ""


    def handle_data(self, data):
        if self.column != NO_COLUMN:
            debugPrint("storing data to column")
            if not self.skipData:
                if len(self.collectData)>0:
                    data = " " + data.strip()
                self.collectData = self.collectData + data
                #debugPrint("collectData: ")
                #debugPrint(self.collectData)
            #else:
            #    print("------------------- Skipped data: " + data.strip())


for pageAddress in WIKI_PAGES:
    print("Processing page: " + pageAddress)
    data = urllib.request.urlopen(pageAddress).read().decode("utf-8")
    data = data.replace('\u267a', "REUSE")
    data = data.replace('\u2192', "RARROW")
    #debugPrint(data)
    parser = MyHTMLParser()
    parser.feed(data)
debugPrint(launches)

today = datetime.today().strftime('%Y-%m-%d');
with codecs.open("Electronlaunches_"+today+".csv", "w", "utf-8") as f:
    for row in launches:
        for col in row:
            f.write(col + ";")
        f.write("\n")