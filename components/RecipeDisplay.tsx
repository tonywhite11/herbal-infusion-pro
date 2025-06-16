
import React from 'react';
import { Recipe, SafetySeverity, RecipeIngredient, RecipeEquipmentItem, RecipeStep, RecommendedSoluble, SafetyNote } from '../types';
import { DownloadIcon, InfoIcon, WarningIcon, CriticalIcon, AltaIcon } from './Icons';

interface RecipeDisplayProps {
  recipe: Recipe;
}

const SafetyIcon: React.FC<{ severity: SafetySeverity }> = ({ severity }) => {
  switch (severity) {
    case SafetySeverity.Info:
      return <InfoIcon className="h-5 w-5 text-blue-500 mr-2 shrink-0" />;
    case SafetySeverity.Warning:
      return <WarningIcon className="h-5 w-5 text-yellow-500 mr-2 shrink-0" />;
    case SafetySeverity.Critical:
      return <CriticalIcon className="h-5 w-5 text-red-500 mr-2 shrink-0" />;
    default:
      return null;
  }
};

const Section: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => (
  <details className="bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow group" open={defaultOpen}>
    <summary className="font-semibold text-lg text-emerald-700 cursor-pointer group-hover:text-emerald-800 transition-colors">
      {title}
    </summary>
    <div className="mt-2 text-gray-700 space-y-2 prose prose-sm max-w-none">
      {children}
    </div>
  </details>
);

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipe }) => {
  const downloadRecipe = () => {
    let content = `Herbal Infusion Recipe: ${recipe.title}\n\n`;
    content += `Description: ${recipe.description}\n\n`;
    content += `Infusion Type: ${recipe.infusionType}\n`;
    if (recipe.infusionMethodNotes) content += `Method Notes: ${recipe.infusionMethodNotes}\n`;
    if (recipe.proTipsForALTA1 && recipe.proTipsForALTA1.length > 0) {
      content += `\nPro-Tips for ALTA1 Users:\n`;
      recipe.proTipsForALTA1.forEach(tip => content += `- ${tip}\n`);
    }
    if (recipe.targetAudienceNotes) content += `\nTarget Audience: ${recipe.targetAudienceNotes}\n`;
    content += `\nPreparation Time: ${recipe.preparationTime}\n`;
    content += `Yield: ${recipe.yield}\n\n`;

    content += `Ingredients:\n`;
    recipe.ingredients.forEach((ing: RecipeIngredient) => {
      content += `- ${ing.quantity} ${ing.unit} ${ing.name}${ing.notes ? ` (${ing.notes})` : ''}\n`;
    });

    content += `\nEquipment Needed:\n`;
    recipe.equipment.forEach((item: RecipeEquipmentItem) => {
      content += `- ${item.name}${item.notes ? ` (${item.notes})` : ''}\n`;
    });

    content += `\nInstructions:\n`;
    recipe.instructions.forEach((step: RecipeStep) => {
      content += `${step.stepNumber}. ${step.description}\n`;
    });

    if (recipe.recommendedSolubles && recipe.recommendedSolubles.length > 0) {
      content += `\nRecommended Solubles:\n`;
      recipe.recommendedSolubles.forEach((sol: RecommendedSoluble) => {
        content += `- ${sol.name}: ${sol.rationale}\n`;
      });
    }

    content += `\nStorage Instructions:\n`;
    content += `Guidance: ${recipe.storageInstructions.guidance}\n`;
    content += `Shelf Life: ${recipe.storageInstructions.shelfLife}\n`;

    content += `\nSafety Considerations:\n`;
    recipe.safetyConsiderations.forEach((note: SafetyNote) => {
      content += `[${note.severity.toUpperCase()}] ${note.message}\n`;
    });

    if (recipe.potentialBenefits && recipe.potentialBenefits.length > 0) {
      content += `\nPotential Benefits (Non-Medical):\n`;
      recipe.potentialBenefits.forEach(benefit => content += `- ${benefit}\n`);
    }

    content += `\nDisclaimer: ${recipe.disclaimer}\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const fileName = `${recipe.title.replace(/\s+/g, '_').toLowerCase()}_recipe.txt`;
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-8 p-6 md:p-8 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 shadow-2xl rounded-xl border border-emerald-200 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b-2 border-emerald-200">
        <h2 className="text-3xl font-bold text-emerald-800 mb-2 sm:mb-0">{recipe.title}</h2>
        <button
          onClick={downloadRecipe}
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          <DownloadIcon className="h-5 w-5 mr-2" />
          Download Recipe
        </button>
      </div>

      <p className="text-gray-700 italic text-lg leading-relaxed">{recipe.description}</p>
      
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <div className="bg-emerald-100 p-3 rounded-lg shadow"><strong>Infusion Type:</strong> {recipe.infusionType}</div>
        <div className="bg-emerald-100 p-3 rounded-lg shadow"><strong>Prep Time:</strong> {recipe.preparationTime}</div>
        <div className="bg-emerald-100 p-3 rounded-lg shadow"><strong>Yield:</strong> {recipe.yield}</div>
        {recipe.targetAudienceNotes && <div className="bg-emerald-100 p-3 rounded-lg shadow md:col-span-2"><strong>Target Audience:</strong> {recipe.targetAudienceNotes}</div>}
      </div>

      {recipe.infusionMethodNotes && (
         <Section title="Infusion Method Notes" defaultOpen={recipe.proTipsForALTA1 && recipe.proTipsForALTA1.length > 0}>
           <p>{recipe.infusionMethodNotes}</p>
         </Section>
      )}
      
      {recipe.proTipsForALTA1 && recipe.proTipsForALTA1.length > 0 && (
        <Section title="Pro-Tips for ALTA1 Users" defaultOpen>
          <div className="flex items-center mb-2 text-emerald-700 font-semibold">
            <AltaIcon className="h-6 w-6 mr-2 text-emerald-600"/> ALTA1 Specific Advice
          </div>
          <ul className="list-disc list-inside space-y-1">
            {recipe.proTipsForALTA1.map((tip, index) => <li key={index}>{tip}</li>)}
          </ul>
        </Section>
      )}

      <Section title="Ingredients" defaultOpen>
        <ul className="list-disc list-inside space-y-1">
          {recipe.ingredients.map((ing, index) => (
            <li key={index}>
              <strong>{ing.quantity} {ing.unit} {ing.name}</strong>
              {ing.notes && <span className="text-xs text-gray-600"> ({ing.notes})</span>}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Equipment Needed" defaultOpen>
        <ul className="list-disc list-inside space-y-1">
          {recipe.equipment.map((item, index) => (
            <li key={index}>
              {item.name}
              {item.notes && <span className="text-xs text-gray-600"> ({item.notes})</span>}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Instructions" defaultOpen>
        <ol className="list-decimal list-inside space-y-2">
          {recipe.instructions.map((step) => (
            <li key={step.stepNumber} className="leading-relaxed">{step.description}</li>
          ))}
        </ol>
      </Section>

      {recipe.recommendedSolubles && recipe.recommendedSolubles.length > 0 && (
        <Section title="Recommended Solubles">
          <ul className="space-y-2">
            {recipe.recommendedSolubles.map((sol, index) => (
              <li key={index}>
                <strong>{sol.name}:</strong> {sol.rationale}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Storage Instructions">
        <p><strong>Guidance:</strong> {recipe.storageInstructions.guidance}</p>
        <p><strong>Shelf Life:</strong> {recipe.storageInstructions.shelfLife}</p>
      </Section>

      <Section title="Safety Considerations" defaultOpen>
        <ul className="space-y-2">
          {recipe.safetyConsiderations.map((note, index) => (
            <li key={index} className={`flex items-start p-3 rounded-md ${
              note.severity === SafetySeverity.Critical ? 'bg-red-100 border-l-4 border-red-500 text-red-700' :
              note.severity === SafetySeverity.Warning ? 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700' :
              'bg-blue-100 border-l-4 border-blue-500 text-blue-700'
            }`}>
              <SafetyIcon severity={note.severity} />
              <span>{note.message}</span>
            </li>
          ))}
        </ul>
      </Section>

      {recipe.potentialBenefits && recipe.potentialBenefits.length > 0 && (
        <Section title="Potential Benefits (Non-Medical)">
          <ul className="list-disc list-inside space-y-1">
            {recipe.potentialBenefits.map((benefit, index) => <li key={index}>{benefit}</li>)}
          </ul>
        </Section>
      )}

      <Section title="Disclaimer">
        <p className="text-xs italic text-gray-600">{recipe.disclaimer}</p>
      </Section>
    </div>
  );
};

export default RecipeDisplay;
