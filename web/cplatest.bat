@echo off
setlocal EnableDelayedExpansion

echo Searching for the latest f9launches*.csv file...

:: Find the lexicographically biggest (latest) file matching f9launches*.csv
for /f "delims=" %%F in ('dir "f9launches*.csv" /b /a-d /o-n 2^>nul') do (
    set "latest=%%F"
    goto :found
)

echo No file matching f9launches*.csv found!
exit /b 1

:found
echo Found latest file: !latest!
echo Copying to f9data.csv ...

copy /y "!latest!" "f9data.csv" 

if %errorlevel% equ 0 (
    echo Success! f9data.csv has been updated with the latest file.
) else (
    echo Error: Failed to copy the file.
)

endlocal