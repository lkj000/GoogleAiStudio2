

// FIX: Corrected the import path from "@google/ai" to "@google/genai"
import { GoogleGenAI, Type } from "@google/genai";
import { PluginTemplate } from "../types";
import { dspSources } from './dsp';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const pluginGenerationSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: "A unique, URL-friendly ID in kebab-case. e.g., 'vintage-tape-warble'" },
    name: { type: Type.STRING, description: "A creative, descriptive name for the plugin. e.g., 'Vintage Tape Warble'" },
    type: { type: Type.STRING, enum: ['instrument', 'effect', 'utility'], description: "The category of the plugin." },
    framework: { type: Type.STRING, enum: ['JUCE', 'Web Audio'], description: "The target framework for the plugin code." },
    description: { type: Type.STRING, description: "A brief, compelling description of what the plugin does." },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "An array of 4-5 relevant, lowercase tags. e.g., ['lo-fi', 'tape', 'chorus', 'vintage']"
    },
    parameters: {
      type: Type.ARRAY,
      description: "An array of parameter objects that control the plugin.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "A short, camelCase ID for the parameter. e.g., 'wowAmount'" },
          name: { type: Type.STRING, description: "A user-friendly name for the UI. e.g., 'Wow Amount'" },
          type: { type: Type.STRING, enum: ['range', 'toggle'], description: "The type of UI control." },
          defaultValue: { type: Type.NUMBER, description: "The default value for the parameter." },
          min: { type: Type.NUMBER, description: "The minimum value for a 'range' type." },
          max: { type: Type.NUMBER, description: "The maximum value for a 'range' type." },
          step: { type: Type.NUMBER, description: "The step increment for a 'range' type." },
          unit: { type: Type.STRING, enum: ['%', 'ms', 'Hz', 'dB'], description: "The unit for the parameter value." },
          affects: { type: Type.STRING, description: "The name of the DSP module this parameter primarily controls." }
        },
        required: ["id", "name", "type", "defaultValue"]
      }
    },
    signalChain: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "An array of strings listing the DSP modules in their processing order. e.g., ['Saturation', 'Reverb']"
    },
    code: { type: Type.STRING, description: "The full, complete, and syntactically correct boilerplate code for the specified framework, incorporating all the defined parameters and the correct signal chain order." }
  },
  required: ["id", "name", "type", "framework", "description", "tags", "parameters", "code", "signalChain"]
};

// New, more robust schema for refactoring operations
const pluginRefactoringSchema = {
  type: Type.OBJECT,
  properties: {
    parameters: pluginGenerationSchema.properties.parameters,
    signalChain: pluginGenerationSchema.properties.signalChain,
    code: pluginGenerationSchema.properties.code
  },
  required: ["parameters", "code", "signalChain"]
};

const signalChainRefactoringSchema = {
    type: Type.OBJECT,
    properties: {
        signalChain: pluginGenerationSchema.properties.signalChain,
        code: pluginGenerationSchema.properties.code
    },
    required: ["signalChain", "code"]
};


const parseJsonResponse = (rawText: string): any => {
    let cleanedText = rawText.trim();
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = cleanedText.match(jsonRegex);

    if (match && match[1]) {
        cleanedText = match[1];
    }

    try {
        return JSON.parse(cleanedText);
    } catch (e) {
        console.error("Failed to parse JSON response:", cleanedText);
        throw new Error("AI returned malformed JSON.");
    }
};


export const generatePluginFromDescription = async (
  description: string,
  framework: 'JUCE' | 'Web Audio'
): Promise<PluginTemplate> => {
  const prompt = `
    You are an expert audio plugin developer. Your task is to generate a complete VST plugin configuration from a user's description.
    The user wants to create a plugin with the following description: "${description}".
    The target framework is: "${framework}".

    Based on this, generate a complete plugin package. This includes:
    1.  A creative and fitting name for the plugin.
    2.  A concise description.
    3.  A set of relevant tags.
    4.  The 'framework' property, which must be "${framework}".
    5.  A detailed list of parameters that would be needed to control this plugin's features. Each parameter must have a unique ID, a user-friendly name, a type ('range' or 'toggle'), and a sensible default value, min/max, step, and unit for range types.
    6.  An array of strings for the 'signalChain' property, listing the DSP modules in their processing order. This should be derived from the description.
    7.  The complete, production-ready boilerplate code for the chosen framework ('JUCE' or 'Web Audio'). The code must be fully functional, correctly reference the parameters you've defined, and respect the signal chain order. For JUCE, provide a professional C++ header and source file structure within a single string. For Web Audio, provide a complete JavaScript class that can be instantiated and has 'input' and 'output' AudioNode properties, and a 'setParam(id, value)' method.

    Return the entire package as a single, valid JSON object that adheres to the provided schema. Do not include any markdown formatting like \`\`\`json.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: pluginGenerationSchema,
      },
    });
    
    const generatedJson = parseJsonResponse(response.text);

    const pluginTemplate: PluginTemplate = {
      id: generatedJson.id,
      name: generatedJson.name,
      type: generatedJson.type,
      framework: generatedJson.framework,
      description: generatedJson.description,
      tags: generatedJson.tags,
      parameters: generatedJson.parameters,
      code: generatedJson.code,
      signalChain: generatedJson.signalChain,
    };
    
    return pluginTemplate;

  } catch (error) {
    console.error("Error generating plugin from description:", error);
    throw new Error("Failed to generate plugin. The AI may have returned an invalid format.");
  }
};


export const addModuleToProject = async (
  existingProject: PluginTemplate,
  moduleName: string,
  moduleDescription: string
): Promise<PluginTemplate> => {

  if (existingProject.framework !== 'JUCE') {
    throw new Error("Module integration is currently only supported for JUCE projects.");
  }

  const moduleSource = dspSources[moduleName as keyof typeof dspSources];
  if (!moduleSource) {
    throw new Error(`DSP source for module "${moduleName}" not found.`);
  }
  
  const prompt = `
    You are an expert JUCE plugin developer specializing in precise code refactoring.
    A user wants to add a new DSP module to their existing plugin.

    **Module Request:**
    - Module to Add: ${moduleName}
    - Module Description: ${moduleDescription}

    **DSP Library Source Code for ${moduleName}:**
    This is the specific C++ class from the library you MUST use. Its class name within the AmapianoDSP namespace is \`${moduleName}\`.
    \`\`\`cpp
    ${moduleSource}
    \`\`\`

    **Existing Plugin Context:**
    - Plugin Name: ${existingProject.name}
    - Existing Parameters: ${JSON.stringify(existingProject.parameters, null, 2)}
    - Existing Code (Header and Source):
    \`\`\`cpp
    ${existingProject.code}
    \`\`\`

    **Your Task (Follow these steps PRECISELY):**
    1.  **Define New Parameters:** Identify and define the necessary \`juce::AudioParameterFloat\` or \`juce::AudioParameterBool\` parameters to control this module. For example, a Saturation module might need a 'drive' parameter. Give them sensible names, IDs, ranges, and units. Each new parameter's "affects" property MUST be "${moduleName}".
    2.  **Refactor the Code:** Modify the existing C++ code to integrate the new module as described in previous instructions.
    3.  **Update Signal Chain:** Add "${moduleName}" to the END of the existing signalChain array.
    4.  **Return ONLY the changed parts:** Respond with a single JSON object containing ONLY the following updated properties:
        - The **full, combined list** of old and new parameters.
        - The updated 'signalChain' array.
        - The **entire, fully refactored C++ code**.

    CRITICAL: Do not return the full project object, only the changed properties. Do not include markdown formatting.
  `;

   try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: pluginRefactoringSchema,
      },
    });
    
    const generatedJson = parseJsonResponse(response.text);
    
    // Merge the AI's response with the existing project data to ensure stability
    const updatedTemplate: PluginTemplate = {
      ...existingProject,
      parameters: generatedJson.parameters,
      code: generatedJson.code,
      signalChain: generatedJson.signalChain,
    };
    
    return updatedTemplate;

  } catch (error) {
    console.error("Error adding module to project:", error);
    throw new Error("Failed to add module. The AI may have returned an invalid format or failed to refactor the code.");
  }

};

export const generatePluginFromSmartTemplate = async (templateName: 'Amapianorizer' | 'Lofi Chillifier'): Promise<PluginTemplate> => {
    const prompts