
import React, { useState, useCallback } from 'react';
import { UserInput, InfusionType } from '../types';
import { INFUSION_TYPE_OPTIONS } from '../constants';
import { AltaIcon } from './Icons';

interface RecipeFormProps {
  onSubmit: (data: UserInput) => void;
  isLoading: boolean;
  apiKeyValid: boolean;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ onSubmit, isLoading, apiKeyValid }) => {
  const [infusionType, setInfusionType] = useState<InfusionType>(InfusionType.DrinkMixTea);
  const [mainHerbs, setMainHerbs] = useState('');
  const [desiredEffects, setDesiredEffects] = useState('');
  const [allergies, setAllergies] = useState('');
  const [useAlta1, setUseAlta1] = useState(false);
  const [effectsError, setEffectsError] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!desiredEffects.trim()) {
      setEffectsError('Desired effects field is required.');
      return;
    }
    setEffectsError('');
    onSubmit({
      infusionType,
      mainHerbs,
      desiredEffects,
      allergies,
      useAlta1,
    });
  }, [infusionType, mainHerbs, desiredEffects, allergies, useAlta1, onSubmit]);

  const commonInputClass = "mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors duration-150 ease-in-out hover:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed";
  const commonLabelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 md:p-8 bg-white shadow-xl rounded-xl border border-gray-200">
      <div>
        <label htmlFor="infusionType" className={commonLabelClass}>
          Infusion Type
        </label>
        <select
          id="infusionType"
          value={infusionType}
          onChange={(e) => setInfusionType(e.target.value as InfusionType)}
          className={commonInputClass}
          disabled={!apiKeyValid || isLoading}
        >
          {INFUSION_TYPE_OPTIONS.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="mainHerbs" className={commonLabelClass}>
          Main Herbs (optional, comma-separated)
        </label>
        <input
          type="text"
          id="mainHerbs"
          value={mainHerbs}
          onChange={(e) => setMainHerbs(e.target.value)}
          placeholder="e.g., Lavender, Chamomile"
          className={commonInputClass}
          disabled={!apiKeyValid || isLoading}
        />
      </div>

      <div>
        <label htmlFor="desiredEffects" className={commonLabelClass}>
          Desired Effects / Purpose <span className="text-red-500">*</span>
        </label>
        <textarea
          id="desiredEffects"
          value={desiredEffects}
          onChange={(e) => {
            setDesiredEffects(e.target.value);
            if (e.target.value.trim()) setEffectsError('');
          }}
          placeholder="e.g., Calming, energizing, skin soothing, for a relaxing evening"
          rows={3}
          className={`${commonInputClass} ${effectsError ? 'border-red-500' : ''}`}
          disabled={!apiKeyValid || isLoading}
          required
        />
        {effectsError && <p className="mt-1 text-xs text-red-600">{effectsError}</p>}
      </div>

      <div>
        <label htmlFor="allergies" className={commonLabelClass}>
          Allergies / Avoidances (optional, comma-separated)
        </label>
        <input
          type="text"
          id="allergies"
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
          placeholder="e.g., Nuts, Ragweed"
          className={commonInputClass}
          disabled={!apiKeyValid || isLoading}
        />
      </div>

      <div className="flex items-center space-x-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
        <input
          id="useAlta1"
          type="checkbox"
          checked={useAlta1}
          onChange={(e) => setUseAlta1(e.target.checked)}
          className="h-5 w-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 disabled:opacity-50"
          disabled={!apiKeyValid || isLoading}
        />
        <label htmlFor="useAlta1" className="flex items-center text-sm font-medium text-emerald-700 cursor-pointer">
          <AltaIcon className="h-6 w-6 mr-2 text-emerald-600" />
          Using ALTA1 Ultrasonic Infuser?
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading || !apiKeyValid || !!effectsError}
        className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-150 ease-in-out group"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          'Create My Infusion'
        )}
      </button>
    </form>
  );
};

export default RecipeForm;
