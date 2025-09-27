
export interface Pet {
  id: string;
  name: string;
  nickname?: string;
  species: string;
  breed?: string;
  color?: string;
  uniqueFeatures?: string;
  dateOfBirth?: Date;
  adoptionDate?: Date;
  breeder?: string;
  adoptionFee?: number;
  notes?: string;
  profileImage?: string;
  isMemorial?: boolean;
}

export interface Biography {
  petId: string;
  origin?: string;
  background?: string;
  character?: string;
  personality?: string;
  favoriteFood?: string;
  favoriteToy?: string;
  likes?: string[];
  dislikes?: string[];
  bondWithOwner?: string;
  bondWithOtherPets?: string;
  signatureMoments?: string[];
}

export interface HealthRecord {
  id: string;
  petId: string;
  type: 'vaccination' | 'medicine' | 'deworming' | 'sterilization' | 'checkup' | 'treatment';
  name: string;
  date: Date;
  nextDue?: Date;
  veterinarian?: string;
  notes?: string;
  cost?: number;
}

export interface GrowthRecord {
  id: string;
  petId: string;
  date: Date;
  weight?: number;
  height?: number;
  notes?: string;
}

export interface DailyRoutine {
  petId: string;
  feedingSchedule: FeedingSchedule[];
  activityLog: Activity[];
  groomingRoutine?: GroomingRoutine[];
}

export interface FeedingSchedule {
  id: string;
  time: string;
  foodType: string;
  portionSize: string;
  notes?: string;
}

export interface Activity {
  id: string;
  date: Date;
  type: 'walk' | 'playtime' | 'training' | 'other';
  duration?: number;
  description?: string;
  favoriteToys?: string[];
}

export interface GroomingRoutine {
  id: string;
  type: 'bath' | 'brushing' | 'nails' | 'teeth' | 'other';
  frequency: string;
  lastDone?: Date;
  nextDue?: Date;
  notes?: string;
}

export interface DiaryEntry {
  id: string;
  petId?: string;
  date: Date;
  title?: string;
  memo: string;
  photos?: string[];
  videos?: string[];
  mood?: 'happy' | 'sad' | 'excited' | 'calm' | 'playful' | 'tired';
}

export interface Expense {
  id: string;
  petId?: string;
  date: Date;
  category: 'food' | 'medical' | 'grooming' | 'toys' | 'accessories' | 'other';
  item: string;
  amount: number;
  notes?: string;
  isPlanned?: boolean;
}

export interface Contact {
  id: string;
  type: 'veterinarian' | 'emergency' | 'groomer' | 'sitter' | 'other';
  name: string;
  phone: string;
  address?: string;
  email?: string;
  notes?: string;
}

export interface Memorial {
  petId: string;
  dateOfPassing: Date;
  place?: string;
  cause?: string;
  burial?: string;
  farewellNotes?: string;
  lastPhoto?: string;
  memories?: string[];
}

export interface TodoItem {
  id: string;
  petId?: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  dueDate?: Date;
  estimatedCost?: number;
  category: 'health' | 'grooming' | 'training' | 'shopping' | 'other';
}

export interface Reminder {
  id: string;
  petId?: string;
  title: string;
  description?: string;
  date: Date;
  type: 'vaccination' | 'medicine' | 'grooming' | 'checkup' | 'feeding' | 'other';
  isRecurring?: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  completed: boolean;
}
