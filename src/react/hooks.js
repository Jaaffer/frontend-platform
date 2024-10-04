/* eslint-disable import/prefer-default-export */
import { useEffect, useState } from 'react';
import { subscribe, unsubscribe } from '../pubSub';
import { sendTrackEvent } from '../analytics';
import { getConfig } from './config';

/**
 * A React hook that allows functional components to subscribe to application events.  This should
 * be used sparingly - for the most part, Context should be used higher-up in the application to
 * provide necessary data to a given component, rather than utilizing a non-React-like Pub/Sub
 * mechanism.
 *
 * @memberof module:React
 * @param {string} type
 * @param {function} callback
 */
export const useAppEvent = (type, callback) => {
  useEffect(() => {
    const subscriptionToken = subscribe(type, callback);

    return function cleanup() {
      unsubscribe(subscriptionToken);
    };
  }, [callback, type]);
};

/**
 * A React hook that tracks user's preferred color scheme (light or dark) and sends respective
 * event to the tracking service.
 *
 * @memberof module:React
 */
export const useTrackColorSchemeChoice = () => {
  useEffect(() => {
    const trackColorSchemeChoice = ({ matches }) => {
      const preferredColorScheme = matches ? 'dark' : 'light';
      sendTrackEvent('openedx.ui.frontend-platform.prefers-color-scheme.selected', { preferredColorScheme });
    };
    const colorSchemeQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (colorSchemeQuery) {
      // send user's initial choice
      trackColorSchemeChoice(colorSchemeQuery);
      colorSchemeQuery.addEventListener('change', trackColorSchemeChoice);
    }
    return () => {
      if (colorSchemeQuery) {
        colorSchemeQuery.removeEventListener('change', trackColorSchemeChoice);
      }
    };
  }, []);
};

export const useToFetchStyleSheet = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      setLoading(true);
      const link = document.createElement('link');
      link.setAttribute('rel','stylesheet')
      if(getConfig().VARIABLE_CSS_FILE) {
        link.setAttribute('href', getConfig().VARIABLE_CSS_FILE)
      }
      else {
        link.setAttribute('href','https://stg-xenops-openedx-saas-theme-css.s3.ap-southeast-2.amazonaws.com/saas_themes/static/css/default.css')
      }
      document.head.appendChild(link);
      setLoading(false);
    },[])
    return [loading];
}
