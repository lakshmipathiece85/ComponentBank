import {
  ElectronicComponent,
  RentalRecord,
  ComponentReservation,
  LabTask,
  LabAuditLog,
  LabUser,
  RentalStatus,
  ReservationStatus,
  TaskStatus,
  ComponentCondition,
} from '../types';
import {
  INITIAL_COMPONENTS,
  INITIAL_RENTALS,
  INITIAL_RESERVATIONS,
  INITIAL_TASKS,
  INITIAL_LOGS,
} from './initialData';
import {
  db,
  isFirestoreConfigured,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
} from './firebase';

const STORAGE_KEYS = {
  COMPONENTS: 'lab_components_v1',
  RENTALS: 'lab_rentals_v1',
  RESERVATIONS: 'lab_reservations_v1',
  TASKS: 'lab_tasks_v1',
  LOGS: 'lab_logs_v1',
};

// BroadcastChannel for instant cross-tab real-time sync when on local storage
const broadcastChannel = typeof BroadcastChannel !== 'undefined'
  ? new BroadcastChannel('component_lab_sync_channel')
  : null;

type Listener<T> = (data: T) => void;

class LabStorageService {
  private components: ElectronicComponent[] = [];
  private rentals: RentalRecord[] = [];
  private reservations: ComponentReservation[] = [];
  private tasks: LabTask[] = [];
  private logs: LabAuditLog[] = [];

  private componentListeners: Set<Listener<ElectronicComponent[]>> = new Set();
  private rentalListeners: Set<Listener<RentalRecord[]>> = new Set();
  private reservationListeners: Set<Listener<ComponentReservation[]>> = new Set();
  private taskListeners: Set<Listener<LabTask[]>> = new Set();
  private logListeners: Set<Listener<LabAuditLog[]>> = new Set();
  private statusListeners: Set<Listener<{ isCloud: boolean; projectId?: string }>> = new Set();

  private isCloudActive = false;
  private initialized = false;

  constructor() {
    this.init();
  }

  private async init() {
    if (this.initialized) return;
    this.initialized = true;

    // 1. Instantly load local data so UI renders immediately with zero lag or blank screen
    this.loadFromLocalStorage();
    this.notifyAll();

    // 2. Set up multi-tab synchronization
    if (broadcastChannel) {
      broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'SYNC_ALL') {
          this.loadFromLocalStorage();
          this.notifyAll();
        }
      };
    }

    // 3. Connect to Firestore if configured
    if (isFirestoreConfigured() && db) {
      try {
        await this.initFirestoreSync();
      } catch (err) {
        console.warn('Firestore initial sync notice, operating in offline/local storage mode:', err);
        this.isCloudActive = false;
        this.notifyStatus();
      }
    }
  }

  private notifyStatus() {
    const status = {
      isCloud: this.isCloudActive,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'components-c0a20',
    };
    this.statusListeners.forEach((fn) => fn(status));
  }

  public getStorageStatus() {
    return {
      isCloud: this.isCloudActive,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'components-c0a20',
    };
  }

  public subscribeStorageStatus(fn: Listener<{ isCloud: boolean; projectId?: string }>) {
    this.statusListeners.add(fn);
    fn(this.getStorageStatus());
    return () => this.statusListeners.delete(fn);
  }

  private async initFirestoreSync() {
    if (!db) return;

    // Components listener
    onSnapshot(collection(db, 'components'), (snapshot) => {
      if (snapshot.empty) {
        // Seed initial components to Firestore in background
        INITIAL_COMPONENTS.forEach((item) => {
          if (db) setDoc(doc(db, 'components', item.id), item).catch(() => {});
        });
        if (this.components.length === 0) {
          this.components = [...INITIAL_COMPONENTS];
        }
      } else {
        this.components = snapshot.docs.map((d) => d.data() as ElectronicComponent);
      }
      this.isCloudActive = true;
      this.notifyStatus();
      this.saveToLocal();
      this.notifyComponents();
    }, (error) => {
      console.warn('Firestore components listener warning:', error?.message || error);
      this.isCloudActive = false;
      this.notifyStatus();
    });

    // Rentals listener
    onSnapshot(collection(db, 'rentals'), (snapshot) => {
      if (snapshot.empty) {
        INITIAL_RENTALS.forEach((item) => {
          if (db) setDoc(doc(db, 'rentals', item.id), item).catch(() => {});
        });
        if (this.rentals.length === 0) {
          this.rentals = [...INITIAL_RENTALS];
        }
      } else {
        this.rentals = snapshot.docs.map((d) => d.data() as RentalRecord);
      }
      this.isCloudActive = true;
      this.notifyStatus();
      this.saveToLocal();
      this.notifyRentals();
    }, (error) => {
      console.warn('Firestore rentals listener warning:', error?.message || error);
      this.isCloudActive = false;
      this.notifyStatus();
    });

    // Reservations listener
    onSnapshot(collection(db, 'reservations'), (snapshot) => {
      if (snapshot.empty) {
        INITIAL_RESERVATIONS.forEach((item) => {
          if (db) setDoc(doc(db, 'reservations', item.id), item).catch(() => {});
        });
        if (this.reservations.length === 0) {
          this.reservations = [...INITIAL_RESERVATIONS];
        }
      } else {
        this.reservations = snapshot.docs.map((d) => d.data() as ComponentReservation);
      }
      this.isCloudActive = true;
      this.notifyStatus();
      this.saveToLocal();
      this.notifyReservations();
    }, (error) => {
      console.warn('Firestore reservations listener warning:', error?.message || error);
      this.isCloudActive = false;
      this.notifyStatus();
    });

    // Tasks listener
    onSnapshot(collection(db, 'tasks'), (snapshot) => {
      if (snapshot.empty) {
        INITIAL_TASKS.forEach((item) => {
          if (db) setDoc(doc(db, 'tasks', item.id), item).catch(() => {});
        });
        if (this.tasks.length === 0) {
          this.tasks = [...INITIAL_TASKS];
        }
      } else {
        this.tasks = snapshot.docs.map((d) => d.data() as LabTask);
      }
      this.isCloudActive = true;
      this.notifyStatus();
      this.saveToLocal();
      this.notifyTasks();
    }, (error) => {
      console.warn('Firestore tasks listener warning:', error?.message || error);
      this.isCloudActive = false;
      this.notifyStatus();
    });

    // Logs listener
    onSnapshot(collection(db, 'audit_logs'), (snapshot) => {
      if (snapshot.empty) {
        INITIAL_LOGS.forEach((item) => {
          if (db) setDoc(doc(db, 'audit_logs', item.id), item).catch(() => {});
        });
        if (this.logs.length === 0) {
          this.logs = [...INITIAL_LOGS];
        }
      } else {
        this.logs = snapshot.docs.map((d) => d.data() as LabAuditLog);
      }
      this.isCloudActive = true;
      this.notifyStatus();
      this.saveToLocal();
      this.notifyLogs();
    }, (error) => {
      console.warn('Firestore audit logs listener warning:', error?.message || error);
      this.isCloudActive = false;
      this.notifyStatus();
    });
  }

  private loadFromLocalStorage() {
    try {
      const storedComp = localStorage.getItem(STORAGE_KEYS.COMPONENTS);
      this.components = storedComp ? JSON.parse(storedComp) : [...INITIAL_COMPONENTS];

      const storedRentals = localStorage.getItem(STORAGE_KEYS.RENTALS);
      this.rentals = storedRentals ? JSON.parse(storedRentals) : [...INITIAL_RENTALS];

      const storedRes = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
      this.reservations = storedRes ? JSON.parse(storedRes) : [...INITIAL_RESERVATIONS];

      const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      this.tasks = storedTasks ? JSON.parse(storedTasks) : [...INITIAL_TASKS];

      const storedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
      this.logs = storedLogs ? JSON.parse(storedLogs) : [...INITIAL_LOGS];
    } catch (e) {
      console.error('Error reading localStorage, using defaults:', e);
      this.components = [...INITIAL_COMPONENTS];
      this.rentals = [...INITIAL_RENTALS];
      this.reservations = [...INITIAL_RESERVATIONS];
      this.tasks = [...INITIAL_TASKS];
      this.logs = [...INITIAL_LOGS];
    }
  }

  private saveToLocal() {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPONENTS, JSON.stringify(this.components));
      localStorage.setItem(STORAGE_KEYS.RENTALS, JSON.stringify(this.rentals));
      localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(this.reservations));
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(this.tasks));
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(this.logs));
      if (broadcastChannel) {
        broadcastChannel.postMessage({ type: 'SYNC_ALL' });
      }
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }

  private notifyComponents() {
    this.componentListeners.forEach((fn) => fn([...this.components]));
  }
  private notifyRentals() {
    this.rentalListeners.forEach((fn) => fn([...this.rentals]));
  }
  private notifyReservations() {
    this.reservationListeners.forEach((fn) => fn([...this.reservations]));
  }
  private notifyTasks() {
    this.taskListeners.forEach((fn) => fn([...this.tasks]));
  }
  private notifyLogs() {
    this.logListeners.forEach((fn) => fn([...this.logs]));
  }

  private notifyAll() {
    this.notifyComponents();
    this.notifyRentals();
    this.notifyReservations();
    this.notifyTasks();
    this.notifyLogs();
  }

  // --- Subscriptions ---
  public subscribeComponents(fn: Listener<ElectronicComponent[]>) {
    this.componentListeners.add(fn);
    fn([...this.components]);
    return () => this.componentListeners.delete(fn);
  }

  public subscribeRentals(fn: Listener<RentalRecord[]>) {
    this.rentalListeners.add(fn);
    fn([...this.rentals]);
    return () => this.rentalListeners.delete(fn);
  }

  public subscribeReservations(fn: Listener<ComponentReservation[]>) {
    this.reservationListeners.add(fn);
    fn([...this.reservations]);
    return () => this.reservationListeners.delete(fn);
  }

  public subscribeTasks(fn: Listener<LabTask[]>) {
    this.taskListeners.add(fn);
    fn([...this.tasks]);
    return () => this.taskListeners.delete(fn);
  }

  public subscribeLogs(fn: Listener<LabAuditLog[]>) {
    this.logListeners.add(fn);
    fn([...this.logs]);
    return () => this.logListeners.delete(fn);
  }

  // --- Audit Log Helper ---
  public async logAction(
    action: string,
    user: LabUser,
    details: string,
    category: 'inventory' | 'rental' | 'reservation' | 'task' | 'system'
  ) {
    const newLog: LabAuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      action,
      performedBy: `${user.name} (${user.designation})`,
      role: user.role,
      details,
      category,
    };

    this.logs = [newLog, ...this.logs];
    this.saveToLocal();
    this.notifyLogs();

    if (this.isCloudActive && db) {
      setDoc(doc(db, 'audit_logs', newLog.id), newLog).catch((err) => {
        console.warn('Firestore audit log sync notice:', err?.message || err);
      });
    }
  }

  // --- Component Actions ---
  public async saveComponent(component: ElectronicComponent, user: LabUser) {
    const existingIndex = this.components.findIndex((c) => c.id === component.id);
    const isNew = existingIndex === -1;

    if (isNew) {
      this.components = [component, ...this.components];
    } else {
      this.components = this.components.map((c) => (c.id === component.id ? component : c));
    }

    this.saveToLocal();
    this.notifyComponents();

    if (this.isCloudActive && db) {
      setDoc(doc(db, 'components', component.id), component).catch((err) => {
        console.warn('Firestore saveComponent sync notice:', err?.message || err);
      });
    }

    await this.logAction(
      isNew ? 'Added New Component' : 'Updated Component Specs',
      user,
      `${isNew ? 'Added' : 'Updated'} ${component.name} (${component.modelNumber}) at ${component.location.rack} - ${component.location.shelf} - ${component.location.bin}`,
      'inventory'
    );
  }

  public async adjustComponentStock(
    componentId: string,
    deltaAvailable: number,
    deltaMaintenance: number,
    user: LabUser,
    reason: string
  ) {
    const target = this.components.find((c) => c.id === componentId);
    if (!target) return;

    const updated: ElectronicComponent = {
      ...target,
      availableQuantity: Math.max(0, target.availableQuantity + deltaAvailable),
      inMaintenanceQuantity: Math.max(0, target.inMaintenanceQuantity + deltaMaintenance),
      totalQuantity: Math.max(0, target.totalQuantity + deltaAvailable + deltaMaintenance),
      lastAuditedAt: new Date().toISOString().split('T')[0],
    };

    await this.saveComponent(updated, user);
    await this.logAction(
      'Stock Adjusted',
      user,
      `Adjusted stock for ${target.name}: Available ${deltaAvailable >= 0 ? '+' : ''}${deltaAvailable}, Maintenance ${deltaMaintenance >= 0 ? '+' : ''}${deltaMaintenance}. Reason: ${reason}`,
      'inventory'
    );
  }

  // --- Rental / Issue & Return Lifecycle ---
  public async issueRental(
    data: {
      componentId: string;
      quantity: number;
      studentRollNo: string;
      studentName: string;
      studentEmail: string;
      studentDepartment: string;
      studentSemester: string;
      studentPhone: string;
      expectedReturnDate: string;
      accessoriesIssued: string[];
      notes?: string;
    },
    user: LabUser
  ): Promise<RentalRecord> {
    const component = this.components.find((c) => c.id === data.componentId);
    if (!component) throw new Error('Component not found');
    if (component.availableQuantity < data.quantity) {
      throw new Error(`Insufficient available stock (${component.availableQuantity} available)`);
    }

    const gatePassNumber = `GP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRental: RentalRecord = {
      id: 'rent-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      componentId: component.id,
      componentName: component.name,
      componentModel: component.modelNumber,
      quantity: data.quantity,
      studentRollNo: data.studentRollNo,
      studentName: data.studentName,
      studentEmail: data.studentEmail,
      studentDepartment: data.studentDepartment,
      studentSemester: data.studentSemester,
      studentPhone: data.studentPhone,
      issuedBy: {
        id: user.id,
        name: user.name,
        role: user.role === 'incharge' ? 'incharge' : 'instructor',
      },
      issuedAt: new Date().toISOString(),
      expectedReturnDate: data.expectedReturnDate,
      status: 'active',
      conditionOnIssue: component.condition,
      accessoriesIssued: data.accessoriesIssued,
      fineAmount: 0,
      fineStatus: 'none',
      notes: data.notes,
      gatePassNumber,
    };

    // Update component stock
    const updatedComponent: ElectronicComponent = {
      ...component,
      availableQuantity: component.availableQuantity - data.quantity,
      rentedQuantity: component.rentedQuantity + data.quantity,
    };

    this.rentals = [newRental, ...this.rentals];
    this.components = this.components.map((c) => (c.id === component.id ? updatedComponent : c));

    this.saveToLocal();
    this.notifyRentals();
    this.notifyComponents();

    if (this.isCloudActive && db) {
      setDoc(doc(db, 'rentals', newRental.id), newRental).catch((err) => {
        console.warn('Firestore issueRental sync notice:', err?.message || err);
      });
      setDoc(doc(db, 'components', updatedComponent.id), updatedComponent).catch((err) => {
        console.warn('Firestore component stock sync notice:', err?.message || err);
      });
    }

    await this.logAction(
      'Issued Equipment (Gate Pass Generated)',
      user,
      `Issued ${data.quantity}x ${component.name} to ${data.studentName} (${data.studentRollNo}). Gate Pass: ${gatePassNumber}`,
      'rental'
    );

    return newRental;
  }

  public async returnRental(
    rentalId: string,
    returnData: {
      conditionOnReturn: ComponentCondition;
      fineAmount: number;
      fineStatus: 'none' | 'pending' | 'paid' | 'waived';
      notes?: string;
      sendToMaintenance?: boolean;
    },
    user: LabUser
  ) {
    const rental = this.rentals.find((r) => r.id === rentalId);
    if (!rental) throw new Error('Rental record not found');

    const component = this.components.find((c) => c.id === rental.componentId);

    const isDamaged = returnData.conditionOnReturn === 'Damaged' || returnData.sendToMaintenance;
    const finalStatus: RentalStatus = returnData.conditionOnReturn === 'Damaged' ? 'damaged' : 'returned';

    const updatedRental: RentalRecord = {
      ...rental,
      actualReturnDate: new Date().toISOString(),
      status: finalStatus,
      conditionOnReturn: returnData.conditionOnReturn,
      returnInspectedBy: {
        id: user.id,
        name: user.name,
        role: user.role === 'incharge' ? 'incharge' : 'instructor',
      },
      fineAmount: returnData.fineAmount,
      fineStatus: returnData.fineStatus,
      notes: returnData.notes ? `${rental.notes || ''} | Return: ${returnData.notes}` : rental.notes,
    };

    this.rentals = this.rentals.map((r) => (r.id === rentalId ? updatedRental : r));

    if (component) {
      const updatedComponent: ElectronicComponent = {
        ...component,
        rentedQuantity: Math.max(0, component.rentedQuantity - rental.quantity),
        availableQuantity: isDamaged
          ? component.availableQuantity
          : component.availableQuantity + rental.quantity,
        inMaintenanceQuantity: isDamaged
          ? component.inMaintenanceQuantity + rental.quantity
          : component.inMaintenanceQuantity,
      };
      this.components = this.components.map((c) => (c.id === component.id ? updatedComponent : c));

      if (this.isCloudActive && db) {
        setDoc(doc(db, 'components', updatedComponent.id), updatedComponent).catch((err) => {
          console.warn('Firestore return component sync notice:', err?.message || err);
        });
      }
    }

    this.saveToLocal();
    this.notifyRentals();
    this.notifyComponents();

    if (this.isCloudActive && db) {
      setDoc(doc(db, 'rentals', updatedRental.id), updatedRental).catch((err) => {
        console.warn('Firestore returnRental sync notice:', err?.message || err);
      });
    }

    await this.logAction(
      'Processed Return & Inspection',
      user,
      `Inspected return of ${rental.quantity}x ${rental.componentName} from ${rental.studentName}. Condition: ${returnData.conditionOnReturn}. Fine: ₹${returnData.fineAmount}`,
      'rental'
    );
  }

  // --- Reservations ---
  public async createReservation(
    data: {
      componentId: string;
      quantity: number;
      studentRollNo: string;
      studentName: string;
      studentEmail: string;
      purpose: string;
      labCourseCode?: string;
      reservedFrom: string;
      reservedUntil: string;
    },
    user: LabUser
  ) {
    const component = this.components.find((c) => c.id === data.componentId);
    if (!component) throw new Error('Component not found');

    const newRes: ComponentReservation = {
      id: 'resv-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      componentId: component.id,
      componentName: component.name,
      componentModel: component.modelNumber,
      quantity: data.quantity,
      studentRollNo: data.studentRollNo,
      studentName: data.studentName,
      studentEmail: data.studentEmail,
      purpose: data.purpose,
      labCourseCode: data.labCourseCode,
      reservedFrom: data.reservedFrom,
      reservedUntil: data.reservedUntil,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    this.reservations = [newRes, ...this.reservations];
    this.saveToLocal();
    this.notifyReservations();

    if (this.isCloudActive && db) {
      setDoc(doc(db, 'reservations', newRes.id), newRes).catch((err) => {
        console.warn('Firestore createReservation sync notice:', err?.message || err);
      });
    }

    await this.logAction(
      'Reservation Requested',
      user,
      `Student ${data.studentName} (${data.studentRollNo}) requested reservation of ${data.quantity}x ${component.name}`,
      'reservation'
    );

    return newRes;
  }

  public async updateReservationStatus(
    reservationId: string,
    status: ReservationStatus,
    user: LabUser,
    rejectionReason?: string
  ) {
    const res = this.reservations.find((r) => r.id === reservationId);
    if (!res) return;

    const component = this.components.find((c) => c.id === res.componentId);

    const updatedRes: ComponentReservation = {
      ...res,
      status,
      reviewedBy: {
        id: user.id,
        name: user.name,
        role: user.role === 'incharge' ? 'incharge' : 'instructor',
      },
      reviewedAt: new Date().toISOString(),
      rejectionReason: rejectionReason || res.rejectionReason,
    };

    this.reservations = this.reservations.map((r) => (r.id === reservationId ? updatedRes : r));

    // If approving, adjust available -> reserved
    if (status === 'approved' && component && res.status !== 'approved') {
      const updatedComp: ElectronicComponent = {
        ...component,
        availableQuantity: Math.max(0, component.availableQuantity - res.quantity),
        reservedQuantity: component.reservedQuantity + res.quantity,
      };
      this.components = this.components.map((c) => (c.id === component.id ? updatedComp : c));
      if (this.isCloudActive && db) {
        setDoc(doc(db, 'components', updatedComp.id), updatedComp).catch((err) => {
          console.warn('Firestore component sync notice:', err?.message || err);
        });
      }
    } else if (res.status === 'approved' && (status === 'rejected' || status === 'cancelled') && component) {
      // Revert reservation back to available
      const updatedComp: ElectronicComponent = {
        ...component,
        availableQuantity: component.availableQuantity + res.quantity,
        reservedQuantity: Math.max(0, component.reservedQuantity - res.quantity),
      };
      this.components = this.components.map((c) => (c.id === component.id ? updatedComp : c));
      if (this.isCloudActive && db) {
        setDoc(doc(db, 'components', updatedComp.id), updatedComp).catch((err) => {
          console.warn('Firestore component sync notice:', err?.message || err);
        });
      }
    }

    this.saveToLocal();
    this.notifyReservations();
    this.notifyComponents();

    if (this.isCloudActive && db) {
      setDoc(doc(db, 'reservations', updatedRes.id), updatedRes).catch((err) => {
        console.warn('Firestore updateReservationStatus sync notice:', err?.message || err);
      });
    }

    await this.logAction(
      `Reservation ${status.toUpperCase()}`,
      user,
      `Reservation for ${res.componentName} (${res.studentName}) marked as ${status}${rejectionReason ? ': ' + rejectionReason : ''}`,
      'reservation'
    );
  }

  // --- Lab Tasks Management ---
  public async saveTask(task: LabTask, user: LabUser) {
    const isNew = !this.tasks.some((t) => t.id === task.id);

    if (isNew) {
      this.tasks = [task, ...this.tasks];
    } else {
      this.tasks = this.tasks.map((t) => (t.id === task.id ? task : t));
    }

    this.saveToLocal();
    this.notifyTasks();

    if (this.isCloudActive && db) {
      setDoc(doc(db, 'tasks', task.id), task).catch((err) => {
        console.warn('Firestore saveTask sync notice:', err?.message || err);
      });
    }

    await this.logAction(
      isNew ? 'Created Lab Task' : 'Updated Task Details',
      user,
      `${isNew ? 'Created' : 'Updated'} task: "${task.title}" (Assigned to ${task.assignedTo.name})`,
      'task'
    );
  }

  public async updateTaskStatus(taskId: string, status: TaskStatus, user: LabUser) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updated: LabTask = {
      ...task,
      status,
      completedAt: status === 'completed' ? new Date().toISOString() : undefined,
    };

    await this.saveTask(updated, user);
  }

  public async toggleChecklistItem(taskId: string, itemId: string, user: LabUser) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedChecklist = task.checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    const allDone = updatedChecklist.every((item) => item.completed);
    const updated: LabTask = {
      ...task,
      checklist: updatedChecklist,
      status: allDone && task.status !== 'completed' ? 'completed' : task.status,
      completedAt: allDone ? new Date().toISOString() : task.completedAt,
    };

    await this.saveTask(updated, user);
  }

  public async deleteTask(taskId: string, user: LabUser) {
    const task = this.tasks.find((t) => t.id === taskId);
    this.tasks = this.tasks.filter((t) => t.id !== taskId);

    this.saveToLocal();
    this.notifyTasks();

    if (this.isCloudActive && db) {
      deleteDoc(doc(db, 'tasks', taskId)).catch((err) => {
        console.warn('Firestore deleteTask sync notice:', err?.message || err);
      });
    }

    if (task) {
      await this.logAction('Deleted Lab Task', user, `Deleted task "${task.title}"`, 'task');
    }
  }

  // --- Convenience Wrappers ---
  public subscribeAuditLogs(fn: Listener<LabAuditLog[]>) {
    return this.subscribeLogs(fn);
  }

  public async addComponent(component: ElectronicComponent, user: LabUser) {
    return this.saveComponent(component, user);
  }

  public async adjustStock(
    componentId: string,
    action: 'add_stock' | 'send_to_maintenance' | 'retire_damaged' | 'return_from_maintenance',
    quantity: number,
    notes: string,
    user: LabUser
  ) {
    let deltaAvailable = 0;
    let deltaMaintenance = 0;

    switch (action) {
      case 'add_stock':
        deltaAvailable = quantity;
        break;
      case 'send_to_maintenance':
        deltaAvailable = -quantity;
        deltaMaintenance = quantity;
        break;
      case 'return_from_maintenance':
        deltaMaintenance = -quantity;
        deltaAvailable = quantity;
        break;
      case 'retire_damaged':
        deltaAvailable = -quantity;
        break;
    }

    return this.adjustComponentStock(componentId, deltaAvailable, deltaMaintenance, user, notes);
  }

  public async addReservation(reservation: ComponentReservation, user?: LabUser) {
    this.reservations = [reservation, ...this.reservations];
    this.saveToLocal();
    this.notifyReservations();

    if (this.isCloudActive && db) {
      setDoc(doc(db, 'reservations', reservation.id), reservation).catch((err) => {
        console.warn('Firestore addReservation sync notice:', err?.message || err);
      });
    }
  }

  public async addTask(task: LabTask, user?: LabUser) {
    const actingUser = user || {
      id: task.assignedBy.id,
      name: task.assignedBy.name,
      role: 'incharge' as const,
      designation: 'Lab Incharge',
      department: 'ECE',
      email: 'lab@univ.edu',
    };
    return this.saveTask(task, actingUser);
  }

  public async toggleTaskChecklist(taskId: string, itemId: string, user?: LabUser) {
    const actingUser = user || {
      id: 'system',
      name: 'Lab Staff',
      role: 'instructor' as const,
      designation: 'Staff',
      department: 'ECE',
      email: 'staff@univ.edu',
    };
    return this.toggleChecklistItem(taskId, itemId, actingUser);
  }

  // --- Reset to Demo Data ---
  public async resetDemoData(user?: LabUser) {
    this.components = [...INITIAL_COMPONENTS];
    this.rentals = [...INITIAL_RENTALS];
    this.reservations = [...INITIAL_RESERVATIONS];
    this.tasks = [...INITIAL_TASKS];
    this.logs = [...INITIAL_LOGS];

    this.saveToLocal();
    this.notifyAll();

    const actingUser = user || {
      id: 'admin',
      name: 'Lab Administrator',
      role: 'incharge' as const,
      designation: 'Incharge',
      department: 'ECE',
      email: 'admin@univ.edu',
    };
    await this.logAction('System Reset to Default Lab Catalog', actingUser, 'All components, rentals, and tasks reset to demo defaults', 'system');
  }
}

export const labStorage = new LabStorageService();
