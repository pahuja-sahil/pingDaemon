import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button';

interface GoogleSignInButtonProps {
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
  disabled?: boolean;
  fullWidth?: boolean;
}

const GoogleSignInButton = ({ 
  onSuccess, 
  onError, 
  disabled = false,
  fullWidth = false 
}: GoogleSignInButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);

  useEffect(() => {
    // Check if Google script is loaded
    const checkGoogleLoaded = () => {
      if (window.google) {
        setGoogleLoaded(true);
      } else {
        // Retry after a short delay
        setTimeout(checkGoogleLoaded, 100);
      }
    };
    
    checkGoogleLoaded();
  }, []);

  const handleGoogleSignIn = async () => {
    if (!googleLoaded || !window.google) {
      onError(new Error('Google Sign-In not loaded yet. Please try again.'));
      return;
    }

    setIsLoading(true);
    
    try {
      const google = window.google;
      
      // Initialize Google Sign-In
      google.accounts.id.initialize({
        client_id: "142358410476-s4mtpmgnffddllgvpkv32h687n3teg4o.apps.googleusercontent.com",
        callback: (response: any) => {
          setIsLoading(false);
          onSuccess(response);
        },
        auto_select: false,
        cancel_on_tap_outside: false, // Changed to false
      });

      // Use renderButton instead of prompt for better reliability
      const buttonContainer = document.createElement('div');
      buttonContainer.style.position = 'absolute';
      buttonContainer.style.top = '-9999px';
      document.body.appendChild(buttonContainer);

      google.accounts.id.renderButton(buttonContainer, {
        type: 'standard',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 250,
      });

      // Trigger the hidden button click
      const hiddenButton = buttonContainer.querySelector('div[role="button"]') as HTMLElement;
      if (hiddenButton) {
        hiddenButton.click();
      } else {
        // Fallback to prompt method
        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setIsLoading(false);
            onError(new Error('Google Sign-In was cancelled or not displayed'));
          }
        });
      }

      // Clean up the hidden button after a delay
      setTimeout(() => {
        if (buttonContainer && buttonContainer.parentNode) {
          buttonContainer.parentNode.removeChild(buttonContainer);
        }
      }, 1000);

    } catch (error) {
      setIsLoading(false);
      onError(error);
    }
  };

  return (
    <motion.div whileTap={{ scale: 0.95 }}>
      <Button
        variant="outline"
        fullWidth={fullWidth}
        size="lg"
        loading={isLoading}
        disabled={disabled || isLoading || !googleLoaded}
        onClick={handleGoogleSignIn}
        className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 relative shadow-sm"
      >
        {!isLoading && (
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </div>
        )}
      </Button>
    </motion.div>
  );
};

export default GoogleSignInButton;