
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pet, Biography, HealthRecord, HealthSchedule, GrowthRecord, DailyRoutine, DiaryEntry, Expense, Contact, Memorial, TodoItem, Reminder, FeedingSchedule, Activity, GroomingRoutine } from '../types';

const STORAGE_KEYS = {
  PETS: 'pets',
  BIOGRAPHIES: 'biographies',
  HEALTH_RECORDS: 'health_records',
  HEALTH_SCHEDULES: 'health_schedules',
  GROWTH_RECORDS: 'growth_records',
  DAILY_ROUTINES: 'daily_routines',
  DIARY_ENTRIES: 'diary_entries',
  EXPENSES: 'expenses',
  CONTACTS: 'contacts',
  MEMORIALS: 'memorials',
  TODO_ITEMS: 'todo_items',
  REMINDERS: 'reminders',
};

// Pet functions
export const loadPets = async (): Promise<Pet[]> => {
  try {
    const petsString = await AsyncStorage.getItem(STORAGE_KEYS.PETS);
    if (!petsString) return [];

    const pets = JSON.parse(petsString) as Pet[];
    return pets.map(pet => ({
      ...pet,
      dateOfBirth: pet.dateOfBirth ? new Date(pet.dateOfBirth) : undefined,
      adoptionDate: pet.adoptionDate ? new Date(pet.adoptionDate) : undefined,
    }));
  } catch (error) {
    console.error('Error loading pets:', error);
    return [];
  }
};

export const savePet = async (pet: Pet): Promise<void> => {
  try {
    const pets = await loadPets();
    const existingIndex = pets.findIndex(p => p.id === pet.id);
    
    if (existingIndex >= 0) {
      pets[existingIndex] = pet;
    } else {
      pets.push(pet);
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.PETS, JSON.stringify(pets));
    console.log('Pet saved successfully:', pet.id);
  } catch (error) {
    console.error('Error saving pet:', error);
    throw new Error('Failed to save pet');
  }
};

export const deletePet = async (petId: string): Promise<void> => {
  try {
    // Delete pet from pets list
    const pets = await loadPets();
    const filteredPets = pets.filter(p => p.id !== petId);
    await AsyncStorage.setItem(STORAGE_KEYS.PETS, JSON.stringify(filteredPets));

    // Delete associated biography
    const biographiesString = await AsyncStorage.getItem(STORAGE_KEYS.BIOGRAPHIES);
    if (biographiesString) {
      const biographies = JSON.parse(biographiesString) as Biography[];
      const filteredBiographies = biographies.filter(b => b.petId !== petId);
      await AsyncStorage.setItem(STORAGE_KEYS.BIOGRAPHIES, JSON.stringify(filteredBiographies));
    }

    // Delete associated daily routine
    const routinesString = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_ROUTINES);
    if (routinesString) {
      const routines = JSON.parse(routinesString) as DailyRoutine[];
      const filteredRoutines = routines.filter(r => r.petId !== petId);
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_ROUTINES, JSON.stringify(filteredRoutines));
    }

    // Delete associated diary entries
    const entriesString = await AsyncStorage.getItem(STORAGE_KEYS.DIARY_ENTRIES);
    if (entriesString) {
      const entries = JSON.parse(entriesString) as DiaryEntry[];
      const filteredEntries = entries.filter(e => e.petId !== petId);
      await AsyncStorage.setItem(STORAGE_KEYS.DIARY_ENTRIES, JSON.stringify(filteredEntries));
    }

    // Delete associated reminders
    const remindersString = await AsyncStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (remindersString) {
      const reminders = JSON.parse(remindersString) as Reminder[];
      const filteredReminders = reminders.filter(r => r.petId !== petId);
      await AsyncStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(filteredReminders));
    }

    console.log('Pet and all associated data deleted successfully:', petId);
  } catch (error) {
    console.error('Error deleting pet:', error);
    throw new Error('Failed to delete pet');
  }
};

// Biography functions
export const getBiographyByPetId = async (petId: string): Promise<Biography | null> => {
  try {
    const biographiesString = await AsyncStorage.getItem(STORAGE_KEYS.BIOGRAPHIES);
    if (!biographiesString) return null;

    const biographies = JSON.parse(biographiesString) as Biography[];
    return biographies.find(b => b.petId === petId) || null;
  } catch (error) {
    console.error('Error loading biography:', error);
    return null;
  }
};

export const saveBiography = async (biography: Biography): Promise<void> => {
  try {
    const biographiesString = await AsyncStorage.getItem(STORAGE_KEYS.BIOGRAPHIES);
    const biographies = biographiesString ? JSON.parse(biographiesString) as Biography[] : [];
    
    const existingIndex = biographies.findIndex(b => b.petId === biography.petId);
    
    if (existingIndex >= 0) {
      biographies[existingIndex] = biography;
    } else {
      biographies.push(biography);
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.BIOGRAPHIES, JSON.stringify(biographies));
    console.log('Biography saved successfully:', biography.petId);
  } catch (error) {
    console.error('Error saving biography:', error);
    throw new Error('Failed to save biography');
  }
};

// Health Schedule functions
export const getHealthSchedulesByPetId = async (petId: string): Promise<HealthSchedule[]> => {
  try {
    const schedulesString = await AsyncStorage.getItem(STORAGE_KEYS.HEALTH_SCHEDULES);
    if (!schedulesString) return [];

    const schedules = JSON.parse(schedulesString) as HealthSchedule[];
    return schedules
      .filter(s => s.petId === petId)
      .map(schedule => ({
        ...schedule,
        lastDone: schedule.lastDone ? new Date(schedule.lastDone) : undefined,
        nextDue: schedule.nextDue ? new Date(schedule.nextDue) : undefined,
      }));
  } catch (error) {
    console.error('Error loading health schedules:', error);
    return [];
  }
};

export const saveHealthSchedule = async (schedule: HealthSchedule): Promise<void> => {
  try {
    const schedulesString = await AsyncStorage.getItem(STORAGE_KEYS.HEALTH_SCHEDULES);
    const schedules = schedulesString ? JSON.parse(schedulesString) as HealthSchedule[] : [];
    
    const existingIndex = schedules.findIndex(s => s.id === schedule.id);
    
    if (existingIndex >= 0) {
      schedules[existingIndex] = schedule;
    } else {
      schedules.push(schedule);
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.HEALTH_SCHEDULES, JSON.stringify(schedules));
    console.log('Health schedule saved successfully:', schedule.id);
  } catch (error) {
    console.error('Error saving health schedule:', error);
    throw new Error('Failed to save health schedule');
  }
};

export const deleteHealthSchedule = async (scheduleId: string): Promise<void> => {
  try {
    const schedulesString = await AsyncStorage.getItem(STORAGE_KEYS.HEALTH_SCHEDULES);
    if (schedulesString) {
      const schedules = JSON.parse(schedulesString) as HealthSchedule[];
      const filteredSchedules = schedules.filter(s => s.id !== scheduleId);
      await AsyncStorage.setItem(STORAGE_KEYS.HEALTH_SCHEDULES, JSON.stringify(filteredSchedules));
      console.log('Health schedule deleted successfully:', scheduleId);
    }
  } catch (error) {
    console.error('Error deleting health schedule:', error);
    throw new Error('Failed to delete health schedule');
  }
};

// Contact functions
export const loadContacts = async (): Promise<Contact[]> => {
  try {
    const contactsString = await AsyncStorage.getItem(STORAGE_KEYS.CONTACTS);
    if (!contactsString) return [];

    const contacts = JSON.parse(contactsString) as Contact[];
    return contacts;
  } catch (error) {
    console.error('Error loading contacts:', error);
    return [];
  }
};

export const saveContact = async (contact: Contact): Promise<void> => {
  try {
    const contacts = await loadContacts();
    const existingIndex = contacts.findIndex(c => c.id === contact.id);
    
    if (existingIndex >= 0) {
      contacts[existingIndex] = contact;
    } else {
      contacts.push(contact);
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
    console.log('Contact saved successfully:', contact.id);
  } catch (error) {
    console.error('Error saving contact:', error);
    throw new Error('Failed to save contact');
  }
};

export const deleteContact = async (contactId: string): Promise<void> => {
  try {
    const contacts = await loadContacts();
    const filteredContacts = contacts.filter(c => c.id !== contactId);
    await AsyncStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(filteredContacts));
    console.log('Contact deleted successfully:', contactId);
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw new Error('Failed to delete contact');
  }
};

// Daily Routine functions
export const getDailyRoutineByPetId = async (petId: string): Promise<DailyRoutine | null> => {
  try {
    const routinesString = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_ROUTINES);
    if (!routinesString) return { petId, feedingSchedule: [], activityLog: [], groomingRoutine: [] };

    const routines = JSON.parse(routinesString) as DailyRoutine[];
    let routine = routines.find(r => r.petId === petId);
    
    if (!routine) {
      routine = { petId, feedingSchedule: [], activityLog: [], groomingRoutine: [] };
    } else {
      // Convert date strings back to Date objects
      routine.activityLog = routine.activityLog.map(activity => ({
        ...activity,
        date: new Date(activity.date),
        reminderTime: activity.reminderTime ? new Date(activity.reminderTime) : undefined,
      }));
      
      if (routine.groomingRoutine) {
        routine.groomingRoutine = routine.groomingRoutine.map(grooming => ({
          ...grooming,
          lastDone: grooming.lastDone ? new Date(grooming.lastDone) : undefined,
          nextDue: grooming.nextDue ? new Date(grooming.nextDue) : undefined,
        }));
      }
    }
    
    return routine;
  } catch (error) {
    console.error('Error loading daily routine:', error);
    return { petId, feedingSchedule: [], activityLog: [], groomingRoutine: [] };
  }
};

export const saveDailyRoutine = async (routine: DailyRoutine): Promise<void> => {
  try {
    const routinesString = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_ROUTINES);
    const routines = routinesString ? JSON.parse(routinesString) as DailyRoutine[] : [];
    
    const existingIndex = routines.findIndex(r => r.petId === routine.petId);
    
    if (existingIndex >= 0) {
      routines[existingIndex] = routine;
    } else {
      routines.push(routine);
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_ROUTINES, JSON.stringify(routines));
    console.log('Daily routine saved successfully:', routine.petId);
  } catch (error) {
    console.error('Error saving daily routine:', error);
    throw new Error('Failed to save daily routine');
  }
};

// Feeding Schedule functions
export const addFeedingSchedule = async (petId: string, feeding: FeedingSchedule): Promise<void> => {
  try {
    const routine = await getDailyRoutineByPetId(petId);
    if (routine) {
      routine.feedingSchedule.push(feeding);
      await saveDailyRoutine(routine);
      console.log('Feeding schedule added successfully:', feeding.id);
    }
  } catch (error) {
    console.error('Error adding feeding schedule:', error);
    throw new Error('Failed to add feeding schedule');
  }
};

export const updateFeedingSchedule = async (petId: string, feeding: FeedingSchedule): Promise<void> => {
  try {
    const routine = await getDailyRoutineByPetId(petId);
    if (routine) {
      const index = routine.feedingSchedule.findIndex(f => f.id === feeding.id);
      if (index >= 0) {
        routine.feedingSchedule[index] = feeding;
        await saveDailyRoutine(routine);
        console.log('Feeding schedule updated successfully:', feeding.id);
      }
    }
  } catch (error) {
    console.error('Error updating feeding schedule:', error);
    throw new Error('Failed to update feeding schedule');
  }
};

export const deleteFeedingSchedule = async (petId: string, feedingId: string): Promise<void> => {
  try {
    const routine = await getDailyRoutineByPetId(petId);
    if (routine) {
      routine.feedingSchedule = routine.feedingSchedule.filter(f => f.id !== feedingId);
      await saveDailyRoutine(routine);
      console.log('Feeding schedule deleted successfully:', feedingId);
    }
  } catch (error) {
    console.error('Error deleting feeding schedule:', error);
    throw new Error('Failed to delete feeding schedule');
  }
};

// Activity functions
export const addActivity = async (petId: string, activity: Activity): Promise<void> => {
  try {
    const routine = await getDailyRoutineByPetId(petId);
    if (routine) {
      routine.activityLog.push(activity);
      await saveDailyRoutine(routine);
      console.log('Activity added successfully:', activity.id);
    }
  } catch (error) {
    console.error('Error adding activity:', error);
    throw new Error('Failed to add activity');
  }
};

export const updateActivity = async (petId: string, activity: Activity): Promise<void> => {
  try {
    const routine = await getDailyRoutineByPetId(petId);
    if (routine) {
      const index = routine.activityLog.findIndex(a => a.id === activity.id);
      if (index >= 0) {
        routine.activityLog[index] = activity;
        await saveDailyRoutine(routine);
        console.log('Activity updated successfully:', activity.id);
      }
    }
  } catch (error) {
    console.error('Error updating activity:', error);
    throw new Error('Failed to update activity');
  }
};

export const deleteActivity = async (petId: string, activityId: string): Promise<void> => {
  try {
    const routine = await getDailyRoutineByPetId(petId);
    if (routine) {
      routine.activityLog = routine.activityLog.filter(a => a.id !== activityId);
      await saveDailyRoutine(routine);
      console.log('Activity deleted successfully:', activityId);
    }
  } catch (error) {
    console.error('Error deleting activity:', error);
    throw new Error('Failed to delete activity');
  }
};

// Grooming Routine functions
export const addGroomingRoutine = async (petId: string, grooming: GroomingRoutine): Promise<void> => {
  try {
    const routine = await getDailyRoutineByPetId(petId);
    if (routine) {
      if (!routine.groomingRoutine) {
        routine.groomingRoutine = [];
      }
      routine.groomingRoutine.push(grooming);
      await saveDailyRoutine(routine);
      console.log('Grooming routine added successfully:', grooming.id);
    }
  } catch (error) {
    console.error('Error adding grooming routine:', error);
    throw new Error('Failed to add grooming routine');
  }
};

export const updateGroomingRoutine = async (petId: string, grooming: GroomingRoutine): Promise<void> => {
  try {
    const routine = await getDailyRoutineByPetId(petId);
    if (routine && routine.groomingRoutine) {
      const index = routine.groomingRoutine.findIndex(g => g.id === grooming.id);
      if (index >= 0) {
        routine.groomingRoutine[index] = grooming;
        await saveDailyRoutine(routine);
        console.log('Grooming routine updated successfully:', grooming.id);
      }
    }
  } catch (error) {
    console.error('Error updating grooming routine:', error);
    throw new Error('Failed to update grooming routine');
  }
};

export const deleteGroomingRoutine = async (petId: string, groomingId: string): Promise<void> => {
  try {
    const routine = await getDailyRoutineByPetId(petId);
    if (routine && routine.groomingRoutine) {
      routine.groomingRoutine = routine.groomingRoutine.filter(g => g.id !== groomingId);
      await saveDailyRoutine(routine);
      console.log('Grooming routine deleted successfully:', groomingId);
    }
  } catch (error) {
    console.error('Error deleting grooming routine:', error);
    throw new Error('Failed to delete grooming routine');
  }
};

// Diary Entry functions
export const loadDiaryEntries = async (): Promise<DiaryEntry[]> => {
  try {
    const entriesString = await AsyncStorage.getItem(STORAGE_KEYS.DIARY_ENTRIES);
    if (!entriesString) return [];

    const entries = JSON.parse(entriesString) as DiaryEntry[];
    return entries.map(entry => ({
      ...entry,
      date: new Date(entry.date),
    }));
  } catch (error) {
    console.error('Error loading diary entries:', error);
    return [];
  }
};

export const saveDiaryEntry = async (entry: DiaryEntry): Promise<void> => {
  try {
    const entries = await loadDiaryEntries();
    const existingIndex = entries.findIndex(e => e.id === entry.id);
    
    if (existingIndex >= 0) {
      entries[existingIndex] = entry;
    } else {
      entries.push(entry);
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.DIARY_ENTRIES, JSON.stringify(entries));
    console.log('Diary entry saved successfully:', entry.id);
  } catch (error) {
    console.error('Error saving diary entry:', error);
    throw new Error('Failed to save diary entry');
  }
};

export const deleteDiaryEntry = async (entryId: string): Promise<void> => {
  try {
    const entries = await loadDiaryEntries();
    const filteredEntries = entries.filter(e => e.id !== entryId);
    await AsyncStorage.setItem(STORAGE_KEYS.DIARY_ENTRIES, JSON.stringify(filteredEntries));
    console.log('Diary entry deleted successfully:', entryId);
  } catch (error) {
    console.error('Error deleting diary entry:', error);
    throw new Error('Failed to delete diary entry');
  }
};

// Reminder functions
export const getUpcomingReminders = async (): Promise<Reminder[]> => {
  try {
    const remindersString = await AsyncStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (!remindersString) return [];

    const reminders = JSON.parse(remindersString) as Reminder[];
    const now = new Date();
    
    return reminders
      .map(reminder => ({
        ...reminder,
        date: new Date(reminder.date),
      }))
      .filter(reminder => !reminder.completed && reminder.date >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5); // Return only next 5 reminders
  } catch (error) {
    console.error('Error loading reminders:', error);
    return [];
  }
};

export const saveReminder = async (reminder: Reminder): Promise<void> => {
  try {
    const remindersString = await AsyncStorage.getItem(STORAGE_KEYS.REMINDERS);
    const reminders = remindersString ? JSON.parse(remindersString) as Reminder[] : [];
    
    const existingIndex = reminders.findIndex(r => r.id === reminder.id);
    
    if (existingIndex >= 0) {
      reminders[existingIndex] = reminder;
    } else {
      reminders.push(reminder);
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    console.log('Reminder saved successfully:', reminder.id);
  } catch (error) {
    console.error('Error saving reminder:', error);
    throw new Error('Failed to save reminder');
  }
};

// Clear all data function
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
    console.log('All data cleared successfully');
  } catch (error) {
    console.error('Error clearing data:', error);
    throw new Error('Failed to clear data');
  }
};
