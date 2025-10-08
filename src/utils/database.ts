// 🗄️ SUPABASE DATABASE - Direct exports from real database
// Using Supabase for all database operations

import * as realDatabase from './realDatabase';

// 🔄 EXPORT DATABASE FUNCTIONS - All from Supabase
export const saveDesign = realDatabase.saveDesign;
export const getDesigns = realDatabase.getDesigns;
export const getAllDesigns = (realDatabase as any).getAllDesigns;
export const deleteDesign = realDatabase.deleteDesign;
export const updateDesign = realDatabase.updateDesign;
export const debugDatabase = realDatabase.debugDatabase;
export const testConnection = realDatabase.testConnection;
export const testBasicConnection = realDatabase.testBasicConnection;

// 📝 Log which database we're using
console.log(`🏪 Using SUPABASE database`); 