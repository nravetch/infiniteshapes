# infiniteshapes

## SETUP

In order to run it with Ollama - do the following:
1. Install Ollama
2. In a CMD, run "ollama run phi3:mini" to install phi3:mini
3. After installation, exit ollama (ctrl-c)
4. Run "python3 infiniteShapes.py"
5. The frontend should now be able to hit the local ollama backend - just run the website as normal

You can now navigate to
http://localhost:8000/

^ This is where the main page is now.

DEBUGGING
1. Unfortunately, phi3:mini is kinda stupid sometimes - there are bugs.
2. Open up the browser console to see what the issues are, if things are breaking. Logging here is verbose but useful.

KNOWN ISSUES
1. PHI3:MINI is instructed to return a json. Sometimes it really likes to blabber on about the beauty of its creation, resulting in a JSON parsing error in the response
(this is because I expect a fully formed JSON response - we can either tweak the prompt more, or cry... I mean uh - programmatically parse it better)
2. PHI3:MINI doesn't undrestand how to format the PATH / POLYGON object types sometimes, leading to syntax errors. Besides telling it to get gud (i.e. better prompt engineering), not sure how to fix that...
3. The outputs kinda don't make sense sometimes. But at least they're outputs and the model works? Yay?
4. Oh. And when re-creating an object that's been seen before (cached) - the color stays the same (when it should change to reflect the newest combo). This can def be fixed