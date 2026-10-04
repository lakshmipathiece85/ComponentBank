import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AnalyticsAndAlerts } from './components/AnalyticsAndAlerts';
import { InventoryView } from './components/InventoryView';
import { RentalsView } from './components/RentalsView';
import { ReservationsView } from './components/ReservationsView';
import { TasksView } from './components/TasksView';
import { AuditLogsView } from './components/AuditLogsView';

import { IssueEquipmentModal } from './components/IssueEquipmentModal';
import { ReturnEquipmentModal } from './components/ReturnEquipmentModal';
import { ReceiptModal } from './components/ReceiptModal';
import { AddComponentModal } from './components/AddComponentModal';
import { NewTaskModal } from './components/NewTaskModal';
import { ReservationModal } from './components/ReservationModal';
import { AdjustStockModal } from './components/AdjustStockModal';
import { ComponentDetailModal } from './components/ComponentDetailModal';
import { CollegeLogo, DepartmentLogo, ClubLogo } from './components/CollegeLogo';
import { RoleLoginPortal } from './components/RoleLoginPortal';

import { labStorage } from './services/labStorage';
import {
  ElectronicComponent,
  RentalRecord,
  ComponentReservation,
  LabTask,
  LabAuditLog,
  LabUser,
  NavigationTab,
  TaskStatus,
  ComponentCondition,
} from './types';
import { DEFAULT_USERS, LAB_USERS } from './services/initialData';
import { Lock, KeyRound, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Authentication status: component details are only visible once logged in
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('kec_ece_auth_active') === 'true';
  });

  // Current logged in user (restored from session or defaulted)
  const [currentUser, setCurrentUser] = useState<LabUser>(() => {
    const saved = sessionStorage.getItem('kec_ece_logged_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'hod' && parsed.name?.includes('Sunil')) {
          parsed.name = 'Dr. G.N Kodandaramaiah';
          parsed.designation = 'Professor & HoD ECE, R&D Director';
          sessionStorage.setItem('kec_ece_logged_user', JSON.stringify(parsed));
        }
        if (parsed.role === 'incharge' && (parsed.name?.includes('Lakshmipathi') || !parsed.designation?.includes('Associate Professor in ECE'))) {
          parsed.name = 'Dr. M. Lakshmipathy';
          parsed.designation = 'Associate Professor in ECE & Lab Incharge';
          sessionStorage.setItem('kec_ece_logged_user', JSON.stringify(parsed));
        }
        if (parsed.role === 'student') {
          sessionStorage.setItem('kec_ece_logged_user', JSON.stringify(DEFAULT_USERS[1]));
          return DEFAULT_USERS[1];
        }
        return parsed;
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_USERS[0];
  });

  const [activeTab, setActiveTab] = useState<NavigationTab>('inventory');

  // Real-time subscribed data states
  const [components, setComponents] = useState<ElectronicComponent[]>([]);
  const [rentals, setRentals] = useState<RentalRecord[]>([]);
  const [reservations, setReservations] = useState<ComponentReservation[]>([]);
  const [tasks, setTasks] = useState<LabTask[]>([]);
  const [auditLogs, setAuditLogs] = useState<LabAuditLog[]>([]);
  const [storageStatus, setStorageStatus] = useState<{ isCloud: boolean; projectId?: string }>(() =>
    labStorage.getStorageStatus()
  );

  // Modals visibility states
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isAddComponentModalOpen, setIsAddComponentModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Selected entities for modals
  const [selectedComponent, setSelectedComponent] = useState<ElectronicComponent | null>(null);
  const [selectedRental, setSelectedRental] = useState<RentalRecord | null>(null);
  const [rentalsFilter, setRentalsFilter] = useState<'all' | 'active' | 'overdue' | 'returned'>('all');

  // Theme: fixed to light blue theme
  const theme = 'light';

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('kec_ece_auth_active');
    sessionStorage.removeItem('kec_ece_logged_user');
    setIsDetailModalOpen(false);
    setIsIssueModalOpen(false);
    setIsReturnModalOpen(false);
    setIsReceiptModalOpen(false);
    setIsAddComponentModalOpen(false);
    setIsNewTaskModalOpen(false);
    setIsReservationModalOpen(false);
    setIsAdjustStockModalOpen(false);
    showToast('Signed out successfully. Component details are now locked.');
  };

  // Subscribe to central reactive labStorage
  useEffect(() => {
    const unsubComp = labStorage.subscribeComponents((data) => setComponents(data));
    const unsubRent = labStorage.subscribeRentals((data) => setRentals(data));
    const unsubRes = labStorage.subscribeReservations((data) => setReservations(data));
    const unsubTask = labStorage.subscribeTasks((data) => setTasks(data));
    const unsubAudit = labStorage.subscribeAuditLogs((data) => setAuditLogs(data));
    const unsubStatus = labStorage.subscribeStorageStatus((status) => setStorageStatus(status));

    return () => {
      unsubComp();
      unsubRent();
      unsubRes();
      unsubTask();
      unsubAudit();
      unsubStatus();
    };
  }, []);

  // Handlers: Issue Equipment
  const handleConfirmIssue = async (data: {
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
  }) => {
    const issuedRental = await labStorage.issueRental(data, currentUser);
    showToast(`Gate Pass ${issuedRental.gatePassNumber} generated for ${data.studentName}!`);
    // Automatically present official gate pass printable slip
    setSelectedRental(issuedRental);
    setIsReceiptModalOpen(true);
  };

  // Handlers: Return Equipment
  const handleConfirmReturn = async (
    rentalId: string,
    returnData: {
      conditionOnReturn: ComponentCondition;
      fineAmount: number;
      fineStatus: 'none' | 'pending' | 'paid' | 'waived';
      notes?: string;
      sendToMaintenance?: boolean;
    }
  ) => {
    await labStorage.returnRental(rentalId, returnData, currentUser);
    showToast('Equipment return verified & inventory restocked.');
  };

  // Handlers: Save Component
  const handleSaveComponent = async (comp: ElectronicComponent) => {
    await labStorage.addComponent(comp, currentUser);
    showToast(`Registered "${comp.name}" into lab inventory catalog.`);
  };

  // Handlers: Adjust Stock
  const handleConfirmAdjustment = async (
    componentId: string,
    action: 'add_stock' | 'send_to_maintenance' | 'retire_damaged' | 'return_from_maintenance',
    quantity: number,
    notes: string
  ) => {
    await labStorage.adjustStock(componentId, action, quantity, notes, currentUser);
    showToast('Inventory stock adjustment recorded.');
  };

  // Handlers: Reservations
  const handleSaveReservation = async (reservation: ComponentReservation) => {
    await labStorage.addReservation(reservation);
    showToast(`Reservation request for "${reservation.componentName}" submitted.`);
  };

  const handleApproveReservation = async (resId: string) => {
    await labStorage.updateReservationStatus(resId, 'approved', currentUser);
    showToast('Reservation approved. Equipment reserved in inventory.');
  };

  const handleRejectReservation = async (resId: string, reason?: string) => {
    await labStorage.updateReservationStatus(resId, 'rejected', currentUser, reason);
    showToast('Reservation request declined.');
  };

  const handleFulfillReservation = (res: ComponentReservation) => {
    const comp = components.find((c) => c.id === res.componentId);
    setSelectedComponent(comp || null);
    setIsIssueModalOpen(true);
  };

  // Handlers: Tasks
  const handleSaveTask = async (task: LabTask) => {
    await labStorage.addTask(task);
    showToast(`Duty assigned to ${task.assignedTo.name}.`);
  };

  const handleUpdateTaskStatus = async (taskId: string, status: TaskStatus) => {
    await labStorage.updateTaskStatus(taskId, status, currentUser);
  };

  const handleToggleChecklistItem = async (taskId: string, itemId: string) => {
    await labStorage.toggleTaskChecklist(taskId, itemId, currentUser);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Delete this task?')) {
      await labStorage.deleteTask(taskId, currentUser);
      showToast('Task removed.');
    }
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset lab data back to official initial state?')) {
      labStorage.resetDemoData(currentUser);
      showToast('Lab demo database reset to factory state.');
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 selection:bg-teal-500 selection:text-white ${
        theme === 'light'
          ? 'bg-[#e0f2fe] text-slate-900 light-theme'
          : 'bg-slate-950 text-slate-100 dark-theme'
      }`}
    >
      {/* Toast notification banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-teal-600 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-teal-400/40 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Topmost Institutional Header: College Name and Logos only */}
      <header
        className={`w-full border-b py-3 sm:py-4 px-4 sm:px-6 transition-colors ${
          theme === 'light'
            ? 'bg-white border-slate-200 text-slate-900 shadow-xs'
            : 'bg-slate-900 border-slate-800 text-white shadow-md'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <DepartmentLogo
            size="xl"
            className="border-2 border-blue-400 shadow-md ring-2 ring-blue-500/20"
          />
          <div className="text-center px-2 flex-1">
            <h1
              className={`text-lg sm:text-2xl md:text-3xl font-black tracking-tight ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}
            >
              Kuppam Engineering College
            </h1>
            <p
              className={`text-xs sm:text-sm font-medium mt-0.5 tracking-wide ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              KES Nagar, Kuppam -517425, Andhra Pradesh
            </p>
          </div>
          <ClubLogo
            size="xl"
            className="border-2 border-amber-400 shadow-md ring-2 ring-amber-500/20"
          />
        </div>
      </header>

      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        onSwitchRole={(role) => {
          const u = DEFAULT_USERS.find((user) => user.role === role) || LAB_USERS[role];
          if (u) {
            setCurrentUser(u);
            setIsLoggedIn(true);
            sessionStorage.setItem('kec_ece_auth_active', 'true');
            sessionStorage.setItem('kec_ece_logged_user', JSON.stringify(u));
            showToast(`Authenticated and switched to ${u.name} (${u.designation}).`);
          }
        }}
        availableUsers={DEFAULT_USERS}
        storageStatus={storageStatus}
        overdueCount={rentals.filter((r) => r.status === 'overdue').length}
        pendingReservationsCount={reservations.filter((r) => r.status === 'pending').length}
        tasksCount={tasks.filter((t) => t.status !== 'completed').length}
        theme={theme}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onUpdateAvatar={(newUrl) => {
          const updated = { ...currentUser, avatarUrl: newUrl };
          setCurrentUser(updated);
          sessionStorage.setItem('kec_ece_logged_user', JSON.stringify(updated));
          showToast('Profile photo updated successfully!');
        }}
        onOpenIssueModal={() => {
          setSelectedComponent(null);
          setIsIssueModalOpen(true);
        }}
        onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
        onResetDemo={handleResetDemo}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Institutional Role Logins Portal: HoD, Lab Incharges, Lab Instructors, Students */}
        <RoleLoginPortal
          currentUser={currentUser}
          availableUsers={DEFAULT_USERS}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          onSelectRole={(role, customUser) => {
            if (customUser) {
              setCurrentUser(customUser);
              setIsLoggedIn(true);
              sessionStorage.setItem('kec_ece_auth_active', 'true');
              sessionStorage.setItem('kec_ece_logged_user', JSON.stringify(customUser));
              showToast(`Logged in as ${customUser.name} (${customUser.designation}). Component details are now unlocked.`);
            } else {
              const u = DEFAULT_USERS.find((user) => user.role === role) || LAB_USERS[role];
              if (u) {
                setCurrentUser(u);
                setIsLoggedIn(true);
                sessionStorage.setItem('kec_ece_auth_active', 'true');
                sessionStorage.setItem('kec_ece_logged_user', JSON.stringify(u));
                showToast(`Logged in as ${u.name} (${u.designation}). Component details are now unlocked.`);
              }
            }
          }}
        />

        {/* LOCKED STATE: When user is NOT logged in, component details are hidden */}
        {!isLoggedIn ? (
          <div className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-8 sm:p-12 text-center backdrop-blur-md relative overflow-hidden shadow-xl">
            {/* Background subtle glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400 shadow-md">
              <Lock className="w-8 h-8" />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Component Details Locked
            </h3>
            <p className="text-sm text-slate-300 max-w-xl mx-auto mt-2 leading-relaxed">
              In accordance with laboratory inventory regulations, component specifications, live stock availability, equipment reservations, and rental records are visible only to verified department personnel.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mt-6 text-left">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">70+ Lab Components</strong>
                  <span className="text-slate-400">Microcontrollers, ICs, sensors & optical modules</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">Live Stock & Benches</strong>
                  <span className="text-slate-400">Real-time bin allocations and lab bench availability</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-start gap-2.5">
                <KeyRound className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">Digital Gate Passes</strong>
                  <span className="text-slate-400">Institutional checkouts, reservations and returns</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="text-xs text-amber-300 font-medium px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                Please click any of the role profiles above to log in and unlock all component details.
              </div>
            </div>
          </div>
        ) : (
          /* UNLOCKED STATE: Component Details, Analytics, and Operational Tabs are Visible */
          <>
            {/* Lab Metrics Dashboard and Real-Time Alerts */}
            <AnalyticsAndAlerts
              components={components}
              rentals={rentals}
              reservations={reservations}
              tasks={tasks}
              currentUser={currentUser}
              onNavigateRentals={(filter) => {
                setRentalsFilter(filter);
                setActiveTab('rentals');
              }}
              onNavigateReservations={() => setActiveTab('reservations')}
              onNavigateTasks={() => setActiveTab('tasks')}
            />

            {/* Tab View: Inventory */}
            {activeTab === 'inventory' && (
              <InventoryView
                components={components}
                currentUser={currentUser}
                onOpenAddComponentModal={() => setIsAddComponentModalOpen(true)}
                onOpenIssueModal={(comp) => {
                  setSelectedComponent(comp);
                  setIsIssueModalOpen(true);
                }}
                onOpenReserveModal={(comp) => {
                  setSelectedComponent(comp);
                  setIsReservationModalOpen(true);
                }}
                onOpenAdjustModal={(comp) => {
                  setSelectedComponent(comp);
                  setIsAdjustStockModalOpen(true);
                }}
                onOpenDetailModal={(comp) => {
                  setSelectedComponent(comp);
                  setIsDetailModalOpen(true);
                }}
              />
            )}

            {/* Tab View: Rentals & Gate Passes */}
            {activeTab === 'rentals' && (
              <RentalsView
                rentals={rentals}
                currentUser={currentUser}
                initialFilter={rentalsFilter}
                onOpenIssueModal={() => {
                  setSelectedComponent(null);
                  setIsIssueModalOpen(true);
                }}
                onOpenReturnModal={(rental) => {
                  setSelectedRental(rental);
                  setIsReturnModalOpen(true);
                }}
                onPrintReceipt={(rental) => {
                  setSelectedRental(rental);
                  setIsReceiptModalOpen(true);
                }}
              />
            )}

            {/* Tab View: Equipment Reservations */}
            {activeTab === 'reservations' && (
              <ReservationsView
                reservations={reservations}
                currentUser={currentUser}
                onOpenNewReservationModal={() => {
                  setSelectedComponent(null);
                  setIsReservationModalOpen(true);
                }}
                onApproveReservation={handleApproveReservation}
                onRejectReservation={handleRejectReservation}
                onFulfillReservation={handleFulfillReservation}
              />
            )}

            {/* Tab View: Lab Tasks & Bench Duties */}
            {activeTab === 'tasks' && (
              <TasksView
                tasks={tasks}
                currentUser={currentUser}
                onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onToggleChecklistItem={handleToggleChecklistItem}
                onDeleteTask={handleDeleteTask}
              />
            )}

            {/* Tab View: Audit Logs & Traceability */}
            {activeTab === 'audit' && (
              <AuditLogsView
                logs={auditLogs}
                currentUser={currentUser}
                onResetDemo={handleResetDemo}
              />
            )}
          </>
        )}
      </main>

      {/* Modals - only rendered and accessible when authenticated */}
      {isLoggedIn && (
        <>
          <IssueEquipmentModal
            isOpen={isIssueModalOpen}
            onClose={() => setIsIssueModalOpen(false)}
            components={components}
            preSelectedComponent={selectedComponent}
            currentUser={currentUser}
            onConfirmIssue={handleConfirmIssue}
          />

          <ReturnEquipmentModal
            isOpen={isReturnModalOpen}
            onClose={() => setIsReturnModalOpen(false)}
            rental={selectedRental}
            currentUser={currentUser}
            onConfirmReturn={handleConfirmReturn}
          />

          <ReceiptModal
            isOpen={isReceiptModalOpen}
            onClose={() => setIsReceiptModalOpen(false)}
            rental={selectedRental}
          />

          <AddComponentModal
            isOpen={isAddComponentModalOpen}
            onClose={() => setIsAddComponentModalOpen(false)}
            currentUser={currentUser}
            onSaveComponent={handleSaveComponent}
          />

          <NewTaskModal
            isOpen={isNewTaskModalOpen}
            onClose={() => setIsNewTaskModalOpen(false)}
            currentUser={currentUser}
            components={components}
            onSaveTask={handleSaveTask}
          />

          <ReservationModal
            isOpen={isReservationModalOpen}
            onClose={() => setIsReservationModalOpen(false)}
            components={components}
            preSelectedComponent={selectedComponent}
            currentUser={currentUser}
            onSaveReservation={handleSaveReservation}
          />

          <AdjustStockModal
            isOpen={isAdjustStockModalOpen}
            onClose={() => setIsAdjustStockModalOpen(false)}
            component={selectedComponent}
            currentUser={currentUser}
            onConfirmAdjustment={handleConfirmAdjustment}
          />

          <ComponentDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            component={selectedComponent}
            currentUser={currentUser}
            onOpenIssueModal={(comp) => {
              setSelectedComponent(comp);
              setIsIssueModalOpen(true);
            }}
            onOpenReserveModal={(comp) => {
              setSelectedComponent(comp);
              setIsReservationModalOpen(true);
            }}
            onOpenAdjustModal={(comp) => {
              setSelectedComponent(comp);
              setIsAdjustStockModalOpen(true);
            }}
          />
        </>
      )}
      {/* Institutional College Footer */}
      <footer className="mt-12 border-t border-slate-800 bg-slate-900/90 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <DepartmentLogo size="md" className="border-2 border-blue-400/80 shadow-md" />
            <div className="text-left">
              <div className="font-bold text-slate-200 text-sm">Kuppam Engineering College</div>
              <div className="text-slate-400 text-[11px]">KES Nagar, Kuppam-517425, Chittoor Dist., Andhra Pradesh</div>
              <div className="text-[11px] text-blue-400 font-semibold mt-0.5">Department of Electronics & Communication Engineering</div>
            </div>
          </div>
          <div className="flex items-center gap-3.5 sm:text-right">
            <div className="text-left sm:text-right">
              <div className="font-bold text-slate-200 text-sm">Nextgen ECE Innovators Club (NEIC)</div>
              <div className="text-[11px] text-amber-400 font-medium">Official ECE Technical Innovation & Robotics Club</div>
              <div className="text-slate-400 text-[11px]">Innovate Today, Lead Tomorrow • Component Lab Portal</div>
            </div>
            <ClubLogo size="md" className="border-2 border-amber-400/80 shadow-md" />
          </div>
        </div>
      </footer>
    </div>
  );
}
