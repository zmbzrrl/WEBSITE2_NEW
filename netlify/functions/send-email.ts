// 🏪 REAL BACKEND FUNCTION - This is like a REAL KITCHEN on the internet
// It runs on Netlify's servers when your website calls it
// Think of it like a real restaurant kitchen that's always ready to cook

import { Handler } from '@netlify/functions'

// 🍳 When you're ready for real email, uncomment these lines:
// import sgMail from '@sendgrid/mail'
// sgMail.setApiKey(process.env.SENDGRID_API_KEY!) // The chef's secret recipe

// 🍽️ This function runs when someone visits your website and calls this API
// Like a chef who's always ready to cook when orders come in
export const handler: Handler = async (event) => {
  // 🔒 Only allow POST requests (when form is submitted)
  // This is like only accepting orders, not random people walking into the kitchen
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,  // ❌ "Sorry, we don't accept that type of request"
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    // 📋 Get the data from the form submission
    // This is like reading the order ticket from the waiter
    const projectDetails = JSON.parse(event.body || '{}')
    
    // 🍳 When you're ready for real email, uncomment this block:
    /*
    // 📝 Write the email (like writing a note to the customer)
    const msg = {
      to: projectDetails.email, // Customer's email
      from: 'YOUR_SENDGRID_VERIFIED_EMAIL', // Your email (must be verified with SendGrid)
      subject: `Project Created: ${projectDetails.projectName}`,
      html: `<h1>Your Project Has Been Created!</h1>
             <p>Project Name: ${projectDetails.projectName}</p>
             <p>Location: ${projectDetails.location}</p>`
    }
    // 📬 Chef sends the email (puts it in the mailbox)
    await sgMail.send(msg)
    */

    // 🚧 For now, just return success (we'll add email sending in the next step)
    // This is like the kitchen saying "we got your order" but not actually cooking yet
    return {
      statusCode: 200,  // ✅ "Success! We processed your order"
      headers: {
        'Content-Type': 'application/json',
        // 🌐 Allow your frontend to call this function
        // This is like telling the waiter "yes, you can bring orders to this kitchen"
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        success: true,  // ✅ "Yes, we successfully processed your order!"
        message: 'Project details received successfully! (Ready for email)',  // 📝 "Here's your confirmation"
        projectName: projectDetails.projectName,  // 🏷️ "The project you ordered"
        error: null  // ✅ "No problems in the kitchen"
      })
    }
    
  } catch (error) {
    // 💥 If something goes wrong, return an error
    // This is like the kitchen catching fire - something went really wrong
    console.error('Error processing request:', error)
    return {
      statusCode: 500,  // ❌ "Sorry, we had a problem in the kitchen"
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Failed to process request'  // 📝 "We couldn't process your order"
      })
    }
  }
} 