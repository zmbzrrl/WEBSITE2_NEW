// 🍽️ MOCK BACKEND - This is like a PRETEND KITCHEN for testing
// This simulates what the real Netlify function will do
// Think of it like playing "restaurant" - you pretend to be the chef

export const mockSendEmail = async (projectDetails: any) => {
  // ⏰ Simulate network delay (like pretending to cook for 1 second)
  // This makes it feel like a real kitchen that takes time to cook
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 🎭 Simulate success response (like pretending the food was cooked perfectly)
  // This is what the "pretend kitchen" sends back to the waiter
  return {
    success: true,  // ✅ "Yes, we successfully cooked the food!"
    message: 'Project details received successfully! (Mock)',  // 📝 "Here's your order details"
    projectName: projectDetails.projectName,  // 🏷️ "The dish you ordered"
    error: null // Add this to fix TypeScript error (no problems in the kitchen)
  };
}; 