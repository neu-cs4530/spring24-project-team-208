import { db } from './firebaseSetup';
import { collection, doc, getDoc } from 'firebase/firestore';
import { BattleShipDatabaseEntry } from '../types/CoveyTownSocket';

const battleshipCollection = collection(db, 'battleship');

/**
 * A method to retrieve the battleship history associated with a given user from the firestore database.
 *
 * @param username The display name of the user to retrieve data for
 * @returns A battle ship database entry for the user, with the users wins, losses, elo, and game history
 * @throws An error if the user does not exist in the database or if there is an issue contacting the database
 */
export default async function getBattleShipData(
  username: string,
): Promise<BattleShipDatabaseEntry> {
  try {
    const userRef = doc(battleshipCollection, username);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    if (userData) {
      return userData as BattleShipDatabaseEntry;
    } else {
      throw new Error('No data associated with this username');
    }
  } catch (error) {
    throw new Error(`Error contacting database: ${error}`);
  }
}
