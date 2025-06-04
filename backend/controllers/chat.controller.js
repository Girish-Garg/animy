

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

// Store previously generated code
let previousCode = "";

// Try to read previous code if it exists
try {
  if (fs.existsSync("stack_diagram.py")) {
    previousCode = fs.readFileSync("stack_diagram.py", "utf8");
    console.log("Loaded previous code from stack_diagram.py");
  }
} catch (err) {
  console.log("No previous code found or error reading file");
}

var prompt = `the arrows are not looking good, can you make the arrows look better and the third box is cutting down make them look more better also add a title to the diagram?`;

async function main() {

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-05-20",
    contents: `For the following prompt, you will give only the python code nothing else: ${prompt}
    The older code you the given is ${previousCode} now generate the whole code again with the new changes and do not repeat the previous code`,
  });
  
  // Extract code between ```python and ``` markers
  var fullText = response.text;
  var code = fullText;
  
  // Check if the response contains code blocks
  if (fullText.includes("```python")) {
    const codeBlockRegex = /```python\n([\s\S]*?)```/;
    const match = fullText.match(codeBlockRegex);
    if (match && match[1]) {
      code = match[1]; // Extract only the code between the markers
    }
  }
    fs.writeFile("stack_diagram.py", code, (err) => {
    if (err) {
      console.error("Error writing file:", err);
    } else {
      console.log("File written successfully: stack_diagram.py");
      // Update the previousCode variable for next run
      previousCode = code;
    }
  });
}

main();