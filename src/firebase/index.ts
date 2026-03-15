'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  const isConfigValid = firebaseConfig.apiKey && firebaseConfig.projectId;

  if (!getApps().length) {
    let firebaseApp: FirebaseApp | null = null;
    try {
      // Attempt to initialize via Firebase App Hosting environment variables
      firebaseApp = initializeApp();
    } catch (e) {
      if (isConfigValid) {
        try {
          firebaseApp = initializeApp(firebaseConfig);
        } catch (initErr) {
          console.error("Failed to initialize Firebase with config", initErr);
        }
      } else {
        if (process.env.NODE_ENV === "production") {
          console.error("Firebase configuration is missing in production!");
        } else {
          console.warn("Firebase configuration is missing. Running in limited mode.");
        }
      }
    }

    return getSdks(firebaseApp);
  }

  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp | null) {
  const isConfigValid = firebaseConfig.apiKey && firebaseConfig.projectId;
  
  if (!firebaseApp || !isConfigValid) {
    return {
      firebaseApp: firebaseApp as any,
      auth: null as any,
      firestore: null as any
    };
  }
  
  try {
    return {
      firebaseApp,
      auth: getAuth(firebaseApp),
      firestore: getFirestore(firebaseApp)
    };
  } catch (err) {
    console.error("Error getting SDKs", err);
    return {
      firebaseApp: firebaseApp as any,
      auth: null as any,
      firestore: null as any
    };
  }
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
