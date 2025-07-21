// LogoutScreen.js
import { useEffect } from 'react';

export default function LogoutScreen({ route }) {
  useEffect(() => {
    if (route.params?.onLogout) {
      route.params.onLogout(); // call logout
    }
  }, []);

  return null; // nothing to render
}
