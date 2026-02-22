# DeepShift Supabase Integration

This document explains how to connect the DeepShift React Native app to Supabase.

## Setup Instructions

### 1. Configure Supabase Credentials

Open `src/services/supabase.ts` and replace the placeholder values with your actual Supabase project credentials:

```typescript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

You can find these values in your Supabase dashboard under **Settings > API**.

### 2. Set Up the Database

Run the SQL schema in your Supabase SQL editor:

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `src/Supabase/schema1.sql`
4. Run the SQL to create all tables, views, and seed data

### 3. Enable Authentication

For user authentication to work:

1. Go to **Authentication > Providers** in Supabase
2. Enable **Email** provider
3. Create user accounts that match the email addresses in the `users` table

## Project Structure

### Services (`src/services/`)

| File                  | Description                                    |
| --------------------- | ---------------------------------------------- |
| `supabase.ts`         | Supabase client configuration                  |
| `authService.ts`      | Authentication (login, logout, password reset) |
| `shiftService.ts`     | Shift CRUD operations                          |
| `workerLogService.ts` | Worker attendance and task logs                |
| `incidentService.ts`  | Incident reporting and management              |
| `equipmentService.ts` | Equipment condition tracking                   |
| `userService.ts`      | User and section management                    |
| `approvalService.ts`  | Shift approval workflow                        |
| `handoverService.ts`  | Shift handover management                      |
| `index.ts`            | Centralized exports                            |

### Types (`src/types/`)

| File          | Description                              |
| ------------- | ---------------------------------------- |
| `database.ts` | TypeScript types matching the SQL schema |
| `worker.ts`   | Legacy types (for local storage)         |

### Hooks (`src/hooks/`)

| File              | Description                                         |
| ----------------- | --------------------------------------------------- |
| `useSupabase.ts`  | Generic hooks for queries, mutations, and real-time |
| `useDashboard.ts` | Role-specific dashboard data hooks                  |
| `index.ts`        | Centralized exports                                 |

### Context (`src/context/`)

| File                 | Description                           |
| -------------------- | ------------------------------------- |
| `AuthContext.tsx`    | Authentication state management       |
| `WorkerContext.tsx`  | Worker data (local storage - legacy)  |
| `ForemanContext.tsx` | Foreman data (local storage - legacy) |

## Usage Examples

### Authentication

```typescript
import { useAuth } from '../context/AuthContext';

const MyComponent = () => {
  const { user, role, login, logout, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    // ...
  );
};
```

### Fetching Data

```typescript
import { useSupabaseQuery } from '../hooks/useSupabase';
import { shiftService } from '../services';

const ShiftList = () => {
  const { data: shifts, isLoading, error, refetch } = useSupabaseQuery(
    () => shiftService.getTodayShifts(),
    [] // dependencies
  );

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return (
    // render shifts
  );
};
```

### Mutations

```typescript
import { useSupabaseMutation } from '../hooks/useSupabase';
import { incidentService } from '../services';

const ReportIncident = () => {
  const { mutate, isLoading } = useSupabaseMutation(
    data => incidentService.createIncident(data),
    {
      onSuccess: () => Alert.alert('Success', 'Incident reported'),
      onError: error => Alert.alert('Error', error.message),
    },
  );

  const handleSubmit = () => {
    mutate({
      shift_id: currentShiftId,
      section_id: sectionId,
      // ... other fields
    });
  };
};
```

### Real-time Updates

```typescript
import { useSupabaseRealtime } from '../hooks/useSupabase';
import { Shift } from '../types/database';

const ShiftMonitor = ({ sectionId }) => {
  useSupabaseRealtime<Shift>(
    'shifts',
    (payload) => {
      console.log('Shift updated:', payload);
      // Refresh data or update state
    },
    { filter: `section_id=eq.${sectionId}` }
  );

  return (
    // ...
  );
};
```

### Dashboard Hooks

```typescript
import { useWorkerDashboard, useForemanDashboard } from '../hooks/useDashboard';

// For Worker Dashboard
const WorkerScreen = () => {
  const {
    currentShift,
    workerLog,
    todayIncidents,
    checkIn,
    checkOut,
    reportIncident,
  } = useWorkerDashboard();
};

// For Foreman Dashboard
const ForemanScreen = () => {
  const { workers, workerLogs, stats, markAttendance, bulkMarkAttendance } =
    useForemanDashboard();
};
```

## Database Schema Overview

### Core Tables

- **sections** - Mine sections/areas
- **users** - All users (workers, foremen, overmen, managers)
- **shifts** - Daily shift records
- **worker_shift_logs** - Individual worker attendance and tasks
- **equipment_logs** - Equipment condition reports
- **incident_reports** - Safety incidents
- **approvals** - Approval workflow records
- **audit_logs** - Immutable change history
- **shift_handovers** - Shift handover records

### Views (Analytics)

- **v_daily_shift_summary** - Shift statistics by day
- **v_incident_analytics** - Incident trends by month
- **v_worker_attendance** - Worker attendance percentages

## User Roles

| Role      | Permissions                                       |
| --------- | ------------------------------------------------- |
| `worker`  | View own tasks, mark attendance, report incidents |
| `foreman` | Manage section workers, create reports            |
| `overman` | Manage shifts, review section reports             |
| `manager` | Approve shifts, view analytics, full access       |

## Migration Notes

The app currently supports both:

- **Local storage** (WorkerContext, ForemanContext) - for offline support
- **Supabase** (new services) - for cloud sync

To fully migrate to Supabase:

1. Replace local storage calls with Supabase service calls
2. Implement offline queue for mutations when offline
3. Use real-time subscriptions for live updates
