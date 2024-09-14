'use client'
import { useAuth } from '@clerk/nextjs'
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithCustomToken } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { doc, getDoc } from 'firebase/firestore'

// Add your Firebase config object
const firebaseConfig = {
    apiKey: 'AIzaSyBwiJValFHHTsriKzLga7eSRqia9txkh8Q',
    authDomain: 'pyop-a8a53.firebaseapp.com',
    databaseURL: 'https://pyop-a8a53-default-rtdb.firebaseio.com',
    projectId: 'pyop-a8a53',
    storageBucket: 'pyop-a8a53.appspot.com',
    messagingSenderId: '889153832260',
    appId: '1:889153832260:android:bca5a50125e1bd221d8311'
  };
  

// Connect to your Firebase app
const app = initializeApp(firebaseConfig)
// Connect to your Firestore database
const db = getFirestore(app)
// Connect to Firebase auth
const auth = getAuth(app)

// Remove this if you do not have Firestore set up
// for your Firebase app
const getFirestoreData = async () => {
  const docRef = doc(db, 'example', 'example-document')
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    console.log('Document data:', docSnap.data())
  } else {
    // docSnap.data() will be undefined in this case
    console.log('No such document!')
  }
}

export default function FirebaseUI() {
  const { getToken, userId } = useAuth()

  // Handle if the user is not signed in
  // You could display content, or redirect them to a sign-in page
  if (!userId) {
    return <p>You need to sign in with Clerk to access this page.</p>
  }

  const signIntoFirebaseWithClerk = async () => {
    const token = await getToken({ template: 'integration_firebase' })

    const userCredentials = await signInWithCustomToken(auth, token || '')
    // The userCredentials.user object can call the methods of
    // the Firebase platform as an authenticated user.
    console.log('User:', userCredentials.user)
  }

  return (
    <main style={{ display: 'flex', flexDirection: 'column', rowGap: '1rem' }}>
      <button onClick={signIntoFirebaseWithClerk}>Sign in</button>

      {/* Remove this button if you do not have Firestore set up */}
      <button onClick={getFirestoreData}>Get document</button>
    </main>
  )
}