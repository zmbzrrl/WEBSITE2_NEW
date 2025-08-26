// 🔄 DATABASE SWITCHER - This lets us easily switch between mock and real database
// Think of it like having a switch to choose between "toy kitchen" and "real kitchen"

// 🎛️ SWITCH SETTING - Change this to switch between databases
// true = Use real database (Supabase)
// false = Use mock database (browser memory)
const USE_REAL_DATABASE = true;

// 📦 Import both database implementations
import * as mockDatabase from './mockDatabase';
import * as realDatabase from './realDatabase';

// 🔄 EXPORT THE RIGHT DATABASE FUNCTIONS
// This is like choosing which kitchen to use based on the switch
export const saveDesign = USE_REAL_DATABASE 
  ? realDatabase.saveDesign 
  : mockDatabase.saveDesign;

export const getDesigns = USE_REAL_DATABASE 
  ? realDatabase.getDesigns 
  : mockDatabase.getDesigns;

export const getAllDesigns = USE_REAL_DATABASE
  ? (realDatabase as any).getAllDesigns
  : (mockDatabase as any).getAllDesigns;

export const deleteDesign = USE_REAL_DATABASE 
  ? realDatabase.deleteDesign 
  : mockDatabase.deleteDesign;

export const updateDesign = USE_REAL_DATABASE 
  ? realDatabase.updateDesign 
  : mockDatabase.updateDesign;

export const debugDatabase = USE_REAL_DATABASE 
  ? realDatabase.debugDatabase 
  : mockDatabase.debugDatabase;

export const testConnection = USE_REAL_DATABASE 
  ? realDatabase.testConnection 
  : mockDatabase.testConnection;

export const testBasicConnection = USE_REAL_DATABASE 
  ? realDatabase.testBasicConnection 
  : mockDatabase.testBasicConnection;

// 📝 Log which database we're using
console.log(`🏪 Using ${USE_REAL_DATABASE ? 'REAL' : 'MOCK'} database`); 