import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zbtfewceyjgqdonmlqlj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_IjfavGoT4AT1yOug0qkptg_--hxQpmt';

const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function migrate() {
  console.log('Starting fixed migration...');

  // 1. Migrate settings
  console.log('Migrating settings...');
  const settingsRef = collection(firestore, 'settings');
  const settingsSnap = await getDocs(settingsRef);
  for (const doc of settingsSnap.docs) {
    const data = doc.data();
    await supabase.from('settings').upsert({
      id: doc.id,
      app_icon_url: data.appIconUrl || null
    });
  }

  // 2. Migrate units
  console.log('Migrating units...');
  const unitsRef = collection(firestore, 'units');
  const unitsSnap = await getDocs(unitsRef);
  
  for (const unitDoc of unitsSnap.docs) {
    const data = unitDoc.data();
    console.log(`Processing unit: ${unitDoc.id}`);
    
    const { error: unitError } = await supabase.from('units').upsert({
      id: unitDoc.id,
      name: data.name,
      password: data.password || null,
      card_image_url: data.cardImageUrl || null,
      card_color: data.cardColor || null,
      icon: data.icon || null,
      icon_url: data.iconUrl || null,
      scoring_criteria: data.scoringCriteria || [],
      ranks: data.ranks || []
    });

    if (unitError) {
      console.error(`Error migrating unit ${unitDoc.id}:`, unitError);
      continue;
    }

    // 3. Migrate members from the ARRAY field
    if (data.members && Array.isArray(data.members)) {
      console.log(`Migrating ${data.members.length} members for unit ${unitDoc.id}...`);
      for (const member of data.members) {
        const { error: memberError } = await supabase.from('members').upsert({
          id: member.id || `${unitDoc.id}-${member.name}`,
          unit_id: unitDoc.id,
          name: member.name,
          age: member.age || null,
          role: member.role || null,
          class_name: member.className || null,
          score: member.score || 0,
          ranking: member.ranking || null,
          avatar_url: member.avatarUrl || null,
          patent: member.patent || null,
          all_patents: member.allPatents || null
        });
        if (memberError) console.error(`Error migrating member ${member.name}:`, memberError);
      }
    }
    
    // 4. Migrate score history from the ARRAY field
    if (data.scoreHistory && Array.isArray(data.scoreHistory)) {
      console.log(`Migrating ${data.scoreHistory.length} score history entries for unit ${unitDoc.id}...`);
      for (const history of data.scoreHistory) {
         // Firestore timestamps to ISO string for PG
         const date = history.date && history.date.toDate ? history.date.toDate().toISOString() : new Date(history.date).toISOString();
         
         await supabase.from('score_logs').upsert({
           id: history.id || `${unitDoc.id}-${date}`,
           unit_id: unitDoc.id,
           date: date,
           member_scores: history.memberScores || {}
         });
      }
    }
  }

  console.log('Fixed migration completed successfully!');
}

migrate().catch(console.error);
