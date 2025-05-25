import Link from 'next/link';

export const MainFooter = () => {
  return (
    <footer className="py-8 md:py-12 bg-quest-bg-light"> 
      <div className="container mx-auto max-w-[1200px] px-5">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-quest-gray-text text-sm mb-6">
          <Link href="/about" className="hover:text-quest-blue transition-colors">О сервисе</Link>
          <Link href="/contact" className="hover:text-quest-blue transition-colors">Контакты</Link>
          <Link href="/privacy" className="hover:text-quest-blue transition-colors">Политика конфиденциальности</Link>
        </div>
        <p className="text-xs text-slate-500 text-center">&copy; {new Date().getFullYear()} QuestAI. Все права защищены.</p>
      </div>
    </footer>
  );
};
