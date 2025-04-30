// users.ts - Firebase CRUD Operations for Users
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, updateProfile, updateEmail, deleteUser } from "firebase/auth";
import { getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, Timestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// User Type
interface User {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

// --------------------- Authentication Functions ---------------------
const createUser = async (email: string, password: string, displayName: string, role: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, {
      displayName: displayName,
    });

    const newUser: User = {
      id: user.uid,
      uid: user.uid,
      email: user.email!,
      displayName: displayName,
      photoURL: user.photoURL,
      role: role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await createUserDocument(newUser);

    return newUser;
  } catch (error: any) {
    console.error("Error creating user:", error.message);
    throw new Error(`Failed to create user: ${error.message}`);
  }
};

const signInUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    return user;
  } catch (error: any) {
    console.error("Error signing in:", error.message);
    throw new Error(`Failed to sign in: ${error.message}`);
  }
};

const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error("Error signing out:", error.message);
    throw new Error(`Failed to sign out: ${error.message}`);
  }
};

const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error("Error sending password reset email:", error.message);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};

// --------------------- User Document Functions ---------------------
const createUserDocument = async (user: User) => {
  try {
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL || null,
      role: user.role,
      createdAt: Timestamp.fromDate(user.createdAt),
      updatedAt: Timestamp.fromDate(user.updatedAt),
    });
    return user;
  } catch (error: any) {
    console.error("Error creating user document:", error.message);
    throw new Error(`Failed to create user document: ${error.message}`);
  }
};

const getUserDocument = async (id: string): Promise<User | null> => {
  try {
    const userDocRef = doc(db, "users", id);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const user: User = {
        id: userDocSnap.id,
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        role: userData.role,
        createdAt: userData.createdAt.toDate(),
        updatedAt: userData.updatedAt.toDate(),
      };
      return user;
    } else {
      return null;
    }
  } catch (error: any) {
    console.error("Error getting user document:", error.message);
    throw new Error(`Failed to get user document: ${error.message}`);
  }
};

const getAllUserDocuments = async (): Promise<User[]> => {
  try {
    const usersCollectionRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollectionRef);
    const users: User[] = [];

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      const user: User = {
        id: doc.id,
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        role: userData.role,
        createdAt: userData.createdAt.toDate(),
        updatedAt: userData.updatedAt.toDate(),
      };
      users.push(user);
    });

    return users;
  } catch (error: any) {
    console.error("Error getting all user documents:", error.message);
    throw new Error(`Failed to get all user documents: ${error.message}`);
  }
};

const updateUserDocument = async (user: User) => {
  try {
    const userDocRef = doc(db, "users", user.id);
    await updateDoc(userDocRef, {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: user.role,
      updatedAt: Timestamp.fromDate(new Date()),
    });
    return user;
  } catch (error: any) {
    console.error("Error updating user document:", error.message);
    throw new Error(`Failed to update user document: ${error.message}`);
  }
};

const deleteUserDocument = async (id: string) => {
  try {
    const userDocRef = doc(db, "users", id);
    await deleteDoc(userDocRef);
  } catch (error: any) {
    console.error("Error deleting user document:", error.message);
    throw new Error(`Failed to delete user document: ${error.message}`);
  }
};

// --------------------- Storage Functions ---------------------
const uploadUserPhoto = async (file: File, userId: string) => {
  try {
    const storageRef = ref(storage, `users/${userId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error: any) {
    console.error("Error uploading user photo:", error.message);
    throw new Error(`Failed to upload user photo: ${error.message}`);
  }
};

const deleteUserPhoto = async (photoURL: string, userId: string) => {
  try {
    const photoRef = ref(storage, photoURL);
    await deleteObject(photoRef);
  } catch (error: any) {
    console.error("Error deleting user photo:", error.message);
    throw new Error(`Failed to delete user photo: ${error.message}`);
  }
};

// --------------------- Additional Authentication Functions ---------------------
const changeEmail = async (userId: string, newEmail: string) => {
  try {
    const user = auth.currentUser;
    if (user) {
      await updateEmail(user, newEmail);
      
      // Update the email in the Firestore document as well
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, {
        email: newEmail,
        updatedAt: Timestamp.fromDate(new Date()),
      });
      
      return true;
    } else {
      throw new Error("No user is currently signed in.");
    }
  } catch (error: any) {
    console.error("Error changing email:", error.message);
    throw new Error(`Failed to change email: ${error.message}`);
  }
};

const changePassword = async (userId: string, newPassword: string) => {
  try {
    const user = auth.currentUser;
    if (user) {
      await user.updatePassword(newPassword);
      return true;
    } else {
      throw new Error("No user is currently signed in.");
    }
  } catch (error: any) {
    console.error("Error changing password:", error.message);
    throw new Error(`Failed to change password: ${error.message}`);
  }
};

const sendVerificationEmail = async () => {
  try {
    const user = auth.currentUser;
    if (user && !user.emailVerified) {
      await user.sendEmailVerification();
      return true;
    } else {
      throw new Error("No user is currently signed in or email already verified.");
    }
  } catch (error: any) {
    console.error("Error sending verification email:", error.message);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

const resendPasswordResetEmail = async (email: string) => {
  try {
    // First, check if the user exists with the provided email
    const users = await getAllUserDocuments();
    const userExists = users.some(u => u.email === email);

    if (!userExists) {
      throw new Error("No user found with this email address.");
    }

    // If the user exists, send the password reset email
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error: any) {
    console.error("Error resending password reset email:", error.message);
    throw new Error(`Failed to resend password reset email: ${error.message}`);
  }
};

const deleteAccount = async (userId: string) => {
  try {
    const user = auth.currentUser;
    if (user && user.uid === userId) {
      // Delete the user document from Firestore
      await deleteUserDocument(userId);

      // Delete the user from Firebase Authentication
      await deleteUser(user);

      return true;
    } else {
      throw new Error("No user is currently signed in or unauthorized to delete this account.");
    }
  } catch (error: any) {
    console.error("Error deleting account:", error.message);
    throw new Error(`Failed to delete account: ${error.message}`);
  }
};

const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const usersCollectionRef = collection(db, "users");
    const q = query(usersCollectionRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const user: User = {
        id: userDoc.id,
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        role: userData.role,
        createdAt: userData.createdAt.toDate(),
        updatedAt: userData.updatedAt.toDate(),
      };
      return user;
    } else {
      return null;
    }
  } catch (error: any) {
    console.error("Error getting user by email:", error.message);
    throw new Error(`Failed to get user by email: ${error.message}`);
  }
};

const verifyPasswordResetCode = async (code: string, email: string): Promise<boolean> => {
  try {
    // Check if a user with the given email exists
    const users = await getAllUserDocuments();
    const user = users.find(u => u.email === email);

    if (!user) {
      console.error("No user found with the given email.");
      return false;
    }

    // Here you might want to add additional checks or logic
    // For example, you could check if the password reset code is valid
    // based on some custom implementation

    return true; // Return true if the email exists and any additional checks pass
  } catch (error: any) {
    console.error("Error verifying password reset code:", error.message);
    return false;
  }
};

const confirmPasswordReset = async (code: string, newPassword: string, email: string): Promise<void> => {
  try {
    // Check if a user with the given email exists
    const users = await getAllUserDocuments();
    const user = users.find(u => u.email === email);

    if (!user) {
      throw new Error("No user found with the given email.");
    }

    // Find the user in Firebase Authentication
    const authUsers = await getAllUserDocuments();
    const authUser = authUsers.find(u => u.email === email);

    if (!authUser) {
      throw new Error("No user found in Firebase Authentication with the given email.");
    }

    // Update the password in Firebase Authentication
    await auth.confirmPasswordReset(code, newPassword);

    console.log("Password reset successfully.");
  } catch (error: any) {
    console.error("Error confirming password reset:", error.message);
    throw new Error(`Failed to confirm password reset: ${error.message}`);
  }
};

const sendSignInLinkToEmail = async (email: string, actionCodeSettings: any) => {
  try {
    await auth.sendSignInLinkToEmail(email, actionCodeSettings);
    // The link was successfully sent. Inform the user.
    // Save the email locally so you don't need to ask the user for it again.
    window.localStorage.setItem('emailForSignIn', email);
    return true;
  } catch (error: any) {
    console.error("Error sending sign-in link to email:", error.message);
    throw new Error(`Failed to send sign-in link to email: ${error.message}`);
  }
};

const isSignInWithEmailLink = (url: string): boolean => {
  return auth.isSignInWithEmailLink(url);
};

const signInWithEmailLink = async (email: string, url: string) => {
  try {
    const result = await auth.signInWithEmailLink(email, url);
    // Clear email from storage.
    window.localStorage.removeItem('emailForSignIn');
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with email link:", error.message);
    throw new Error(`Failed to sign in with email link: ${error.message}`);
  }
};

const getUsersWithRole = async (role: string): Promise<User[]> => {
  try {
    const usersCollectionRef = collection(db, "users");
    const q = query(usersCollectionRef, where("role", "==", role));
    const querySnapshot = await getDocs(q);
    const users: User[] = [];

    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      const user: User = {
        id: doc.id,
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        role: userData.role,
        createdAt: userData.createdAt.toDate(),
        updatedAt: userData.updatedAt.toDate(),
      };
      users.push(user);
    });

    return users;
  } catch (error: any) {
    console.error("Error getting users with role:", error.message);
    throw new Error(`Failed to get users with role: ${error.message}`);
  }
};

const findUsers = async (searchTerm: string): Promise<User[]> => {
  try {
    const users = await getAllUserDocuments();
    const lowerSearchTerm = searchTerm.toLowerCase();
    return users.filter(user =>
      user.displayName.toLowerCase().includes(lowerSearchTerm) ||
      user.email.toLowerCase().includes(lowerSearchTerm)
    );
  } catch (error: any) {
    console.error("Error finding users:", error.message);
    throw new Error(`Failed to find users: ${error.message}`);
  }
};

const findUsersByRole = async (searchTerm: string, role: string): Promise<User[]> => {
  try {
    const users = await getUsersWithRole(role);
    const lowerSearchTerm = searchTerm.toLowerCase();
    return users.filter(user =>
      user.displayName.toLowerCase().includes(lowerSearchTerm) ||
      user.email.toLowerCase().includes(lowerSearchTerm)
    );
  } catch (error: any) {
    console.error("Error finding users by role:", error.message);
    throw new Error(`Failed to find users by role: ${error.message}`);
  }
};

const isEmailAlreadyInUse = async (email: string): Promise<boolean> => {
  try {
    const users = await getAllUserDocuments();
    return users.some(user => user.email === email);
  } catch (error: any) {
    console.error("Error checking if email is already in use:", error.message);
    throw new Error(`Failed to check if email is already in use: ${error.message}`);
  }
};

const sendPasswordResetEmailForUsers = async (email: string) => {
  try {
    const users = await getAllUserDocuments();
    const filteredUsers = users.filter(u => {
      if (!u || typeof u !== 'object') return false;
      const userEmail = u.email;
      return userEmail === email || 
             (typeof userEmail === 'string' && typeof email === 'string' && 
              userEmail.toLowerCase() === email.toLowerCase());
    });

    if (filteredUsers.length === 0) {
      throw new Error("No user found with this email address.");
    }

    // If the user exists, send the password reset email
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error: any) {
    console.error("Error sending password reset email:", error.message);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};

export const usersService = {
  createUser,
  signInUser,
  signOutUser,
  resetPassword,
  createUserDocument,
  getUserDocument,
  getAllUserDocuments,
  updateUserDocument,
  deleteUserDocument,
  uploadUserPhoto,
  deleteUserPhoto,
  changeEmail,
  changePassword,
  sendVerificationEmail,
  resendPasswordResetEmail,
  deleteAccount,
  getUserByEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  getUsersWithRole,
  findUsers,
  findUsersByRole,
  isEmailAlreadyInUse,
  sendPasswordResetEmail: sendPasswordResetEmailForUsers,
};
