'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { isCloudinaryConfigured } from '@/lib/shoppics/cloudinary';
import { saveHistoryEntry, updateHistoryEntry, useHistoryEntries } from '@/lib/shoppics/history';
import type { Session } from '@/lib/shoppics/types';
import { ConfigNotice } from '@/components/shoppics/config-notice';
import { Footer } from '@/components/shoppics/footer';
import { HistoryDrawer } from '@/components/shoppics/history-drawer';
import { LandingView } from '@/components/shoppics/landing-view';
import { Navbar } from '@/components/shoppics/navbar';
import { ResultView } from '@/components/shoppics/result-view';
import { StudioView } from '@/components/shoppics/studio-view';

type View = 'landing' | 'studio' | 'result';

export default function Home() {
  const [view, setView] = useState<View>('landing');
  const [session, setSession] = useState<Session | null>(null);
  const [initialBackdropId, setInitialBackdropId] = useState<string | undefined>(undefined);
  const [historyOpen, setHistoryOpen] = useState(false);
  const historyEntries = useHistoryEntries();
  const configured = isCloudinaryConfigured();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [view]);

  const startStudio = useCallback(() => {
    setSession(null);
    setInitialBackdropId(undefined);
    setView('studio');
  }, []);

  const handleComplete = useCallback((s: Session) => {
    setSession(s);
    setInitialBackdropId(undefined);
    saveHistoryEntry({
      id: s.id,
      createdAt: s.createdAt,
      publicId: s.publicId,
      originalFilename: s.originalFilename,
      width: s.width,
      height: s.height,
      bytes: s.bytes,
      backdropId: s.rec.backdropId,
      rec: s.rec,
    });
    setView('result');
    toast.success('Studio shot ready ✨', {
      description: 'Studio Suggestion applied — tweak the look, then create your Seller Pack.',
    });
  }, []);

  const handleBackdropChange = useCallback(
    (backdropId: string) => {
      if (session) updateHistoryEntry(session.id, { backdropId });
    },
    [session],
  );

  const reopenHistory = useCallback((e: HistoryEntryLike) => {
    const s: Session = {
      id: e.id,
      publicId: e.publicId,
      originalFilename: e.originalFilename,
      width: e.width,
      height: e.height,
      bytes: e.bytes,
      rec: e.rec,
      createdAt: e.createdAt,
    };
    setSession(s);
    setInitialBackdropId(e.backdropId);
    setHistoryOpen(false);
    setView('result');
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#FBF9F4] text-stone-900 antialiased">
      <Navbar
        view={view}
        historyCount={historyEntries.length}
        onOpenHistory={() => setHistoryOpen(true)}
        onStart={startStudio}
        onHome={() => setView('landing')}
      />
      {!configured && <ConfigNotice />}

      {view === 'landing' && <LandingView onStart={startStudio} />}
      {view === 'studio' && <StudioView onComplete={handleComplete} onBack={() => setView('landing')} />}
      {view === 'result' && session && (
        <ResultView
          key={session.id}
          session={session}
          initialBackdropId={initialBackdropId}
          onNewPhoto={startStudio}
          onBackHome={() => setView('landing')}
          onBackdropChange={handleBackdropChange}
        />
      )}

      <Footer />

      <HistoryDrawer
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        entries={historyEntries}
        onReopen={reopenHistory}
      />
    </div>
  );
}

/** Local structural type for the history entry we reopen (avoids importing runtime values). */
interface HistoryEntryLike {
  id: string;
  createdAt: number;
  publicId: string;
  originalFilename: string;
  width: number;
  height: number;
  bytes: number;
  backdropId: string;
  rec: Session['rec'];
}
