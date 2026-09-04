import RetroBackground from '@/components/RetroBackground';
import Chatbot from '@/components/Chatbot';

function App() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <RetroBackground />
      <main className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center py-12">
        <Chatbot />
      </main>
    </div>
  );
}

export default App;
