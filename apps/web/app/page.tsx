"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MainHeader } from '@/components/layout/MainHeader';
import { MainFooter } from '@/components/layout/MainFooter';

// Временная иконка-заглушка. В идеале использовать библиотеку иконок, например lucide-react.
const PlaceholderIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.75 6.375C12.75 5.82292 12.5208 5.375 12 5.375C11.4792 5.375 11.25 5.82292 11.25 6.375V11.25H6.375C5.82292 11.25 5.375 11.4792 5.375 12C5.375 12.5208 5.82292 12.75 6.375 12.75H11.25V17.625C11.25 18.1771 11.4792 18.625 12 18.625C12.5208 18.625 12.75 18.1771 12.75 17.625V12.75H17.625C18.1771 12.75 18.625 12.5208 18.625 12C18.625 11.4792 18.1771 11.25 17.625 11.25H12.75V6.375Z" />
  </svg>
);

export default function HomePage() {
  const router = useRouter();

  const handleCreateQuest = () => {
    // TODO: Later, get quest description from Textarea and pass to API/generating page
    router.push('/quest/generating');
  };
  return (
    <div className="bg-[#F7F9FB] min-h-screen text-gray-800 flex flex-col">
      <MainHeader />
      {/* Основной контент - белая центральная панель, добавляем pt-20 для отступа от фиксированного хедера */} 
      <main className="container mx-auto max-w-[1200px] px-5 py-5 md:py-10 my-5 flex-grow pt-20">
        
        {/* Hero-секция */}
        <section className="text-center pt-8 pb-12 md:pt-12 md:pb-16">
          <h1 className="text-3xl sm:text-4xl md:text-[48px] font-semibold text-[#2553A1] !leading-tight">
            Создавайте квесты с помощью AI за секунды
          </h1>
          <p className="text-md sm:text-lg md:text-[20px] text-[#64748B] mt-4 max-w-xl md:max-w-2xl mx-auto">
            Превращайте любую задачу в увлекательное приключение
          </p>
        </section>

        {/* Форма создания квеста */}
        <section className="mb-12 md:mb-16">
          <div className="bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-6 md:p-8 rounded-lg max-w-2xl mx-auto">
            <Textarea
              placeholder="Опишите ваш квест..."
              className="h-[120px] border-[#E3E6EA] rounded-md focus:border-[#2553A1] resize-none w-full p-3 text-base"
            />
            <Button 
              onClick={handleCreateQuest}
              className="w-full h-[48px] bg-[#22B07D] hover:bg-[#22B07D]/90 text-white font-medium text-base rounded-md mt-6"
            >
              Создать квест
            </Button>
          </div>
        </section>

        {/* Секция примеров */}
        <section className="pb-8 pt-8 md:pb-12 md:pt-12">
          <h2 className="text-2xl md:text-[24px] font-medium text-[#2553A1] text-center mb-8 md:mb-12">
            Примеры квестов
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { title: "Квест по истории Древнего Рима", description: "Узнайте о гладиаторах, императорах и великих битвах." },
              { title: "Кулинарный квест: Итальянская кухня", description: "Научитесь готовить пасту и пиццу как настоящий шеф-повар." },
              { title: "Фитнес-вызов на 30 дней", description: "Приведите себя в форму с ежедневными заданиями и советами." },
            ].map((item, index) => (
              <div key={index} className="bg-white border border-[#E3E6EA] rounded-md p-6 hover:shadow-[0_4px_8px_rgba(0,0,0,0.1)] transition-shadow duration-200 flex flex-col">
                <div className="w-10 h-10 bg-[#2553A1]/10 rounded-lg flex items-center justify-center mb-4">
                   <PlaceholderIcon className="w-6 h-6 text-[#2553A1]" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">{item.title}</h3>
                <p className="text-sm text-[#64748B] flex-grow">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <MainFooter />
    </div>
  );
}
