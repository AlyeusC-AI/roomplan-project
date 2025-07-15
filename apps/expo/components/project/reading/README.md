# Offline Readings System

This system has been refactored to use a simple array structure for managing offline readings, including support for wall readings and generic room readings.

## Structure

The offline readings are stored in separate arrays for different types:

- **Room Readings** (`offline-readings.ts`) - Main room readings with temperature/humidity
- **Wall Readings** (`offline-wall-readings.ts`) - Wall-specific moisture readings
- **Generic Readings** (`offline-generic-readings.ts`) - Dehumidifier and other equipment readings

Each type has a `type` field: `"new"` or `"edit"`

## Key Components

### 1. Offline Stores

#### Room Readings Store (`@/lib/state/offline-readings.ts`)

```typescript
interface OfflineReading {
  id: string;
  roomId: string;
  projectId: string;
  date: Date;
  humidity: number;
  temperature: number;
  type: "new" | "edit";
  originalReadingId?: string;
  status: "pending" | "uploading" | "completed" | "failed";
  createdAt: Date;
  retryCount: number;
  error?: string;
}
```

#### Wall Readings Store (`@/lib/state/offline-wall-readings.ts`)

```typescript
interface OfflineWallReading {
  id: string;
  wallId: string;
  roomReadingId: string;
  projectId: string;
  reading: number;
  images: string[];
  type: "new" | "edit";
  originalReadingId?: string;
  status: "pending" | "uploading" | "completed" | "failed";
  createdAt: Date;
  retryCount: number;
  error?: string;
}
```

#### Generic Readings Store (`@/lib/state/offline-generic-readings.ts`)

```typescript
interface OfflineGenericReading {
  id: string;
  roomReadingId: string;
  projectId: string;
  value: string;
  humidity: number;
  temperature: number;
  images: string[];
  type: "new" | "edit";
  originalReadingId?: string;
  status: "pending" | "uploading" | "completed" | "failed";
  createdAt: Date;
  retryCount: number;
  error?: string;
}
```

### 2. Offline Hooks (`@/lib/hooks/useOfflineReadings.ts`)

#### Room Readings

- `useOfflineCreateRoomReading()` - Create new room readings offline
- `useOfflineUpdateRoomReading()` - Update existing room readings offline
- `useOfflineDeleteRoomReading()` - Delete room readings offline

#### Wall Readings

- `useOfflineCreateWallReading()` - Create new wall readings offline
- `useOfflineUpdateWallReading()` - Update existing wall readings offline

#### Generic Readings

- `useOfflineCreateGenericRoomReading()` - Create new generic readings offline
- `useOfflineUpdateGenericRoomReading()` - Update existing generic readings offline

### 3. Components with Offline Support

#### ExtendedWallSection

- Uses `useOfflineCreateWallReading()` and `useOfflineUpdateWallReading()`
- Supports offline creation and editing of wall moisture readings
- Handles image uploads offline

#### GenericRoomReadingSection

- Uses `useOfflineUpdateGenericRoomReading()`
- Supports offline editing of dehumidifier readings
- Handles temperature, humidity, and image updates offline

## Usage Example

```typescript
// In a component
const { mutate: createReading } = useOfflineCreateRoomReading(projectId);
const { mutate: updateReading } = useOfflineUpdateRoomReading(
  projectId,
  roomId
);
const { mutate: createWallReading } = useOfflineCreateWallReading(projectId);
const { mutate: updateGenericReading } =
  useOfflineUpdateGenericRoomReading(projectId);

// Create new room reading (works online/offline)
await createReading({
  roomId: "room-123",
  date: new Date(),
  humidity: 45,
  temperature: 72,
});

// Create new wall reading (works online/offline)
await createWallReading({
  wallId: "wall-456",
  roomReadingId: "reading-789",
  reading: 15.5,
  images: [],
});

// Update generic reading (works online/offline)
await updateGenericReading({
  id: "generic-123",
  data: {
    value: "25.5",
    humidity: 50,
    temperature: 75,
  },
});
```

## Key Features

1. **Separate Storage** - Each type of reading has its own offline store
2. **Type-based Organization** - New readings vs edits for each type
3. **Automatic Fallback** - If online operation fails, adds to appropriate offline queue
4. **Merge Edits** - Multiple edits to same reading are merged
5. **Auto-retry** - Failed uploads are retried with exponential backoff
6. **Status Tracking** - Track pending, uploading, completed, failed states
7. **Image Support** - Wall and generic readings support offline image storage

## Integration with UI

### Room Readings

The reading item component automatically merges offline edits with online data:

```typescript
const offlineEdit = getEditForReading(reading.id);
const mergedReading = {
  ...reading,
  ...(offlineEdit && {
    temperature: offlineEdit.temperature ?? reading.temperature,
    humidity: offlineEdit.humidity ?? reading.humidity,
    date: offlineEdit.date ?? reading.date,
  }),
};
```

### Wall Readings

ExtendedWallSection automatically handles offline wall readings:

```typescript
const { mutate: updateWallReading } = useOfflineUpdateWallReading(projectId);
// Changes are automatically queued for offline if needed
```

### Generic Readings

GenericRoomReadingSection automatically handles offline generic readings:

```typescript
const { mutate: updateGenericReading } =
  useOfflineUpdateGenericRoomReading(projectId);
// Changes are automatically queued for offline if needed
```

## Visual Indicators

- **Room-level indicator**: Shows "X Pending" when there are offline readings
- **Reading-level indicator**: Shows "Offline" badge on individual offline readings
- **App-level indicator**: Shows "Offline" status in the header
- **Field-level indicators**: Orange dots show individual fields with offline edits
- **Loading indicators**: Show when changes are being saved

## Offline Editing Support

### ExtendedWallSection

- **Offline edits**: Merges online wall reading data with offline edits
- **Visual indicators**: Orange dots show fields with offline changes
- **Image support**: Handles offline image uploads
- **Real-time updates**: Changes are queued and synced when online

### GenericRoomReadingSection

- **Offline edits**: Merges online generic reading data with offline edits
- **Visual indicators**: Orange dots show fields with offline changes
- **Multiple fields**: Supports offline editing of value, temperature, humidity
- **Image support**: Handles offline image uploads for generic readings

## Testing Offline Functionality

1. **Enable airplane mode** or disconnect from network
2. **Create/edit/delete** readings - changes are queued offline
3. **Edit wall readings** - moisture content and images are queued
4. **Edit generic readings** - value, temperature, humidity are queued
5. **Add images** - stored locally until online
6. **Reconnect** - watch automatic synchronization
7. **Check indicators** - orange dots show offline edits
8. **Verify sync** - all changes appear in database

## Auto-Clear Functionality

The system automatically clears completed tasks to keep the offline stores clean:

### Automatic Clearing

- **Completed tasks**: Automatically cleared after 2 seconds
- **Failed tasks**: Retained for manual retry
- **Processing tasks**: Cleared once completed
- **All stores**: Room readings, wall readings, and generic readings

### Processors

- **`offline-readings-processor.ts`**: Handles room readings with auto-clear
- **`offline-wall-readings-processor.ts`**: Handles wall readings with auto-clear
- **`offline-generic-readings-processor.ts`**: Handles generic readings with auto-clear

### Manual Clearing

- **`clearCompleted()`**: Manually clear completed tasks
- **`clearFailed()`**: Manually clear failed tasks
- **`clearAll()`**: Clear all tasks from store

## Testing

1. **Go offline** (turn off WiFi/mobile data)
2. **Add a new room reading** - It should appear immediately with an "Offline" indicator
3. **Edit wall readings** - Changes should be visible with offline indicators
4. **Edit generic readings** - Changes should be visible with offline indicators
5. **Go back online** - All readings should upload automatically

The system now properly supports offline functionality for all types of readings with clear visual feedback and automatic synchronization when connection is restored.
