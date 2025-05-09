import React, { createContext, useContext, useState } from 'react';

// Create the Context
const PredictedBudgetContext = createContext();

// Create a Provider component
export const PredictedBudgetProvider = ({ children }) => {
  const [predictedBudget, setPredictedBudget] = useState(null);
  const [currentIncome, setCurrentIncome] = useState(null); // Also store income for context

  return (
    <PredictedBudgetContext.Provider value={{ predictedBudget, setPredictedBudget, currentIncome, setCurrentIncome }}>
      {children}
    </PredictedBudgetContext.Provider>
  );
};

// Create a custom hook to use the context
export const usePredictedBudget = () => {
  const context = useContext(PredictedBudgetContext);
  if (!context) {
    throw new Error('usePredictedBudget must be used within a PredictedBudgetProvider');
  }
  return context;
};
