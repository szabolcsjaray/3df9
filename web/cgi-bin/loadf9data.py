import os

F9_DATA_FILE = "f9launches_2024-05-09.csv"

print( "Content-Type: text/html")
print()
a = os.listdir(".")
for fname in a:
    if fname.startswith("f9launches_"):
        if F9_DATA_FILE < fname:
            F9_DATA_FILE = fname

with open(F9_DATA_FILE, "rt") as f:
    print(f.read())