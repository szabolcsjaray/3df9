import sys
import csv


with open("launches1.csv", "r") as f:
    with open("launches1_f.csv", "w") as fw:

        csv1 = csv.reader(f, delimiter=';')
        csv1w = csv.writer(fw, delimiter=';')
        c = 1
        fixedLine = []
        fixedLines = []
        for line  in csv1:
            if (str(c)==line[0]):
                print(c)
                fixedLine = line.copy()
            else:
                print("n")
                fixedLine.append(line[1])
                fixedLines.append(fixedLine)
                c = c + 1
            
        csv1w.writerows(fixedLines)
        

