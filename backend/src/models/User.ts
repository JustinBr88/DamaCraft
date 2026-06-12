import { Schema, model, type Document } from 'mongoose';

// ─── Stats Sub-Schema ─────────────────────────────────────────────────

interface IStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  currentStreak: number;
}

// ─── Inventory Sub-Schema ────────────────────────────────────────────────

interface IInventory {
  purchasedPacks: string[];       // ['nether_pack', 'end_pack']
  unlockedPieceSets: string[];    // ['overworld', 'nether', 'end']
  unlockedGameThemes: string[];   // ['overworld', 'nether', 'end']
  unlockedMenuBackgrounds: string[]; // ['menu', 'overworld', 'nether', 'end']
  unlockedDiscos: string[];       // disco IDs the user owns
  equippedPieceSet: string;
  equippedGameTheme: string;
  equippedMenuBackground: string;
  equippedDisco: string;
}

interface ISkins {
  unlockedBoards: string[];
  unlockedPieceSets: string[];
  equippedBoard: string;
  equippedPieceSet: string;
}

interface IUser extends Document {
  clerkId: string;
  email: string;
  username: string;
  stats: IStats;
  skins: ISkins;
  inventory: IInventory;
  stripeCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────

const statsSchema = new Schema<IStats>(
  {
    gamesPlayed: { type: Number, default: 0 },
    gamesWon: { type: Number, default: 0 },
    gamesLost: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
  },
  { _id: false }
);

const skinsSchema = new Schema<ISkins>(
  {
    unlockedBoards: { type: [String], default: ['overwold'] },
    unlockedPieceSets: { type: [String], default: ['overwold'] },
    equippedBoard: { type: String, default: 'overwold' },
    equippedPieceSet: { type: String, default: 'overwold' },
  },
  { _id: false }
);

const inventorySchema = new Schema<IInventory>(
  {
    purchasedPacks: { type: [String], default: [] },
    unlockedPieceSets: { type: [String], default: ['overworld'] },
    unlockedGameThemes: { type: [String], default: ['overworld'] },
    unlockedMenuBackgrounds: { type: [String], default: ['menu', 'overworld'] },
    unlockedDiscos: {
      type: [String],
      default: ['menu_music1', 'menu_music2', 'menu_music3', 'menu_music4', 'store_music', 'overwold_music'],
    },
    equippedPieceSet: { type: String, default: 'overworld' },
    equippedGameTheme: { type: String, default: 'overworld' },
    equippedMenuBackground: { type: String, default: 'menu' },
    equippedDisco: { type: String, default: 'menu_music1' },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    username: { type: String, required: true },
    stats: { type: statsSchema, default: () => ({}) },
    skins: { type: skinsSchema, default: () => ({}) },
    inventory: { type: inventorySchema, default: () => ({}) },
    stripeCustomerId: { type: String },
  },
  {
    timestamps: true,
  }
);

// ─── Model Export ─────────────────────────────────────────────────────

export const User = model<IUser>('User', userSchema);
