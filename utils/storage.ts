
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pet, Biography, HealthRecord, GrowthRecord, DailyRoutine, DiaryEntry, Expense, Contact, Memorial, TodoItem, Reminder, FeedingSchedule, Activity, GroomingRoutine } from '../types';

const STORAGE_KEYS = {
  PETS: 'pets',
  BIOGRAPHIES: 'biographies',
  HEALTH_RECORDS: 'health_records',
  GROWTH_RECORDS: 'growth_records',
  DAILY_ROUTINES: 'daily_routines',
  DIARY_ENTRIES: 'diary_entries',
  EXPENSES: 'expenses',
  CONTACTS: 'contacts',
  MEMORIALS: 'memorials',
  TODO_ITEMS: 'todo_items',
  REMINDERS: 'reminders',
};

// Generic storage functions
export const saveData = async <T>(key: string, data: T[]): Promise<void> => {
  try {
    const jsonData = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonData);
    console.log(`Saved ${key} data successfully`);
  } catch (error) {
    console.error(`Error saving ${key} data:`, error);
    throw error;
  }
};

export const loadData = async <T>(key: string): Promise<T[]> => {
  try {
    const jsonData = await AsyncStorage.getItem(key);
    if (jsonData) {
      const data = JSON.parse(jsonData);
      console.log(`Loaded ${key} data successfully`);
      return data;
    }
    return [];
  } catch (error) {
    console.error(`Error loading ${key} data:`, error);
    return [];
  }
};

// Pet-specific functions
export const savePets = async (pets: Pet[]): Promise<void> => {
  return saveData(STORAGE_KEYS.PETS, pets);
};

export const loadPets = async (): Promise<Pet[]> => {
  try {
    const jsonData = await AsyncStorage.getItem(STORAGE_KEYS.PETS);
    if (jsonData) {
      const data = JSON.parse(jsonData);
      // Convert date strings back to Date objects
      const pets = data.map((pet: any) => ({
        ...pet,
        dateOfBirth: pet.dateOfBirth ? new Date(pet.dateOfBirth) : undefined,
        adoptionDate: pet.adoptionDate ? new Date(pet.adoptionDate) : undefined,
      }));
      console.log('Loaded pets data successfully with date conversion');
      return pets;
    }
    return [];
  } catch (error) {
    console.error('Error loading pets data:', error);
    return [];
  }
};

export const savePet = async (pet: Pet): Promise<void> => {
  const pets = await loadPets();
  const existingIndex = pets.findIndex(p => p.id === pet.id);
  
  if (existingIndex >= 0) {
    pets[existingIndex] = pet;
  } else {
    pets.push(pet);
  }
  
  return savePets(pets);
};

export const deletePet = async (petId: string): Promise<void> => {
  const pets = await loadPets();
  const filteredPets = pets.filter(p => p.id !== petId);
  return savePets(filteredPets);
};

// Biography functions
export const saveBiographies = async (biographies: Biography[]): Promise<void> => {
  return saveData(STORAGE_KEYS.BIOGRAPHIES, biographies);
};

export const loadBiographies = async (): Promise<Biography[]> => {
  return loadData<Biography>(STORAGE_KEYS.BIOGRAPHIES);
};

export const getBiographyByPetId = async (petId: string): Promise<Biography | null> => {
  const biographies = await loadBiographies();
  return biographies.find(b => b.petId === petId) || null;
};

export const saveBiography = async (biography: Biography): Promise<void> => {
  const biographies = await loadBiographies();
  const existingIndex = biographies.findIndex(b => b.petId === biography.petId);
  
  if (existingIndex >= 0) {
    biographies[existingIndex] = biography;
  } else {
    biographies.push(biography);
  }
  
  return saveBiographies(biographies);
};

// Health Records functions
export const saveHealthRecords = async (records: HealthRecord[]): Promise<void> => {
  return saveData(STORAGE_KEYS.HEALTH_RECORDS, records);
};

export const loadHealthRecords = async (): Promise<HealthRecord[]> => {
  return loadData<HealthRecord>(STORAGE_KEYS.HEALTH_RECORDS);
};

export const getHealthRecordsByPetId = async (petId: string): Promise<HealthRecord[]> => {
  const records = await loadHealthRecords();
  return records.filter(r => r.petId === petId);
};

export const saveHealthRecord = async (record: HealthRecord): Promise<void> => {
  const records = await loadHealthRecords();
  const existingIndex = records.findIndex(r => r.id === record.id);
  
  if (existingIndex >= 0) {
    records[existingIndex] = record;
  } else {
    records.push(record);
  }
  
  return saveHealthRecords(records);
};

// Daily Routine functions
export const saveDailyRoutines = async (routines: DailyRoutine[]): Promise<void> => {
  try {
    const jsonData = JSON.stringify(routines);
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_ROUTINES, jsonData);
    console.log('Saved daily routines data successfully');
  } catch (error) {
    console.error('Error saving daily routines data:', error);
    throw error;
  }
};

export const loadDailyRoutines = async (): Promise<DailyRoutine[]> => {
  try {
    const jsonData = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_ROUTINES);
    if (jsonData) {
      const data = JSON.parse(jsonData);
      // Convert date strings back to Date objects
      const routines = data.map((routine: any) => ({
        ...routine,
        activityLog: routine.activityLog?.map((activity: any) => ({
          ...activity,
          date: new Date(activity.date),
        })) || [],
        groomingRoutine: routine.groomingRoutine?.map((grooming: any) => ({
          ...grooming,
          lastDone: grooming.lastDone ? new Date(grooming.lastDone) : undefined,
          nextDue: grooming.nextDue ? new Date(grooming.nextDue) : undefined,
        })) || [],
      }));
      console.log('Loaded daily routines data successfully with date conversion');
      return routines;
    }
    return [];
  } catch (error) {
    console.error('Error loading daily routines data:', error);
    return [];
  }
};

export const getDailyRoutineByPetId = async (petId: string): Promise<DailyRoutine | null> => {
  const routines = await loadDailyRoutines();
  return routines.find(r => r.petId === petId) || null;
};

export const saveDailyRoutine = async (routine: DailyRoutine): Promise<void> => {
  const routines = await loadDailyRoutines();
  const existingIndex = routines.findIndex(r => r.petId === routine.petId);
  
  if (existingIndex >= 0) {
    routines[existingIndex] = routine;
  } else {
    routines.push(routine);
  }
  
  return saveDailyRoutines(routines);
};

export const addFeedingSchedule = async (petId: string, feeding: FeedingSchedule): Promise<void> => {
  const routine = await getDailyRoutineByPetId(petId);
  if (routine) {
    routine.feedingSchedule.push(feeding);
    await saveDailyRoutine(routine);
  } else {
    const newRoutine: DailyRoutine = {
      petId,
      feedingSchedule: [feeding],
      activityLog: [],
      groomingRoutine: [],
    };
    await saveDailyRoutine(newRoutine);
  }
};

export const updateFeedingSchedule = async (petId: string, feeding: FeedingSchedule): Promise<void> => {
  const routine = await getDailyRoutineByPetId(petId);
  if (routine) {
    const index = routine.feedingSchedule.findIndex(f => f.id === feeding.id);
    if (index >= 0) {
      routine.feedingSchedule[index] = feeding;
      await saveDailyRoutine(routine);
    }
  }
};

export const deleteFeedingSchedule = async (petId: string, feedingId: string): Promise<void> => {
  const routine = await getDailyRoutineByPetId(petId);
  if (routine) {
    routine.feedingSchedule = routine.feedingSchedule.filter(f => f.id !== feedingId);
    await saveDailyRoutine(routine);
  }
};

export const addActivity = async (petId: string, activity: Activity): Promise<void> => {
  const routine = await getDailyRoutineByPetId(petId);
  if (routine) {
    routine.activityLog.push(activity);
    await saveDailyRoutine(routine);
  } else {
    const newRoutine: DailyRoutine = {
      petId,
      feedingSchedule: [],
      activityLog: [activity],
      groomingRoutine: [],
    };
    await saveDailyRoutine(newRoutine);
  }
};

export const updateActivity = async (petId: string, activity: Activity): Promise<void> => {
  const routine = await getDailyRoutineByPetId(petId);
  if (routine) {
    const index = routine.activityLog.findIndex(a => a.id === activity.id);
    if (index >= 0) {
      routine.activityLog[index] = activity;
      await saveDailyRoutine(routine);
    }
  }
};

export const deleteActivity = async (petId: string, activityId: string): Promise<void> => {
  const routine = await getDailyRoutineByPetId(petId);
  if (routine) {
    routine.activityLog = routine.activityLog.filter(a => a.id !== activityId);
    await saveDailyRoutine(routine);
  }
};

export const addGroomingRoutine = async (petId: string, grooming: GroomingRoutine): Promise<void> => {
  const routine = await getDailyRoutineByPetId(petId);
  if (routine) {
    if (!routine.groomingRoutine) {
      routine.groomingRoutine = [];
    }
    routine.groomingRoutine.push(grooming);
    await saveDailyRoutine(routine);
  } else {
    const newRoutine: DailyRoutine = {
      petId,
      feedingSchedule: [],
      activityLog: [],
      groomingRoutine: [grooming],
    };
    await saveDailyRoutine(newRoutine);
  }
};

export const updateGroomingRoutine = async (petId: string, grooming: GroomingRoutine): Promise<void> => {
  const routine = await getDailyRoutineByPetId(petId);
  if (routine && routine.groomingRoutine) {
    const index = routine.groomingRoutine.findIndex(g => g.id === grooming.id);
    if (index >= 0) {
      routine.groomingRoutine[index] = grooming;
      await saveDailyRoutine(routine);
    }
  }
};

export const deleteGroomingRoutine = async (petId: string, groomingId: string): Promise<void> => {
  const routine = await getDailyRoutineByPetId(petId);
  if (routine && routine.groomingRoutine) {
    routine.groomingRoutine = routine.groomingRoutine.filter(g => g.id !== groomingId);
    await saveDailyRoutine(routine);
  }
};

// Diary Entries functions
export const saveDiaryEntries = async (entries: DiaryEntry[]): Promise<void> => {
  return saveData(STORAGE_KEYS.DIARY_ENTRIES, entries);
};

export const loadDiaryEntries = async (): Promise<DiaryEntry[]> => {
  try {
    const jsonData = await AsyncStorage.getItem(STORAGE_KEYS.DIARY_ENTRIES);
    if (jsonData) {
      const data = JSON.parse(jsonData);
      // Convert date strings back to Date objects
      const entries = data.map((entry: any) => ({
        ...entry,
        date: new Date(entry.date),
      }));
      console.log('Loaded diary entries data successfully with date conversion');
      return entries;
    }
    return [];
  } catch (error) {
    console.error('Error loading diary entries data:', error);
    return [];
  }
};

export const getDiaryEntriesByPetId = async (petId: string): Promise<DiaryEntry[]> => {
  const entries = await loadDiaryEntries();
  return entries.filter(e => e.petId === petId);
};

export const saveDiaryEntry = async (entry: DiaryEntry): Promise<void> => {
  const entries = await loadDiaryEntries();
  const existingIndex = entries.findIndex(e => e.id === entry.id);
  
  if (existingIndex >= 0) {
    entries[existingIndex] = entry;
  } else {
    entries.push(entry);
  }
  
  return saveDiaryEntries(entries);
};

// Reminders functions
export const saveReminders = async (reminders: Reminder[]): Promise<void> => {
  return saveData(STORAGE_KEYS.REMINDERS, reminders);
};

export const loadReminders = async (): Promise<Reminder[]> => {
  try {
    const jsonData = await AsyncStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (jsonData) {
      const data = JSON.parse(jsonData);
      // Convert date strings back to Date objects
      const reminders = data.map((reminder: any) => ({
        ...reminder,
        date: new Date(reminder.date),
      }));
      console.log('Loaded reminders data successfully with date conversion');
      return reminders;
    }
    return [];
  } catch (error) {
    console.error('Error loading reminders data:', error);
    return [];
  }
};

export const getUpcomingReminders = async (): Promise<Reminder[]> => {
  const reminders = await loadReminders();
  const now = new Date();
  const upcoming = reminders.filter(r => {
    const reminderDate = new Date(r.date);
    return reminderDate >= now && !r.completed;
  });
  return upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Clear all data (for testing purposes)
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    console.log('All data cleared successfully');
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
};
