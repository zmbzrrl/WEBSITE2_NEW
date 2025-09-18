//                                        ===== IMPORTS SECTION =====

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// Box = flexible container, Typography = text styling, Button = clickable buttons
// styled = creates custom styled components, TextField = input forms, Paper = card-like containers
import {
  Box,
  Typography,
  Button,
  styled,
  TextField,
  Paper,
} from '@mui/material';


// Material-UI icons - provides ready-to-use icons
// RocketLaunchIcon = rocket ship icon, ArrowDownwardIcon = down arrow icon
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

//                                    ===== IMAGE IMPORTS =====
// Importing images that will be displayed on the home page

import logo from '../assets/logo.png';
import tagPir from '../assets/panels/TAG_FLAT_95x95.png';    
import idpgRn from '../assets/panels/IDPG flat 130x180_RN_bar.png';   
import idpg from '../assets/panels/IDPG_95X95_Icons.png';         
import sp from '../assets/panels/GS09_95x95_Flat.png';          
import x2rs from '../assets/panels/GS_Extended_Flat.png';        
import dpRt from '../assets/panels/GS_Double module_224x95.png';        

//                                   ===== CONTEXT IMPORT =====
// ProjectContext = shared storage that any component can access
// This stores project information (name, code) that's used across the app
import { ProjectContext } from '../App';
import { mockSendEmail } from '../utils/mockBackend';
import { isAdminEmail } from '../utils/admin';
import { supabase } from '../utils/supabaseClient';
 


//                              ===== STYLED COMPONENTS SECTION =====
// These are custom-styled components that look exactly how you want them
// Think of them as "custom furniture" for your website

//                              ===== MAIN CONTAINER STYLING =====
// HomeContainer = the main background and layout for the entire home page
const HomeContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',           // Makes the container full screen height (100% of viewport height)
  width: '100%',                // Makes the container full screen width
  background: 'linear-gradient(135deg, #2c3e50 0%, #4a5568 100%)',  // Beautiful gradient background (dark blue to gray)
  display: 'flex',              // Uses flexbox layout (modern way to arrange elements)
  flexDirection: 'column',      // Arranges children vertically (top to bottom)
  alignItems: 'center',         // Centers children horizontally (left to right)
  justifyContent: 'center',     // Centers children vertically (top to bottom)
  position: 'relative',         // Allows positioning of child elements
  padding: theme.spacing(2),    // Adds space around the edges (using Material-UI spacing)
  overflow: 'visible',          // Shows content that goes outside the container
  fontFamily: 'sans-serif'      // Sets the font to a clean, modern sans-serif font
}));

// ===== CONTENT WRAPPER STYLING =====
// ContentWrapper = contains all the main content (logo, text, buttons)
const ContentWrapper = styled(Box)({
  position: 'relative',         // Allows positioning relative to this container
  zIndex: 2,                    // Makes this appear above other elements (higher number = on top)
  textAlign: 'center',          // Centers all text inside
  display: 'flex',              // Uses flexbox layout
  flexDirection: 'column',      // Arranges children vertically
  alignItems: 'center',         // Centers children horizontally
  gap: '2rem',                  // Adds space between children (2rem = 32px)
  fontFamily: 'sans-serif',     // Sets the font
  width: '100%',                // Takes full width of parent
  maxWidth: '720px'             // Maximum width (prevents it from getting too wide on large screens)
});

// ===== LOGO STYLING =====
// Logo = the main company logo that appears at the top
// $showPrompt = a prop that controls whether the form is showing
const Logo = styled('img', { shouldForwardProp: (prop) => prop !== '$showPrompt' })<{ $showPrompt?: boolean }>(({ $showPrompt }) => ({
  width: '400px',               // Sets logo width to 400 pixels
  marginBottom: '2rem',         // Adds space below the logo
  marginTop: '-1rem',           // Moves logo up slightly (negative margin)
  animation: $showPrompt ? 'fadeOut 0.3s ease-out 0.3s forwards' : 'fadeIn 1.2s ease-out',  // Animation based on form state
  position: 'relative',         // Allows positioning
  zIndex: 2,                    // Makes logo appear above other elements
  filter: 'brightness(0) invert(1)',  // Makes logo white (inverts colors)
  
  // ===== FADE IN ANIMATION =====
  // This animation makes the logo appear smoothly when the page loads
  '@keyframes fadeIn': {
    '0%': {                     // Start of animation (0% complete)
      opacity: 0,               // Completely transparent
      transform: 'translateY(-20px)'  // Moved up 20 pixels
    },
    '100%': {                   // End of animation (100% complete)
      opacity: 1,               // Fully visible
      transform: 'translateY(0)'      // Normal position
    }
  },
  
  // ===== FADE OUT ANIMATION =====
  // This animation makes the logo disappear when the form appears
  '@keyframes fadeOut': {
    '0%': {                     // Start of animation
      opacity: 1,               // Fully visible
      transform: 'translateY(0)'      // Normal position
    },
    '100%': {                   // End of animation
      opacity: 0,               // Completely transparent
      transform: 'translateY(-20px)'  // Moved up 20 pixels
    }
  }
}));

// ===== ANIMATED BOX STYLING =====
// AnimatedBox = contains the main heading text
const AnimatedBox = styled(Box, { shouldForwardProp: (prop) => prop !== '$showPrompt' })<{ $showPrompt?: boolean }>(({ theme, $showPrompt }) => ({
  color: 'white',               // Makes text white
  marginBottom: theme.spacing(3),  // Adds space below
  marginTop: '-2rem',           // Moves up slightly
  textAlign: 'center',          // Centers text
  animation: $showPrompt ? 'fadeOut 0.3s ease-out 0.3s forwards' : 'fadeIn 1.2s ease-out 0.2s both',  // Animation with delay
  position: 'relative',         // Allows positioning
  zIndex: 2,                    // Appears above other elements
  fontFamily: 'sans-serif',     // Sets font
  
  // ===== FADE IN ANIMATION =====
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,               // Start invisible
      transform: 'translateY(-20px)'  // Start moved up
    },
    '100%': {
      opacity: 1,               // End fully visible
      transform: 'translateY(0)'      // End in normal position
    }
  },
  
  // ===== FADE OUT ANIMATION =====
  '@keyframes fadeOut': {
    '0%': {
      opacity: 1,               // Start fully visible
      transform: 'translateY(0)'      // Start in normal position
    },
    '100%': {
      opacity: 0,               // End invisible
      transform: 'translateY(-20px)'  // End moved up
    }
  }
}));

// ===== BUTTON CONTAINER STYLING =====
// ButtonContainer = holds the main "Get Started" button
const ButtonContainer = styled(Box, { shouldForwardProp: (prop) => prop !== '$showPrompt' })<{ $showPrompt?: boolean }>(({ $showPrompt }) => ({
  display: 'flex',              // Uses flexbox layout
  flexDirection: 'column',      // Arranges children vertically
  gap: '1rem',                  // Space between children
  width: '100%',                // Full width
  maxWidth: '300px',            // Maximum width
  marginTop: '-0.5rem',         // Moves up slightly
  position: 'relative',         // Allows positioning
  zIndex: 2,                    // Appears above other elements
  fontFamily: 'sans-serif',     // Sets font
  animation: $showPrompt ? 'fadeOut 0.3s ease-out 0.3s forwards' : 'fadeIn 1.2s ease-out 0.4s both',  // Animation with longer delay
  
  // ===== FADE IN ANIMATION =====
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,               // Start invisible
      transform: 'translateY(20px)'   // Start moved down
    },
    '100%': {
      opacity: 1,               // End fully visible
      transform: 'translateY(0)'      // End in normal position
    }
  },
  
  // ===== FADE OUT ANIMATION =====
  '@keyframes fadeOut': {
    '0%': {
      opacity: 1,               // Start fully visible
      transform: 'translateY(0)'      // Start in normal position
    },
    '100%': {
      opacity: 0,               // End invisible
      transform: 'translateY(20px)'   // End moved down
    }
  }
}));

// ===== STYLED BUTTON =====
// StyledButton = the main "Get Started" button with custom styling
const StyledButton = styled(Button)(({ theme }) => ({
  width: '100%',                // Full width of container
  padding: theme.spacing(1.5),  // Adds space inside the button
  fontSize: '1.1rem',           // Sets text size
  animation: 'fadeIn 1.2s ease-out 0.4s both',  // Animation with delay
  fontFamily: 'sans-serif',     // Sets font
  display: 'flex',              // Uses flexbox layout
  alignItems: 'center',         // Centers content vertically
  gap: '0.5rem',                // Space between text and icon
  
  // ===== FADE IN ANIMATION =====
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,               // Start invisible
      transform: 'translateY(20px)'   // Start moved down
    },
    '100%': {
      opacity: 1,               // End fully visible
      transform: 'translateY(0)'      // End in normal position
    }
  }
}));

// ===== DOWN ARROW STYLING =====
// DownArrow = animated down arrow icon
const DownArrow = styled(ArrowDownwardIcon)({
  animation: 'bounce 2s infinite',  // Continuous bouncing animation
  
  // ===== BOUNCE ANIMATION =====
  '@keyframes bounce': {
    '0%, 20%, 50%, 80%, 100%': {    // Multiple keyframes for smooth bounce
      transform: 'translateY(0)',   // Normal position
    },
    '40%': {                        // Middle of bounce (40% through)
      transform: 'translateY(-10px)',  // Moves up 10 pixels
    },
    '60%': {                        // End of bounce (60% through)
      transform: 'translateY(-5px)',   // Moves up 5 pixels
    }
  }
});

// ===== FLOATING IMAGE STYLING =====
// FloatingImage = panel images that float around the background
const FloatingImage = styled('img', { shouldForwardProp: (prop) => prop !== '$showPrompt' })<{ $showPrompt?: boolean }>(({ $showPrompt }) => ({
  position: 'absolute',         // Positions absolutely (can be placed anywhere)
  width: $showPrompt ? '345px' : '230px',  // 15% bigger than original (300px -> 345px, 200px -> 230px)
  opacity: $showPrompt ? 0.3 : 1,          // Changes transparency based on form state
  filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))',  // Adds shadow effect
  animation: 'float 8s ease-in-out infinite',  // Continuous floating animation
  transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), top 0.3s cubic-bezier(0.4, 0, 0.2, 1), left 0.3s cubic-bezier(0.4, 0, 0.2, 1), right 0.3s cubic-bezier(0.4, 0, 0.2, 1), bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)',  // Smooth transitions
  zIndex: 1,                   // Foreground layer for regular/smaller images
  
  // ===== SHADOW EFFECT =====
  // Creates a shadow under the floating images
  '&::before': {
    content: '""',              // Creates a pseudo-element
    position: 'absolute',       // Positions absolutely
    bottom: '-30px',            // Places below the image
    left: '50%',                // Centers horizontally
    transform: 'translateX(-50%)',  // Centers perfectly
    width: '184px',             // Shadow width (15% bigger than 160px)
    height: '35px',             // Shadow height (15% bigger than 30px)
    background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 70%)',  // Gradient shadow
    borderRadius: '50%',        // Makes shadow circular
    animation: 'shadowFloat 8s ease-in-out infinite',  // Shadow animation
    zIndex: -1                  // Places shadow behind the image
  },
  
  // ===== FLOAT ANIMATION =====
  // Makes images gently float up and down
  '@keyframes float': {
    '0%': {
      transform: 'translateY(0px) rotate(0deg)',  // Start position
    },
    '50%': {
      transform: 'translateY(-15px) rotate(3deg)',  // Middle position (up and slightly rotated)
    },
    '100%': {
      transform: 'translateY(0px) rotate(0deg)',  // End position (back to start)
    }
  },
  
  // ===== SHADOW FLOAT ANIMATION =====
  // Makes shadow move with the floating image
  '@keyframes shadowFloat': {
    '0%': {
      transform: 'translateX(-50%) scale(1)',  // Start position
      opacity: 0.4,             // Start opacity
    },
    '50%': {
      transform: 'translateX(-50%) scale(0.8)',  // Middle position (smaller shadow)
      opacity: 0.2,             // Middle opacity (lighter)
    },
    '100%': {
      transform: 'translateX(-50%) scale(1)',  // End position
      opacity: 0.4,             // End opacity
    }
  }
}));

// ===== SMALLER FLOATING IMAGE STYLING =====
// SmallerFloatingImage = panel images that are 15% smaller than regular floating images
const SmallerFloatingImage = styled('img', { shouldForwardProp: (prop) => prop !== '$showPrompt' })<{ $showPrompt?: boolean }>(({ $showPrompt }) => ({
  position: 'absolute',         // Positions absolutely (can be placed anywhere)
  width: $showPrompt ? '293px' : '196px',  // 15% bigger than current (255px -> 293px, 170px -> 196px)
  opacity: $showPrompt ? 0.3 : 1,          // Changes transparency based on form state
  filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))',  // Adds shadow effect
  animation: 'float 8s ease-in-out infinite',  // Continuous floating animation
  transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), top 0.3s cubic-bezier(0.4, 0, 0.2, 1), left 0.3s cubic-bezier(0.4, 0, 0.2, 1), right 0.3s cubic-bezier(0.4, 0, 0.2, 1), bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)',  // Smooth transitions
  zIndex: 1,                   // Foreground layer for small images
  
  // ===== SHADOW EFFECT =====
  // Creates a shadow under the floating images
  '&::before': {
    content: '""',              // Creates a pseudo-element
    position: 'absolute',       // Positions absolutely
    bottom: '-30px',            // Places below the image
    left: '50%',                // Centers horizontally
    transform: 'translateX(-50%)',  // Centers perfectly
    width: '156px',             // Shadow width (15% bigger than 136px)
    height: '30px',             // Shadow height (15% bigger than 26px)
    background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 70%)',  // Gradient shadow
    borderRadius: '50%',        // Makes shadow circular
    animation: 'shadowFloat 8s ease-in-out infinite',  // Shadow animation
    zIndex: -1                  // Places shadow behind the image
  },
  
  // ===== FLOAT ANIMATION =====
  // Makes images gently float up and down
  '@keyframes float': {
    '0%': {
      transform: 'translateY(0px) rotate(0deg)',  // Start position
    },
    '50%': {
      transform: 'translateY(-15px) rotate(3deg)',  // Middle position (up and slightly rotated)
    },
    '100%': {
      transform: 'translateY(0px) rotate(0deg)',  // End position (back to start)
    }
  },
  
  // ===== SHADOW FLOAT ANIMATION =====
  // Makes shadow move with the floating image
  '@keyframes shadowFloat': {
    '0%': {
      transform: 'translateX(-50%) scale(1)',  // Start position
      opacity: 0.4,             // Start opacity
    },
    '50%': {
      transform: 'translateX(-50%) scale(0.8)',  // Middle position (smaller shadow)
      opacity: 0.2,             // Middle opacity (lighter)
    },
    '100%': {
      transform: 'translateX(-50%) scale(1)',  // End position
      opacity: 0.4,             // End opacity
    }
  }
}));

// ===== LARGER FLOATING IMAGE STYLING =====
// LargerFloatingImage = panel images that are 15% bigger than regular floating images
const LargerFloatingImage = styled('img', { shouldForwardProp: (prop) => prop !== '$showPrompt' })<{ $showPrompt?: boolean }>(({ $showPrompt }) => ({
  position: 'absolute',         // Positions absolutely (can be placed anywhere)
  width: $showPrompt ? '635px' : '423px',  // 15% bigger than current (552px -> 635px, 368px -> 423px)
  opacity: $showPrompt ? 0.3 : 1,          // Changes transparency based on form state
  filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))',  // Adds shadow effect
  animation: 'float 8s ease-in-out infinite',  // Continuous floating animation
  transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), top 0.3s cubic-bezier(0.4, 0, 0.2, 1), left 0.3s cubic-bezier(0.4, 0, 0.2, 1), right 0.3s cubic-bezier(0.4, 0, 0.2, 1), bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)',  // Smooth transitions
  zIndex: 0,                   // Background layer for larger images
  
  // ===== SHADOW EFFECT =====
  // Creates a shadow under the floating images
  '&::before': {
    content: '""',              // Creates a pseudo-element
    position: 'absolute',       // Positions absolutely
    bottom: '-30px',            // Places below the image
    left: '50%',                // Centers horizontally
    transform: 'translateX(-50%)',  // Centers perfectly
    width: '212px',             // Shadow width (15% bigger than 184px)
    height: '40px',             // Shadow height (15% bigger than 35px)
    background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 70%)',  // Gradient shadow
    borderRadius: '50%',        // Makes shadow circular
    animation: 'shadowFloat 8s ease-in-out infinite',  // Shadow animation
    zIndex: -1                  // Places shadow behind the image
  },
  
  // ===== FLOAT ANIMATION =====
  // Makes images gently float up and down
  '@keyframes float': {
    '0%': {
      transform: 'translateY(0px) rotate(0deg)',  // Start position
    },
    '50%': {
      transform: 'translateY(-15px) rotate(3deg)',  // Middle position (up and slightly rotated)
    },
    '100%': {
      transform: 'translateY(0px) rotate(0deg)',  // End position (back to start)
    }
  },
  
  // ===== SHADOW FLOAT ANIMATION =====
  // Makes shadow move with the floating image
  '@keyframes shadowFloat': {
    '0%': {
      transform: 'translateX(-50%) scale(1)',  // Start position
      opacity: 0.4,             // Start opacity
    },
    '50%': {
      transform: 'translateX(-50%) scale(0.8)',  // Middle position (smaller shadow)
      opacity: 0.2,             // Middle opacity (lighter)
    },
    '100%': {
      transform: 'translateX(-50%) scale(1)',  // End position
      opacity: 0.4,             // End opacity
    }
  }
}));

// ===== EXTENDED FLOATING IMAGE STYLING =====
// ExtendedFloatingImage = GS_Extended image that is 10% bigger than LargerFloatingImage
const ExtendedFloatingImage = styled('img', { shouldForwardProp: (prop) => prop !== '$showPrompt' })<{ $showPrompt?: boolean }>(({ $showPrompt }) => ({
  position: 'absolute',         // Positions absolutely (can be placed anywhere)
  width: $showPrompt ? '734px' : '488px',  // Another 5% bigger (699px -> 734px, 465px -> 488px)
  opacity: $showPrompt ? 0.3 : 1,          // Changes transparency based on form state
  filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))',  // Adds shadow effect
  animation: 'float 8s ease-in-out infinite',  // Continuous floating animation
  transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), top 0.3s cubic-bezier(0.4, 0, 0.2, 1), left 0.3s cubic-bezier(0.4, 0, 0.2, 1), right 0.3s cubic-bezier(0.4, 0, 0.2, 1), bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)',  // Smooth transitions
  zIndex: 0,                   // Background layer for extended image
  
  // ===== SHADOW EFFECT =====
  // Creates a shadow under the floating images
  '&::before': {
    content: '""',              // Creates a pseudo-element
    position: 'absolute',       // Positions absolutely
    bottom: '-30px',            // Places below the image
    left: '50%',                // Centers horizontally
    transform: 'translateX(-50%)',  // Centers perfectly
    width: '245px',             // Shadow width (5% bigger than 233px)
    height: '46px',             // Shadow height (5% bigger than 44px)
    background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 70%)',  // Gradient shadow
    borderRadius: '50%',        // Makes shadow circular
    animation: 'shadowFloat 8s ease-in-out infinite',  // Shadow animation
    zIndex: -1                  // Places shadow behind the image
  },
  
  // ===== FLOAT ANIMATION =====
  // Makes images gently float up and down
  '@keyframes float': {
    '0%': {
      transform: 'translateY(0px) rotate(0deg)',  // Start position
    },
    '50%': {
      transform: 'translateY(-15px) rotate(3deg)',  // Middle position (up and slightly rotated)
    },
    '100%': {
      transform: 'translateY(0px) rotate(0deg)',  // End position (back to start)
    }
  },
  
  // ===== SHADOW FLOAT ANIMATION =====
  // Makes shadow move with the floating image
  '@keyframes shadowFloat': {
    '0%': {
      transform: 'translateX(-50%) scale(1)',  // Start position
      opacity: 0.4,             // Start opacity
    },
    '50%': {
      transform: 'translateX(-50%) scale(0.8)',  // Middle position (smaller shadow)
      opacity: 0.2,             // Middle opacity (lighter)
    },
    '100%': {
      transform: 'translateX(-50%) scale(1)',  // End position
      opacity: 0.4,             // End opacity
    }
  }
}));

// ===== FORM STYLING COMPONENTS =====
// These components style the project details form that appears when user clicks "Get Started"

// ===== PROJECT PROMPT CONTAINER =====
// ProjectPrompt = the main container for the form
const ProjectPrompt = styled(Paper, { shouldForwardProp: (prop) => prop !== '$showPrompt' })<{ $showPrompt?: boolean }>(({ theme, $showPrompt }) => ({
  position: 'relative',         // Allows positioning
  zIndex: 3,                    // Appears above everything else
  padding: theme.spacing(4),    // Adds space inside the form
  maxWidth: '600px',            // Maximum width
  width: '100%',                // Full width
  background: 'rgba(255, 255, 255, 0.95)',  // Semi-transparent white background
  backdropFilter: 'blur(10px)', // Blurs the background behind the form
  border: '1px solid rgba(255, 255, 255, 0.2)',  // Subtle border
  borderRadius: '16px',         // Rounded corners
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',  // Soft shadow
  animation: $showPrompt ? 'slideIn 0.5s ease-out' : 'slideOut 0.3s ease-in forwards',  // Slide animation
  
  // ===== SLIDE IN ANIMATION =====
  '@keyframes slideIn': {
    '0%': {
      opacity: 0,               // Start invisible
      transform: 'translateY(30px) scale(0.95)',  // Start moved down and smaller
    },
    '100%': {
      opacity: 1,               // End fully visible
      transform: 'translateY(0) scale(1)',        // End in normal position and size
    }
  },
  
  // ===== SLIDE OUT ANIMATION =====
  '@keyframes slideOut': {
    '0%': {
      opacity: 1,               // Start fully visible
      transform: 'translateY(0) scale(1)',        // Start in normal position
    },
    '100%': {
      opacity: 0,               // End invisible
      transform: 'translateY(30px) scale(0.95)',  // End moved down and smaller
    }
  }
}));

// ===== FORM TITLE =====
// FormTitle = the "Project Details" heading
const FormTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.8rem',           // Large text size
  fontWeight: 600,              // Bold text
  color: '#2c3e50',             // Dark blue color
  marginBottom: theme.spacing(3),  // Space below the title
  textAlign: 'center',          // Centers the text
  fontFamily: 'sans-serif'      // Sets font
}));

// ===== PROMPT FORM =====
// PromptForm = contains all the form fields
const PromptForm = styled(Box)({
  display: 'flex',              // Uses flexbox layout
  flexDirection: 'column',      // Arranges children vertically
  gap: '1.5rem'                 // Space between form fields
});

// ===== FORM ROW =====
// FormRow = groups form fields horizontally (side by side)
const FormRow = styled(Box)({
  display: 'flex',              // Uses flexbox layout
  gap: '1rem',                  // Space between fields in the row
  flexWrap: 'wrap'              // Allows fields to wrap to next line on small screens
});

// ===== STYLED TEXT FIELD =====
// StyledTextField = custom-styled input fields
const StyledTextField = styled(TextField)(({ theme }) => ({
  flex: 1,                      // Takes available space
  minWidth: '250px',            // Minimum width
  '& .MuiOutlinedInput-root': {  // Styles the input border
    '& fieldset': {
      borderColor: 'rgba(44, 62, 80, 0.3)',  // Border color
    },
    '&:hover fieldset': {
      borderColor: 'rgba(44, 62, 80, 0.5)',  // Border color on hover
    },
    '&.Mui-focused fieldset': {
      borderColor: '#3498db',   // Border color when focused
    },
  },
  '& .MuiInputLabel-root': {    // Styles the label
    color: '#2c3e50',           // Label color
    '&.Mui-focused': {
      color: '#3498db',         // Label color when focused
    },
  },
  '& .MuiInputBase-input': {    // Styles the input text
    color: '#2c3e50',           // Text color
    fontFamily: 'sans-serif'    // Font
  }
}));

// ===== HELP TEXT =====
// HelpText = clickable text that shows help information
const HelpText = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',           // Small text size
  color: '#3498db',             // Blue color
  cursor: 'pointer',            // Shows hand cursor on hover
  textDecoration: 'underline',  // Underlined text
  textAlign: 'center',          // Centers text
  marginTop: '0.5rem',          // Space above
  '&:hover': {
    color: '#2980b9',           // Darker blue on hover
  }
}));

// ===== ERROR MESSAGE =====
// ErrorMessage = displays error messages
const ErrorMessage = styled(Typography)(({ theme }) => ({
  color: '#e74c3c',             // Red color for errors
  fontSize: '0.9rem',           // Small text size
  textAlign: 'center',          // Centers text
  marginTop: '0.5rem',          // Space above
  fontFamily: 'sans-serif'      // Sets font
}));

// ===== SUBMIT BUTTON =====
// SubmitButton = the button that submits the form
const SubmitButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),  // Space above the button
  padding: theme.spacing(1.5),  // Space inside the button
  fontSize: '1.1rem',           // Text size
  fontWeight: 600,              // Bold text
  fontFamily: 'sans-serif',     // Sets font
  background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',  // Gradient background
  '&:hover': {
    background: 'linear-gradient(135deg, #2980b9 0%, #1f5f8b 100%)',  // Darker gradient on hover
  }
}));

// ===== MAIN HOME COMPONENT =====
// This is the main function that creates the Home page
const Home = () => {
  // ===== HOOKS AND CONTEXT =====
  // These are like "tools" that give your component special abilities
  
  // Navigation tool - allows moving between pages
  const navigate = useNavigate();
  
  // Gets functions from ProjectContext (shared storage)
  // These functions can update project data that other components can see
  const { setProjectName, setProjectCode, setLocation, setOperator } = useContext(ProjectContext);
  
  // ===== STATE MANAGEMENT =====
  // These are like "memory boxes" that store data that can change
  
  // Controls the current step in the flow
  // 'welcome' = initial screen, 'email' = email input, 'options' = view designs/start designing, 'project' = project details
  const [currentStep, setCurrentStep] = useState<'welcome' | 'email' | 'options' | 'project'>('welcome');
  
  // Controls whether to show success page after form submission
  // false = show form, true = show success page
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Controls whether the sales manager help is showing
  // false = show project code field, true = show sales manager field
  const [showSalesManager, setShowSalesManager] = useState(false);
  
  // Controls whether to show error message
  // false = no error, true = show error message
  const [showError, setShowError] = useState(false);
  const [errorText, setErrorText] = useState('');
  
  
  
  // Stores all the form data (project details)
  // This is an object that holds multiple pieces of information
  const [projectDetails, setProjectDetails] = useState({
    projectName: '',        // Name of the project
    location: '',           // Location of the project
    projectCode: '',        // Code/ID of the project
    salesManager: '',       // Sales manager name
    operator: '',           // Operator name
    servicePartner: '',     // Service partner name
    email: ''              // Email address
  });

  const isAdmin = isAdminEmail(typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null);

  // ===== EVENT HANDLERS =====
  // These are functions that run when users interact with the page
  

  
  // ===== HANDLE CLICK =====
  // Runs when user clicks the "Get Started" button
  const handleClick = () => {
    setCurrentStep('email');  // Shows the email input step
  };

  // ===== HANDLE CHANGE =====
  // Runs when user types in any form field
  // field = which field is being changed (e.g., 'projectName', 'location')
  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    // Updates the projectDetails object with the new value
    setProjectDetails(prev => ({
      ...prev,              // Keeps all existing values
      [field]: e.target.value  // Updates only the specific field
    }));
    
    // Clears error message when user starts typing in operator or service partner fields
    if (field === 'operator' || field === 'servicePartner') {
      setShowError(false);
    }
  };

  // ===== HANDLE EMAIL SUBMIT =====
  // Runs when user submits their email
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectDetails.email) {
      setShowError(true);
      setErrorText('Please enter a valid email address.');
      return;
    }
    
    const normalizedEmail = projectDetails.email.trim().toLowerCase();

    // Verify email exists in database (case-insensitive); if not, create a minimal user row
    const { data: userRow } = await supabase
      .from('users')
      .select('email')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (!userRow) {
      // Auto-create user with nullable ug_id
      const { error: insertErr } = await supabase
        .from('users')
        .insert([{ email: normalizedEmail }]);
      if (insertErr) {
        setShowError(true);
        setErrorText('Email not found. Please contact your administrator.');
        return;
      }
    }

    // Save normalized email and continue
    localStorage.setItem('userEmail', normalizedEmail);
    navigate('/properties');
  };

  // ===== HANDLE START DESIGNING =====
  // Runs when user clicks "Start Designing"
  const handleStartDesigning = () => {
    setCurrentStep('project');
  };

  // ===== HANDLE VIEW DESIGNS =====
  // Runs when user clicks "View My Designs"
  const handleViewDesigns = () => {
    navigate('/my-designs');
  };

  // ===== HANDLE PROJECT SUBMIT =====
  // Runs when user submits the project details form
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Checks if user provided either operator or service partner
    if (!projectDetails.operator && !projectDetails.servicePartner) {
      setShowError(true);
      return;
    }
    
    try {
      const result = await mockSendEmail(projectDetails);
      
      if (result.success) {
        console.log('Backend function called successfully:', result.message);
        
        // Saves project details to shared storage (ProjectContext)
        setProjectName(projectDetails.projectName);
        setProjectCode(projectDetails.projectCode);
        setLocation(projectDetails.location);
        setOperator(projectDetails.operator);
        
        // Navigate to BOQ page for quantity distribution
        navigate('/user-boq');
      } else {
        console.error('Backend function failed:', result.error);
      }
    } catch (error) {
      console.error('Error calling backend function:', error);
      
      // Still navigate to BOQ even if email fails
      setProjectName(projectDetails.projectName);
      setProjectCode(projectDetails.projectCode);
      setLocation(projectDetails.location);
      setOperator(projectDetails.operator);
      navigate('/user-boq');
    }
  };

  // ===== HANDLE HELP CLICK =====
  // Runs when user clicks the help text
  const handleHelpClick = () => {
    setShowSalesManager(!showSalesManager);  // Toggles between project code and sales manager fields
  };

  // ===== HANDLE GET STARTED =====
  // Runs when user clicks "Get Started" (alternative function)
  const handleGetStarted = () => {
    setCurrentStep('email');  // Shows the email step
    
    // Hides the form after 800 milliseconds (0.8 seconds)
    setTimeout(() => {
      setCurrentStep('welcome');
    }, 800);
  };

  // ===== JSX RENDER =====
  // This is what actually gets displayed on the screen
  // JSX is like HTML but with JavaScript power
  return (
    // ===== MAIN CONTAINER =====
    <HomeContainer>
      {/* ===== FLOATING PANEL IMAGES ===== */}
      {/* These are the panel images that float around the background */}
      {/* Each image has different positioning and animation delays */}
      
      {/* TAG PIR Panel - top left */}
      <SmallerFloatingImage 
        src={tagPir}           // Image source
        alt="TAG PIR"          // Alternative text for accessibility
        $showPrompt={currentStep !== 'welcome'}  // Controls size and opacity based on form state
        style={{ 
          top: currentStep !== 'welcome' ? '5%' : '15%',   // Position from top (changes when form shows)
          left: currentStep !== 'welcome' ? 'calc(20% - 10px)' : 'calc(5% - 10px)',  // Position from left
          animationDelay: '0s'  // No delay for this animation
        }} 
      />
      
      {/* IDPG RN Panel - bottom right */}
      <SmallerFloatingImage 
        src={idpgRn} 
        alt="IDPG RN" 
        $showPrompt={currentStep !== 'welcome'}
        style={{ 
          bottom: currentStep !== 'welcome' ? '0%' : '15%',   // Position from bottom
          right: currentStep !== 'welcome' ? 'calc(20% - 10px)' : 'calc(5% - 10px)',  // Position from right
          animationDelay: '2s'  // 2 second delay for staggered animation
        }} 
      />
      
      {/* IDPG Panel - center right (smaller) */}
      <SmallerFloatingImage 
        src={idpg} 
        alt="IDPG" 
        $showPrompt={currentStep !== 'welcome'}
        style={{ 
          bottom: currentStep !== 'welcome' ? '40%' : '40%', 
          right: currentStep !== 'welcome' ? 'calc(15% + 40px)' : 'calc(15% + 40px)', 
          animationDelay: '2.5s'  // 2.5 second delay
        }} 
      />
      
      {/* SP Panel - center left (smaller) */}
      <SmallerFloatingImage 
        src={sp} 
        alt="SP" 
        $showPrompt={currentStep !== 'welcome'}
        style={{ 
          top: currentStep !== 'welcome' ? '35%' : '40%', 
          left: currentStep !== 'welcome' ? 'calc(15% - 20px)' : 'calc(15% - 20px)', 
          animationDelay: '1.5s'  // 1.5 second delay
        }} 
      />
      
      {/* X2RS Panel - bottom left (largest) */}
      <ExtendedFloatingImage 
        src={x2rs} 
        alt="X2RS" 
        $showPrompt={currentStep !== 'welcome'}
        style={{ 
          bottom: currentStep !== 'welcome' ? '6%' : '20%', 
          left: currentStep !== 'welcome' ? 'calc(8% - 10px)' : 'calc(4% - 10px)', 
          animationDelay: '3s'  // 3 second delay
        }} 
      />
      
      {/* DP RT Panel - top right (medium) */}
      <LargerFloatingImage 
        src={dpRt} 
        alt="DP RT" 
        $showPrompt={currentStep !== 'welcome'}
        style={{ 
          top: currentStep !== 'welcome' ? '4%' : '20%', 
          right: currentStep !== 'welcome' ? 'calc(15% - 10px)' : 'calc(10% - 10px)', 
          animationDelay: '1s'  // 1 second delay
        }} 
      />
      
      {/* ===== MAIN CONTENT AREA ===== */}
      <ContentWrapper>
        {/* ===== CONDITIONAL RENDERING ===== */}
        {/* Shows different content based on whether the form is showing */}
        
        {currentStep === 'welcome' && !showSuccess ? (
          // ===== WELCOME SCREEN =====
          // This shows when the form is NOT showing (initial state)
          <>
            {/* ===== LOGO ===== */}
            <Logo 
              src={logo} 
              alt="Interel Logo" 
              $showPrompt={false} 
              onClick={() => navigate('/')}  // Clicking logo goes to home
              style={{ cursor: 'pointer' }}  // Shows hand cursor on hover
            />
            

            
            {/* ===== MAIN HEADING ===== */}
            <AnimatedBox $showPrompt={false}>
              <Typography 
                variant="h3"  // Large heading style
                sx={{ 
                  fontWeight: 400,           // Normal font weight
                  fontFamily: 'sans-serif',  // Font family
                  letterSpacing: '-0.04em',  // Tighter letter spacing
                  fontSize: '2.5rem',        // Large text size
                  lineHeight: 1.05,          // Line height
                  marginBottom: 0            // No margin below
                }}
              >
                Design Your Panels
              </Typography>
            </AnimatedBox>
            
            {/* ===== GET STARTED BUTTON ===== */}
            <ButtonContainer $showPrompt={false}>
              <StyledButton
                variant="contained"  // Filled button style
                color="primary"      // Primary color
                onClick={handleClick}  // Runs handleClick when clicked
                sx={{
                  fontFamily: 'sans-serif',  // Font
                  letterSpacing: '-0.02em',  // Letter spacing
                  fontWeight: 600,           // Bold text
                  fontSize: '1.4rem',        // Large text size
                  padding: '0.6rem 0'        // Vertical padding
                }}
              >
                Get Started
                {/* ===== ROCKET ICON ===== */}
                <RocketLaunchIcon sx={{ 
                  fontSize: '1.4rem',  // Icon size
                  ml: 1                // Margin left
                }} />
              </StyledButton>
              
              

            </ButtonContainer>
          </>
        ) : currentStep === 'email' ? (
          // ===== EMAIL INPUT STEP =====
          <ProjectPrompt $showPrompt={true}>
            <FormTitle>
              Enter Your Email
            </FormTitle>
            
            <form onSubmit={handleEmailSubmit}>
              <PromptForm>
                <StyledTextField
                  label="Email"
                  variant="outlined"
                  type="email"
                  value={projectDetails.email}
                  onChange={handleChange('email')}
                  placeholder="Enter your email address"
                  required
                  fullWidth
                />
                
                {showError && (
                  <ErrorMessage>
                    {errorText || 'Please enter a valid email address.'}
                  </ErrorMessage>
                )}
                
                <SubmitButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Continue
                </SubmitButton>
              </PromptForm>
            </form>
          </ProjectPrompt>
        ) : currentStep === 'options' ? (
          // ===== OPTIONS STEP =====
          <ProjectPrompt $showPrompt={true}>
            <FormTitle>
              Welcome Back!
            </FormTitle>
            
            <Typography 
              variant="body1" 
              sx={{ 
                textAlign: 'center', 
                mb: 3, 
                color: '#2c3e50',
                fontSize: '1.1rem'
              }}
            >
              What would you like to do today?
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleStartDesigning}
                sx={{
                  fontFamily: 'sans-serif',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  padding: '0.8rem 0',
                  background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2980b9 0%, #1f5f8b 100%)',
                  }
                }}
              >
                🎨 Start Designing
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleViewDesigns}
                sx={{
                  fontFamily: 'sans-serif',
                  fontWeight: 500,
                  fontSize: '1rem',
                  padding: '0.6rem 0',
                  color: '#2c3e50',
                  borderColor: '#3498db',
                  '&:hover': {
                    borderColor: '#2980b9',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)'
                  }
                }}
              >
                📚 View My Designs
              </Button>
              {isAdmin && (
                <Button
                  variant="outlined"
                  onClick={() => navigate('/properties')}
                  sx={{
                    fontFamily: 'sans-serif',
                    fontWeight: 500,
                    fontSize: '1rem',
                    padding: '0.6rem 0',
                    color: '#2c3e50',
                    borderColor: '#8e44ad',
                    '&:hover': {
                      borderColor: '#6c3483',
                      backgroundColor: 'rgba(142, 68, 173, 0.08)'
                    }
                  }}
                >
                  🔐 Admin Dashboard
                </Button>
              )}
              
              <Button
                variant="text"
                onClick={() => setCurrentStep('welcome')}
                sx={{
                  fontFamily: 'sans-serif',
                  fontWeight: 400,
                  fontSize: '0.9rem',
                  padding: '0.4rem 0',
                  color: '#7f8c8d',
                  '&:hover': {
                    backgroundColor: 'rgba(127, 140, 141, 0.1)'
                  }
                }}
              >
                ← Back to Home
              </Button>
            </Box>
          </ProjectPrompt>
        ) : showSuccess ? (
          // ===== SUCCESS PAGE =====
          // This shows after the form is successfully submitted
          <ProjectPrompt $showPrompt={true}>
            {/* ===== SUCCESS TITLE ===== */}
            <FormTitle>
              🎉 Project Submitted Successfully!
            </FormTitle>
            
            {/* ===== SUCCESS MESSAGE ===== */}
            <Typography 
              variant="body1" 
              sx={{ 
                textAlign: 'center', 
                mb: 3, 
                color: '#2c3e50',
                fontSize: '1.1rem'
              }}
            >
              Your project "{projectDetails.projectName}" has been saved. 
              What would you like to do next?
            </Typography>
            
            {/* ===== ACTION BUTTONS ===== */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Start Designing Button */}
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/panel-type')}
                sx={{
                  fontFamily: 'sans-serif',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  padding: '0.8rem 0',
                  background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2980b9 0%, #1f5f8b 100%)',
                  }
                }}
              >
                🎨 Start Designing
              </Button>
              
              {/* My Designs Button */}
              <Button
                variant="outlined"
                onClick={() => navigate('/my-designs')}
                sx={{
                  fontFamily: 'sans-serif',
                  fontWeight: 500,
                  fontSize: '1rem',
                  padding: '0.6rem 0',
                  color: '#2c3e50',
                  borderColor: '#3498db',
                  '&:hover': {
                    borderColor: '#2980b9',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)'
                  }
                }}
              >
                📚 View My Designs
              </Button>
              
              {/* Back to Home Button */}
              <Button
                variant="text"
                onClick={() => {
                  setShowSuccess(false);
                  setCurrentStep('welcome');
                }}
                sx={{
                  fontFamily: 'sans-serif',
                  fontWeight: 400,
                  fontSize: '0.9rem',
                  padding: '0.4rem 0',
                  color: '#7f8c8d',
                  '&:hover': {
                    backgroundColor: 'rgba(127, 140, 141, 0.1)'
                  }
                }}
              >
                ← Back to Home
              </Button>
            </Box>
          </ProjectPrompt>
        ) : currentStep === 'project' ? (
          // ===== PROJECT FORM =====
          // This shows when the project details form is showing
          <ProjectPrompt $showPrompt={true}>
            {/* ===== FORM TITLE ===== */}
            <FormTitle>
              Project Details
            </FormTitle>
            
            {/* ===== FORM ELEMENT ===== */}
            <form onSubmit={handleProjectSubmit}>
              <PromptForm>
                {/* ===== FIRST ROW - PROJECT NAME AND LOCATION ===== */}
                <FormRow>
                  {/* Project Name Field */}
                  <StyledTextField
                    label="Project Name"           // Field label
                    variant="outlined"             // Outlined style
                    value={projectDetails.projectName}  // Current value
                    onChange={handleChange('projectName')}  // Runs when user types
                    required                        // Required field
                  />
                  
                  {/* Location Field */}
                  <StyledTextField
                    label="Location"               // Field label
                    variant="outlined"             // Outlined style
                    value={projectDetails.location}  // Current value
                    onChange={handleChange('location')}  // Runs when user types
                    required                        // Required field
                  />
                </FormRow>
                
                {/* ===== SECOND ROW - PROJECT CODE OR SALES MANAGER ===== */}
                <FormRow>
                  {!showSalesManager ? (
                    // ===== PROJECT CODE FIELD =====
                    // Shows when sales manager help is NOT showing
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {/* Project Code Field */}
                      <StyledTextField
                        label="Project Code"           // Field label
                        variant="outlined"             // Outlined style
                        value={projectDetails.projectCode}  // Current value
                        onChange={handleChange('projectCode')}  // Runs when user types
                        required                        // Required field
                      />
                      
                      {/* Help Text */}
                      <HelpText onClick={handleHelpClick}>
                        Don't know the project code?
                      </HelpText>
                    </Box>
                  ) : (
                    // ===== SALES MANAGER FIELD =====
                    // Shows when sales manager help IS showing
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {/* Sales Manager Field */}
                      <StyledTextField
                        label="INTEREL Sales Manager"  // Field label
                        variant="outlined"             // Outlined style
                        value={projectDetails.salesManager}  // Current value
                        onChange={handleChange('salesManager')}  // Runs when user types
                        required                        // Required field
                      />
                      
                      {/* Help Text */}
                      <HelpText onClick={handleHelpClick}>
                        I have the project code
                      </HelpText>
                    </Box>
                  )}
                </FormRow>
                
                {/* ===== THIRD ROW - OPERATOR AND SERVICE PARTNER ===== */}
                <FormRow>
                  {/* Operator Field */}
                  <StyledTextField
                    label="Operator"               // Field label
                    variant="outlined"             // Outlined style
                    value={projectDetails.operator}  // Current value
                    onChange={handleChange('operator')}  // Runs when user types
                    placeholder="Enter operator name"  // Placeholder text
                  />
                  
                  {/* Service Partner Field */}
                  <StyledTextField
                    label="Service Partner"        // Field label
                    variant="outlined"             // Outlined style
                    value={projectDetails.servicePartner}  // Current value
                    onChange={handleChange('servicePartner')}  // Runs when user types
                    placeholder="Enter service partner name"  // Placeholder text
                  />
                </FormRow>
                
                {/* ===== ERROR MESSAGE ===== */}
                {/* Shows error message if user doesn't provide operator or service partner */}
                {showError && (
                  <ErrorMessage>
                    Please provide either an Operator or Service Partner.
                  </ErrorMessage>
                )}
                
                {/* ===== SUBMIT BUTTON ===== */}
                <SubmitButton
                  type="submit"                    // Form submit button
                  variant="contained"              // Filled button style
                  color="primary"                  // Primary color
                  fullWidth                        // Full width
                >
                  Continue
                </SubmitButton>
              </PromptForm>
            </form>
          </ProjectPrompt>
        ) : null}
      </ContentWrapper>
      
      
    </HomeContainer>
  );
};

// ===== EXPORT =====
// Makes this component available to be used in other files
export default Home; 
