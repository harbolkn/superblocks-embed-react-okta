import React, { useEffect, useState } from "react";
import { useOktaAuth } from '@okta/okta-react';  
import { SuperblocksEmbed } from "@superblocksteam/embed-react";
import config from "./config";
import "./App.css";

const App = () => {
  const path = `${window.location.pathname}${window.location.search}`;
  const { authState, oktaAuth } = useOktaAuth();
  const [superblocksToken, setSuperblocksToken] = useState();

  // Okta Authentication to React App
  const login = async () => {
    await oktaAuth.signInWithRedirect();
  }

  const logout = async () => {
    await oktaAuth.signOut();
  }

  // Authenticate user to Superblocks
  const getSuperblocksToken = async (accessToken: any, idToken: any) => {
    const res = await fetch(config.resourceServer.tokenUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken.accessToken}`,
        'Content-Type': 'application/json',
        'X-ID-Token': idToken.idToken
      }
    });
    
    if (!res.ok) {
      throw new Error(`Superblocks auth error: ${res.status}`);
    }
    
    const data = await res.json();
    setSuperblocksToken(data?.access_token);
  };

  useEffect(() => {
    if (authState?.isAuthenticated && authState?.accessToken) {
      getSuperblocksToken(authState.accessToken, authState.idToken);
    }
  }, [authState]);

  // Handle Superblocks session expiration
  const handleAuthError = (err: any) => {
    // TODO: Only try to refresh if the auth error is due to session expiration
    if (authState?.isAuthenticated) {
      getSuperblocksToken(authState.accessToken, authState.idToken);
    }
  }

  // Handler to sync browser URL w/ Superblocks App paths
  function extractCustomRoute(url: string) {
    const regex = /https:\/\/app\.superblocks\.com\/embed\/applications\/([a-f0-9\-]+)(\/.*)/;
    const match = url.match(regex);
    return match && match[2] ? match[2] : '/';
  }

  const handleNavigation = (event: any) => {
    let route = extractCustomRoute(event.url);
    console.log(`User navigated to: ${route}`);
    window.history.pushState({ path: route }, '', route);
  }

  // Handle custom events emitted from Superblocks App
  const handleEvents = (event: string) => {
    switch (event) {
      case 'logout':
        // Log user out of Okta app when logout button is clicked
        logout();
        break;
      default:
        console.log(`Unknown event ${event}`);
    }
  }

  return (
    <div className="App">
      {
        authState?.isAuthenticated ? (
          <SuperblocksEmbed
            src={
              process.env.REACT_APP_SRC ??
              `https://app.superblocks.com/embed/applications/${config.superblocks.appId}${path}`
            }
            onNavigation={handleNavigation}
            onAuthError={handleAuthError}
            onEvent={handleEvents}
            token={superblocksToken}
          />
        ) : (
          <div>
            <h2>Please login</h2>
            <button onClick={login}>Login with Okta</button>
          </div>
        )
      }
    </div>
  );
};

export default App;
