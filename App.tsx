
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import RecipeForm from './components/RecipeForm';
import RecipeDisplay from './components/RecipeDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import { UserInput, Recipe, ApiKeyStatus } from './types';
import { generateRecipe } from './services/geminiService';
import { LOCAL_STORAGE_API_KEY, GEMINI_MODEL_NAME } from './constants';
import { CheckCircleIcon, ExclamationTriangleIcon, LeafIcon } from './components/Icons';

const isValidApiKeyFormat = (key: string): boolean => {
  return key.startsWith('AIza') && key.length > 30;
};

const ApiKeyManager: React.FC<{
  apiKey: string | null;
  apiKeyStatus: ApiKeyStatus;
  onSetApiKey: (key: string) => void;
  onClearApiKey: () => void;
  currentError: string | null;
}> = ({ apiKey, apiKeyStatus, onSetApiKey, onClearApiKey, currentError }) => {
  const [inputKey, setInputKey] = useState('');

  useEffect(() => {
    if (apiKey && apiKeyStatus === 'valid') {
      setInputKey(apiKey); // Pre-fill if a valid key is loaded
    } else {
      setInputKey(''); // Clear if no key or key is invalid/error
    }
  }, [apiKey, apiKeyStatus]);

  const handleSave = () => {
    onSetApiKey(inputKey);
  };

  const commonInputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm";
  const buttonClass = "px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2";

  return (
    <div className="p-6 mb-8 bg-white shadow-lg rounded-xl border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-800 mb-3">API Key Management</h3>
      {apiKeyStatus === 'valid' && apiKey && (
        <div className="mb-4 p-3 text-sm text-green-700 bg-green-100 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2"/>
            <span>API Key is configured and seems valid. (****{apiKey.slice(-4)})</span>
          </div>
          <button
            onClick={onClearApiKey}
            className={`${buttonClass} bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400`}
            aria-label="Clear stored API Key"
          >
            Change/Clear Key
          </button>
        </div>
      )}

      {(apiKeyStatus !== 'valid' || !apiKey) && (
         <p className="text-sm text-gray-600 mb-2">
          Enter your Google Gemini API Key to enable recipe generation. Your key will be stored in your browser's local storage.
        </p>
      )}
     
      {(apiKeyStatus === 'missing' || apiKeyStatus === 'invalid_format' || apiKeyStatus === 'error_api' || !apiKey) && (
        <div className="space-y-3">
          <div>
            <label htmlFor="apiKeyInput" className="block text-sm font-medium text-gray-700">
              Gemini API Key:
            </label>
            <input
              type="password"
              id="apiKeyInput"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className={`${commonInputClass} ${
                (apiKeyStatus === 'invalid_format' || apiKeyStatus === 'error_api') && currentError ? 'border-red-500' : ''
              }`}
              placeholder="Enter your API Key (starts with AIza...)"
            />
          </div>
          <button
            onClick={handleSave}
            className={`${buttonClass} bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 w-full sm:w-auto`}
            disabled={!inputKey.trim()}
          >
            Save API Key
          </button>
        </div>
      )}

      {apiKeyStatus === 'checking' && (
        <div className="p-3 text-sm text-blue-700 bg-blue-100 rounded-lg">
          Verifying API Key status...
        </div>
      )}

      {currentError && (apiKeyStatus === 'invalid_format' || apiKeyStatus === 'error_api' || (apiKeyStatus === 'missing' && currentError.includes("API_KEY environment variable is missing"))) && (
         <div className="mt-3 p-3 text-sm text-red-700 bg-red-100 rounded-lg flex items-center">
           <ExclamationTriangleIcon className="h-5 w-5 mr-2 shrink-0"/>
           <span>{currentError}</span>
         </div>
      )}
       <p className="mt-3 text-xs text-gray-500">
        You can obtain a Gemini API key from Google AI Studio. The application requires access to the '{GEMINI_MODEL_NAME}' model.
      </p>
    </div>
  );
};


const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [recipeData, setRecipeData] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null); // General errors + API key related errors for display

  useEffect(() => {
    setApiKeyStatus('checking');
    setError(null);
    let keyFound: string | null = null;
    let status: ApiKeyStatus = 'missing';

    // 1. Try localStorage
    const storedKey = localStorage.getItem(LOCAL_STORAGE_API_KEY);
    if (storedKey) {
      if (isValidApiKeyFormat(storedKey)) {
        keyFound = storedKey;
        status = 'valid';
        console.info("API Key loaded from localStorage.");
      } else {
        // Invalid format in localStorage, treat as missing and clear it.
        localStorage.removeItem(LOCAL_STORAGE_API_KEY);
        setError("Stored API key had an invalid format and was cleared. Please re-enter.");
        status = 'invalid_format'; 
        console.warn("Invalid API Key format found in localStorage. Cleared.");
      }
    }

    // 2. Try process.env as a fallback if nothing valid in localStorage
    // This is mainly for local development convenience.
    if (!keyFound) {
      const keyFromEnv = (typeof process !== 'undefined' && process.env && process.env.API_KEY) 
                         ? process.env.API_KEY 
                         : null;
      if (keyFromEnv) {
        if (isValidApiKeyFormat(keyFromEnv)) {
          keyFound = keyFromEnv;
          status = 'valid';
          // Optionally, save to localStorage if found in env and not already there or invalid there
          if (!storedKey || !isValidApiKeyFormat(storedKey || '')) {
            localStorage.setItem(LOCAL_STORAGE_API_KEY, keyFromEnv);
          }
          console.info("API Key loaded from environment variable.");
        } else {
          // Env key is present but invalid format
           if (status !== 'invalid_format') { // Don't overwrite localStorage error if it was more specific
             setError("API Key from environment variable has an invalid format. Please provide a valid key.");
             status = 'invalid_format';
           }
          console.warn("API Key from environment variable has invalid format.");
        }
      }
    }
    
    setApiKey(keyFound);
    setApiKeyStatus(keyFound && status === 'valid' ? 'valid' : status);
    if (!keyFound && status === 'missing') {
       setError("API Key is not configured. Please enter your Gemini API Key to begin.");
    }

  }, []);

  const handleSetApiKey = useCallback((newKey: string) => {
    setError(null);
    if (isValidApiKeyFormat(newKey)) {
      setApiKey(newKey);
      localStorage.setItem(LOCAL_STORAGE_API_KEY, newKey);
      setApiKeyStatus('valid');
      console.info("API Key saved to localStorage.");
    } else {
      setApiKey(null); // Clear invalid key from state
      localStorage.removeItem(LOCAL_STORAGE_API_KEY); // Also remove from storage
      setApiKeyStatus('invalid_format');
      setError('Invalid API Key format. Key must start with "AIza" and be longer than 30 characters.');
      console.warn("Attempted to save an API Key with invalid format.");
    }
  }, []);

  const handleClearApiKey = useCallback(() => {
    setApiKey(null);
    localStorage.removeItem(LOCAL_STORAGE_API_KEY);
    setApiKeyStatus('missing');
    setError("API Key cleared. Please enter a new API Key to continue.");
    setRecipeData(null); // Clear recipe data if API key is cleared
    console.info("API Key cleared from localStorage and state.");
  }, []);

  const handleRecipeSubmit = useCallback(async (userInput: UserInput) => {
    if (!apiKey || apiKeyStatus !== 'valid') {
      setError("Cannot generate recipe: API Key is not valid or not configured.");
      setApiKeyStatus(apiKey ? 'error_api' : 'missing'); // If key exists but status not valid, mark as error_api
      return;
    }
    setIsLoading(true);
    setError(null);
    setRecipeData(null); 
    try {
      console.log("Submitting to Gemini with user input:", userInput);
      const recipe = await generateRecipe(userInput, apiKey);
      setRecipeData(recipe);
    } catch (err: any) {
      console.error("Error in handleRecipeSubmit:", err);
      setError(err.message || 'Failed to generate recipe.');
      setRecipeData(null);
      if (err.message && (err.message.includes("API Key was rejected by Google") || err.message.includes("API key not valid"))) {
        setApiKeyStatus('error_api'); // Specific status for API key rejection
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, apiKeyStatus]);


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <ApiKeyManager 
          apiKey={apiKey} 
          apiKeyStatus={apiKeyStatus} 
          onSetApiKey={handleSetApiKey}
          onClearApiKey={handleClearApiKey}
          currentError={error}
        />
        
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="lg:sticky lg:top-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Craft Your Infusion</h2>
            <RecipeForm 
              onSubmit={handleRecipeSubmit} 
              isLoading={isLoading} 
              apiKeyValid={apiKeyStatus === 'valid' && !!apiKey}
            />
          </div>

          <div className="mt-8 lg:mt-0">
            {isLoading && <LoadingSpinner />}
            
            {!isLoading && error && recipeData === null && apiKeyStatus !== 'valid' && (
              // Show general errors when form is essentially disabled or API key related issues prevent recipe display
              <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg shadow" role="alert">
                <span className="font-medium">Configuration Issue:</span> {error}
              </div>
            )}

            {!isLoading && error && recipeData === null && apiKeyStatus === 'valid' && (
              // Errors from API call specifically, when key was thought to be valid
               <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg shadow" role="alert">
                <span className="font-medium">Recipe Generation Error:</span> {error}
              </div>
            )}
             {!isLoading && error && recipeData !== null && ( 
              // Error on subsequent attempts, but previous data might still be shown
              <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg shadow" role="alert">
                <span className="font-medium">Error generating new recipe:</span> {error}
              </div>
            )}

            {!isLoading && recipeData && <RecipeDisplay recipe={recipeData} />}
            
            {!isLoading && !error && !recipeData && apiKeyStatus === 'valid' && !!apiKey && (
              <div className="text-center p-10 border-2 border-dashed border-emerald-300 rounded-lg bg-white/60 shadow">
                <LeafIcon className="h-16 w-16 mx-auto text-emerald-400 mb-4" />
                <h3 className="text-xl font-semibold text-emerald-700 mb-2">Ready to Create!</h3>
                <p className="text-gray-600">
                  Use the form on the left to specify your preferences.
                </p>
              </div>
            )}
            {!isLoading && !recipeData && (apiKeyStatus === 'missing' || apiKeyStatus === 'invalid_format' || apiKeyStatus === 'error_api' || !apiKey) && (
              <div className="text-center p-10 border-2 border-dashed border-red-300 rounded-lg bg-white/60 shadow">
                 <ExclamationTriangleIcon className="h-16 w-16 mx-auto text-red-400 mb-4" />
                <h3 className="text-xl font-semibold text-red-700 mb-2">API Key Required</h3>
                <p className="text-gray-600">
                  Please configure a valid Gemini API Key using the management section above to enable recipe generation.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
