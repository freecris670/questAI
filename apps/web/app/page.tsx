import { MainHeader } from '@/components/layout/MainHeader';
import { MainFooter } from '@/components/layout/MainFooter';
import { HeroSection } from '@/components/landing/HeroSection';
import { QuestExamples } from '@/components/landing/QuestExamples';
import { QuestCreationForm } from '@/features/quests/components/QuestCreationForm';

export default function HomePage() {
  return (
    <div className="bg-[#F7F9FB] min-h-screen text-gray-800 flex flex-col">
      <MainHeader />
      <main className="container mx-auto max-w-[1200px] px-5 py-5 md:py-10 my-5 flex-grow pt-20">
        <HeroSection />
        <QuestCreationForm />
        <QuestExamples />
      </main>
      <MainFooter />
    </div>
  );
}
