'use client';

import { useEffect, useState } from 'react';
import { sessionsApi, Session } from '@/lib/api';
import StationCard from '@/components/StationCard';
import AddItemModal from '@/components/AddItemModal';
import SessionSummaryModal from '@/components/SessionSummaryModal';
import StartSessionModal from '@/components/StartSessionModal';
import { Gamepad2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Console configuration: 8 consoles total
// 5 consoles in common hall (1 PS3, 4 PS5)
// 3 consoles in private booths (all PS5)
const PS3_CONSOLES = [2]; // Console #2 is PS3 (in common hall)
const BOOTH_CONSOLES = [3, 6, 8]; // Console numbers that are in private booths

// Generate all 8 consoles with proper naming
const ALL_CONSOLES = Array.from({ length: 8 }, (_, i) => {
  const consoleNumber = i + 1;
  const isInBooth = BOOTH_CONSOLES.includes(consoleNumber);
  const isPS3 = PS3_CONSOLES.includes(consoleNumber);
  const consoleType: 'PS3' | 'PS5' = isPS3 ? 'PS3' : 'PS5';
  
  // Separate numbering for halls and cabins
  let name: string;
  if (isInBooth) {
    // For cabins: count only cabin consoles
    const cabinIndex = BOOTH_CONSOLES.indexOf(consoleNumber) + 1;
    name = `Кабина ${cabinIndex}`;
  } else {
    // For halls: count only hall consoles
    const hallConsoles = Array.from({ length: 8 }, (_, idx) => idx + 1)
      .filter(num => !BOOTH_CONSOLES.includes(num));
    const hallIndex = hallConsoles.indexOf(consoleNumber) + 1;
    name = `Зал ${hallIndex}`;
  }
  
  return {
    id: `PS${consoleNumber}`,
    name,
    type: isInBooth ? ('CABIN' as const) : ('COMMON_HALL' as const),
    consoleNumber,
    consoleType,
  };
});

// Separate into common hall (5 consoles) and booths (3 consoles)
const COMMON_HALL_STATIONS = ALL_CONSOLES.filter(
  (console) => console.type === 'COMMON_HALL'
);

const CABINS = ALL_CONSOLES.filter((console) => console.type === 'CABIN');

export default function Home() {
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [completedSession, setCompletedSession] = useState<Session | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [stoppingSessionId, setStoppingSessionId] = useState<string | null>(null);
  const [showStartSessionModal, setShowStartSessionModal] = useState(false);
  const [selectedStationForStart, setSelectedStationForStart] = useState<{
    id: string;
    name: string;
    type: 'COMMON_HALL' | 'CABIN';
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadActiveSessions();
    // Poll for active sessions every 5 seconds
    const interval = setInterval(loadActiveSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadActiveSessions = async () => {
    try {
      const sessions = await sessionsApi.getActive();
      setActiveSessions(sessions);
    } catch (error) {
      console.error('Failed to load active sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActiveSession = (stationId: string): Session | undefined => {
    const station = ALL_CONSOLES.find(s => s.id === stationId);
    const stationName = station?.name || stationId;
    return activeSessions.find(
      (s) => s.stationId === stationName && s.isActive,
    );
  };

  const getStationName = (stationId: string): string => {
    const station = ALL_CONSOLES.find(s => s.id === stationId);
    return station?.name || stationId;
  };

  const handleStart = async (
    type: 'COMMON_HALL' | 'CABIN',
    stationId: string,
    startTime?: string,
    durationMinutes?: number,
  ) => {
    try {
      const stationName = getStationName(stationId);
      // Send station name (e.g., "Зал 1", "Кабина 1") instead of ID (e.g., "PS1")
      const session = await sessionsApi.start({
        type,
        stationId: stationName,
        startTime,
        durationMinutes,
      });
      await loadActiveSessions();
      toast({
        title: "Сессия начата",
        description: `Сессия успешно начата для ${stationName}`,
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.response?.data?.message || 'Не удалось начать сессию',
        variant: "destructive",
      });
    }
  };

  const handleStartWithParams = (type: 'COMMON_HALL' | 'CABIN', stationId: string) => {
    const stationName = getStationName(stationId);
    setSelectedStationForStart({
      id: stationId,
      name: stationName,
      type,
    });
    setShowStartSessionModal(true);
  };

  const handleStartWithParamsSubmit = async (
    startTime: string | undefined,
    durationMinutes: number | undefined,
  ) => {
    if (!selectedStationForStart) return;

    await handleStart(
      selectedStationForStart.type,
      selectedStationForStart.id,
      startTime,
      durationMinutes,
    );

    setShowStartSessionModal(false);
    setSelectedStationForStart(null);
  };

  const handleStop = async (sessionId: string) => {
    setStoppingSessionId(sessionId);
    try {
      const session = await sessionsApi.stop({ sessionId });
      const totalBill = session.totalBill || 0;
      
      // Show summary modal immediately
      setShowSummaryModal(true);
      setCompletedSession(session);
      
      // Update active sessions in background (don't wait for it)
      loadActiveSessions();
      
      toast({
        title: "Сессия остановлена",
        description: `Сессия остановлена. Итого: ${totalBill.toFixed(2)} сом`,
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.response?.data?.message || 'Не удалось остановить сессию',
        variant: "destructive",
      });
    } finally {
      setStoppingSessionId(null);
    }
  };

  const handleAddItem = (session: Session) => {
    setSelectedSession(session);
    setShowAddItemModal(true);
  };

  const handleItemAdded = async () => {
    await loadActiveSessions();
    setShowAddItemModal(false);
    setSelectedSession(null);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12 mt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gamepad2 className="h-10 w-10 text-white" />
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
             Omerta
            </h1>
          </div>
          <p className="text-lg md:text-xl text-white/90 font-light">
            Отслеживание времени игры и денег для PS станций и кабин
          </p>
        </header>

        {/* Common Hall Stations */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-white/60"></span>
            Станции общего зала
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {COMMON_HALL_STATIONS.map((station) => {
              const activeSession = getActiveSession(station.id);
              const isStopping = activeSession && stoppingSessionId === activeSession.id;
              return (
                <StationCard
                  key={station.id}
                  station={station}
                  activeSession={activeSession}
                  isStopping={isStopping}
                  onStart={() => handleStart(station.type, station.id)}
                  onStartWithParams={() => handleStartWithParams(station.type, station.id)}
                  onStop={() => activeSession && handleStop(activeSession.id)}
                  onAddItem={() => activeSession && handleAddItem(activeSession)}
                />
              );
            })}
          </div>
        </section>

        {/* Private Cabins */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-white/60"></span>
            Приватные кабины
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {CABINS.map((cabin) => {
              const activeSession = getActiveSession(cabin.id);
              const isStopping = activeSession && stoppingSessionId === activeSession.id;
              return (
                <StationCard
                  key={cabin.id}
                  station={cabin}
                  activeSession={activeSession}
                  isStopping={isStopping}
                  onStart={() => handleStart(cabin.type, cabin.id)}
                  onStartWithParams={() => handleStartWithParams(cabin.type, cabin.id)}
                  onStop={() => activeSession && handleStop(activeSession.id)}
                  onAddItem={() => activeSession && handleAddItem(activeSession)}
                />
              );
            })}
          </div>
        </section>

        {/* Add Item Modal */}
        {showAddItemModal && selectedSession && (
          <AddItemModal
            session={selectedSession}
            onClose={() => {
              setShowAddItemModal(false);
              setSelectedSession(null);
            }}
            onItemAdded={handleItemAdded}
          />
        )}

        {/* Session Summary Modal */}
        {showSummaryModal && completedSession && (
          <SessionSummaryModal
            session={completedSession}
            onClose={() => {
              setShowSummaryModal(false);
              setCompletedSession(null);
            }}
          />
        )}

        {/* Start Session Modal */}
        {showStartSessionModal && selectedStationForStart && (
          <StartSessionModal
            stationName={selectedStationForStart.name}
            stationType={selectedStationForStart.type}
            onClose={() => {
              setShowStartSessionModal(false);
              setSelectedStationForStart(null);
            }}
            onStart={handleStartWithParamsSubmit}
          />
        )}
      </div>
    </div>
  );
}
